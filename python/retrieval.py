import logging
import os

import mysql.connector
from dotenv import load_dotenv
from mysql.connector import Error
from sentence_transformers import SentenceTransformer

# LOGGING
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

log = logging.getLogger(__name__)

# LOAD ENVIRONMENT VARIABLES
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


# HELPER

def format_embedding(embedding_list: list[float]) -> str:
    """
    Convert embedding list → format string TiDB.

    Example:
        [0.123, -0.456]

    Becomes:
        "[0.12300000,-0.45600000]"
    """

    return "[" + ",".join(
        f"{value:.8f}" for value in embedding_list
    ) + "]"


# RAG RETRIEVER

class RAGRetriever:
    """
    Main retrieval engine.

    Responsibilities:
    - Load embedding model
    - Connect to TiDB
    - Retrieve similar knowledge
    """

    def __init__(self):
        """
        Initialize retriever.

        Loads:
        - embedding model
        - database connection
        """

        log.info(
            "Memuat model embedding "
            "BAAI/bge-m3..."
        )

        self.embedder = SentenceTransformer(
            "BAAI/bge-m3"
        )

        log.info("Model embedding berhasil dimuat.")

        self.db = None
        self.cursor = None

        self._connect()

    # DATABASE

    def _connect(self):
        """
        Connect to TiDB database.
        """

        try:
            self.db = mysql.connector.connect(
                **DB_CONFIG
            )

            self.cursor = self.db.cursor(
                dictionary=True
            )

            log.info(
                "Koneksi ke TiDB berhasil."
            )

        except Error as error:
            log.error(
                "Gagal konek ke TiDB: %s",
                error,
            )
            raise

    def _ensure_connection(self):
        """
        Ensure DB connection still alive.
        """

        try:
            self.db.ping(
                reconnect=True,
                attempts=3,
                delay=2,
            )

            self.cursor = self.db.cursor(
                dictionary=True
            )

        except Exception:
            log.warning(
                "Koneksi terputus. "
                "Mencoba reconnect..."
            )

            self._connect()

    # RETRIEVAL

    def retrieve(
        self,
        query: str,
        top_k: int = 3,
    ) -> list[dict]:
        """
        Retrieve most relevant knowledge.

        Parameters:
            query:
                User question

            top_k:
                Number of retrieved results

        Returns:
            List of relevant results
        """

        log.info(
            "Mencari jawaban untuk: '%s'",
            query,
        )

        # STEP 1 — EMBEDDING

        query_embedding = self.embedder.encode(
            query,
            normalize_embeddings=True,
        )

        embedding_str = format_embedding(
            query_embedding.tolist()
        )

        # STEP 2 — SEARCH VECTOR DB

        self._ensure_connection()

        sql = """
            SELECT
                soal,
                jawaban,
                topik,
                contoh,
                konteks,
                VEC_COSINE_DISTANCE(
                    embedding,
                    %s
                ) AS distance
            FROM knowledge
            ORDER BY distance ASC
            LIMIT %s
        """

        self.cursor.execute(
            sql,
            (
                embedding_str,
                top_k,
            ),
        )

        results = self.cursor.fetchall()

        for result in results:
            log.info(
                "[%s] distance=%.4f | soal=%s",
                result["topik"],
                result["distance"],
                result["soal"][:60],
            )

        return results

    # BEST ANSWER

    def get_best_answer(
        self,
        query: str,
        threshold: float = 0.5,
    ) -> dict:
        """
        Get single best answer.

        Parameters:
            query:
                User question

            threshold:
                Max distance allowed

        Returns:
            Dict result
        """

        results = self.retrieve(
            query=query,
            top_k=1,
        )

        # NO RESULT

        if not results:
            return {
                "answer": (
                    "Maaf, saya belum menemukan "
                    "jawaban yang cocok 😊"
                ),
                "category": None,
                "question_matched": None,
                "similarity_score": 0.0,
                "contoh": "",
                "konteks": "",
            }

        best = results[0]

        distance = best["distance"]

        # RELEVANT RESULT

        if distance <= threshold:
            similarity_score = 1 - distance

            log.info(
                "Jawaban ditemukan | "
                "score=%.2f | topik=%s",
                similarity_score,
                best["topik"],
            )

            return {
                "answer": best["jawaban"],
                "category": best["topik"],
                "question_matched": best["soal"],
                "similarity_score": round(
                    similarity_score,
                    4,
                ),
                "contoh": best.get(
                    "contoh",
                    "",
                ),
                "konteks": best.get(
                    "konteks",
                    "",
                ),
            }

        # FALLBACK

        log.info(
            "Tidak ada jawaban relevan "
            "| distance=%.4f "
            "| threshold=%.2f",
            distance,
            threshold,
        )

        return {
            "answer": (
                "Maaf, pertanyaan itu belum "
                "ada di pengetahuan saya 😊\n\n"
                "Coba tanyakan topik IPA seperti:\n"
                "- fotosintesis\n"
                "- pencernaan\n"
                "- adaptasi makhluk hidup\n"
                "- energi\n"
                "- gaya"
            ),
            "category": None,
            "question_matched": None,
            "similarity_score": 0.0,
            "contoh": "",
            "konteks": "",
        }

    # CLOSE

    def close(self):
        """
        Close DB connection safely.
        """

        try:
            if self.cursor:
                self.cursor.close()

            if self.db:
                self.db.close()

            log.info(
                "Koneksi database ditutup."
            )

        except Exception:
            pass


# DIRECT TEST
if __name__ == "__main__":

    print("=" * 60)
    print("RAG Retrieval Test")
    print("=" * 60)

    retriever = RAGRetriever()

    test_questions = [
        "Apa itu fotosintesis?",
        "Bagaimana sistem pencernaan manusia?",
        "Mengapa pelangi muncul?",
        "Apa contoh adaptasi hewan?",
        "Siapa presiden Indonesia?",
    ]

    for question in test_questions:

        print("\n" + "─" * 60)

        print(f"❓ Pertanyaan : {question}")

        result = retriever.get_best_answer(
            question
        )

        print(
            f"📚 Topik      : "
            f"{result['category']}"
        )

        print(
            f"💡 Jawaban    : "
            f"{result['answer'][:120]}"
        )

        print(
            f"🎯 Similarity : "
            f"{result['similarity_score']:.2%}"
        )

    retriever.close()

    print("\n" + "=" * 60)
    print("Test selesai!")
    print("=" * 60)
