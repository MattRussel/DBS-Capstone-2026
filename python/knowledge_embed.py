import os
import logging
import pandas as pd
import mysql.connector
from mysql.connector import Error
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

# Load environment variables
load_dotenv("config.env")

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 4000)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "ssl_disabled": False,
    "connection_timeout": 60,
}

CSV_PATH = "dataset/dataclean_revisi.csv"
BATCH_SIZE = 32

# Cek env variable
for key in ("DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"):
    if not os.getenv(key):
        raise EnvironmentError(
            f"Environment variable '{key}' belum diset di config.env"
        )

log.info(f"Konek ke host: {os.getenv('DB_HOST')}")


def reconnect():
    """Buat koneksi baru ke TiDB."""
    log.info("Membuat koneksi baru ke TiDB ...")
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor()
    log.info("Koneksi berhasil.")
    return conn, cur


def get_already_done(cursor) -> int:
    """Cek berapa baris yang sudah tersimpan (untuk resume)."""
    cursor.execute("SELECT COUNT(*) FROM knowledge")
    return cursor.fetchone()[0]


def build_content(row: pd.Series) -> str:
    """Gabungkan 4 kolom teks jadi satu string untuk embedding."""
    parts = [
        str(row.get("soal", "")).strip(),
        str(row.get("jawaban", "")).strip(),
        str(row.get("contoh", "")).strip(),
        str(row.get("konteks", "")).strip(),
    ]
    return " ".join(p for p in parts if p and p.lower() != "nan")


def format_embedding(embedding_list: list) -> str:
    """Format embedding ke '[val1,val2,...]' untuk TiDB VECTOR."""
    return "[" + ",".join(f"{v:.8f}" for v in embedding_list) + "]"


def main():
    # Tahap 1: Load model
    log.info("Memuat model BAAI/bge-m3 ...")
    embedder = SentenceTransformer("BAAI/bge-m3")
    log.info("Model berhasil dimuat.")

    # Tahap 2: Baca CSV
    log.info(f"Membaca file: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)

    required_cols = {"soal", "jawaban", "topik"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Kolom tidak ditemukan di CSV: {missing}")

    for col in ("soal", "jawaban", "contoh", "konteks"):
        if col in df.columns:
            df[col] = df[col].fillna("").astype(str).str.strip()

    for col in ("topik", "subtopik", "jenis_pertanyaan", "kompleksitas"):
        if col in df.columns:
            df[col] = df[col].fillna("").astype(str).str.strip()

    log.info(
        f"Total baris CSV: {len(df)} | Topik unik: {df['topik'].nunique()}"
    )

    # Tahap 3: Koneksi awal
    try:
        db, curr = reconnect()
    except Error as e:
        log.error(f"Gagal konek ke TiDB: {e}")
        raise

    # Resume: skip baris yang sudah tersimpan
    already_done = get_already_done(curr)
    log.info(
        f"Sudah tersimpan: {already_done} baris. "
        f"Melanjutkan dari baris {already_done + 1} ..."
    )

    df_remaining = df.iloc[already_done:].reset_index(drop=True)
    total_success = already_done
    total_rows = len(df)

    if len(df_remaining) == 0:
        log.info("Semua data sudah tersimpan!")
        curr.close()
        db.close()
        return

    sql_query = """
        INSERT INTO knowledge
            (soal, jawaban, contoh, konteks,
             topik, subtopik, jenis_pertanyaan, kompleksitas,
             content, embedding)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    # Tahap 4: Proses per batch
    for batch_start in range(0, len(df_remaining), BATCH_SIZE):
        batch_df = df_remaining.iloc[batch_start:batch_start + BATCH_SIZE]
        contents = [build_content(row) for _, row in batch_df.iterrows()]

        end_row = min(total_success + len(batch_df), total_rows)
        log.info(
            f"Embedding baris {total_success + 1}-{end_row} "
            f"dari {total_rows} ..."
        )

        embeddings = embedder.encode(
            contents,
            batch_size=BATCH_SIZE,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        # Ping / reconnect otomatis sebelum insert
        try:
            db.ping(reconnect=True, attempts=5, delay=3)
            curr = db.cursor()
        except Exception as e:
            log.warning(f"Ping gagal ({e}), reconnecting ...")
            db, curr = reconnect()

        for i, (_, row) in enumerate(batch_df.iterrows()):
            try:
                curr.execute(sql_query, (
                    row.get("soal", ""),
                    row.get("jawaban", ""),
                    row.get("contoh", ""),
                    row.get("konteks", ""),
                    row.get("topik", ""),
                    row.get("subtopik", ""),
                    row.get("jenis_pertanyaan", ""),
                    row.get("kompleksitas", ""),
                    contents[i],
                    format_embedding(embeddings[i].tolist()),
                ))
                total_success += 1
                log.info(
                    f"  Baris {total_success} "
                    f"[{row.get('topik', '')}]: berhasil."
                )
            except Exception as e:
                log.error(f"  Baris gagal: {e}")

        # Commit per batch dengan reconnect jika gagal
        try:
            db.commit()
            log.info(
                f"  Batch di-commit. "
                f"({total_success}/{total_rows} total berhasil)"
            )
        except Exception as e:
            log.error(f"  Commit gagal: {e} - reconnecting ...")
            try:
                db, curr = reconnect()
            except Exception as e2:
                log.error(f"  Reconnect gagal: {e2}")

    # Tahap 5: Tutup koneksi
    try:
        curr.close()
        db.close()
    except Exception:
        pass

    log.info("=" * 55)
    log.info(
        f"Selesai! {total_success} dari {total_rows} baris berhasil disimpan."
    )
    log.info("=" * 55)


if __name__ == "__main__":
    main()