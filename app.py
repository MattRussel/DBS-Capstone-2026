import logging

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

from python.moderation import ModerationSystem
from python.retrieval import RAGRetriever
from python.screen_time import ScreenTimeManager

# SETUP LOGGING
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

log = logging.getLogger(__name__)

# INISIALISASI FLASK APP
app = Flask(__name__)

# CORS = Cross-Origin Resource Sharing
# Ini supaya frontend (misal localhost:3000)
# bisa akses API di localhost:5000

CORS(app)

# INISIALISASI KOMPONEN
# Semua di-load sekali saat server start,

log.info("Menginisialisasi komponen chatbot...")

retriever = RAGRetriever()  # Load model bge-m3 + koneksi TiDB
moderation = ModerationSystem()  # Load daftar toxic words
screen_time = ScreenTimeManager()  # Inisialisasi timer

log.info("Semua komponen berhasil dimuat! Server siap.")

# ENDPOINT: / (GET)
# Halaman utama — tampilkan chat interface


@app.route("/")
def index():
    """Serve halaman chat interface."""
    return render_template("index.html")


# ENDPOINT 1: /chat (POST)
# Endpoint utama chatbot


@app.route("/chat", methods=["POST"])
def chat():
    """
    === ENDPOINT UTAMA CHATBOT ===

    Request body (JSON):
    {
        "message": "Apa itu fotosintesis?",
        "session_id": "abc123"
    }

    Response (JSON):
    {
        "answer": "Fotosintesis adalah ...",
        "category": "tumbuhan hijau",
        "confidence": 0.92,
        "moderation": {
            "status": "safe",
            "strikes": 0
        },
        "screen_time": {
            "duration_minutes": 15.2,
            "reminder": null
        }
    }

    === ALUR PROSES ===
    1. Terima message + session_id dari user
    2. Cek moderasi
    3. Cek screen time
    4. RAG retrieval
    5. Return response
    """

    # AMBIL DATA DARI REQUEST
    data = request.get_json()

    # Validasi request
    if not data or "message" not in data:
        return jsonify(
            {
                "error": "Field 'message' wajib diisi"
            }
        ), 400

    message = data["message"].strip()
    session_id = data.get("session_id", "default")

    if not message:
        return jsonify(
            {
                "error": "Message tidak boleh kosong"
            }
        ), 400

    log.info(
        "[%s] Pesan masuk: %s",
        session_id,
        message,
    )

    try:

        # STEP 1: MODERATION CHEC     
        # Kalau toxic → stop proses

        mod_result = moderation.check(
            message,
            session_id,
        )

        if mod_result["status"] in ("warning", "cooldown"):

            log.info(
                "[%s] TOXIC terdeteksi! Status: %s",
                session_id,
                mod_result["status"],
            )

            return jsonify(
                {
                    "answer": mod_result["message"],
                    "category": None,
                    "confidence": 0.0,
                    "moderation": {
                        "status": mod_result["status"],
                        "strikes": mod_result["strikes"],
                    },
                    "screen_time": screen_time.check(
                        session_id
                    ),
                }
            )

        # STEP 2: SCREEN TIME CHECK
        screen_result = screen_time.check(
            session_id
        )

        # STEP 3: RAG RETRIEVAL
        #
        # Cari jawaban terbaik dari TiDB

        rag_result = retriever.get_best_answer(
            message
        )

        log.info(
            "[%s] Jawaban ditemukan | "
            "Topik: %s | "
            "Confidence: %.2f%%",
            session_id,
            rag_result["category"],
            rag_result["similarity_score"] * 100,
        )

        # STEP 4: RESPONSE
        response = {
            "answer": rag_result["answer"],
            "category": rag_result["category"],
            "confidence": rag_result["similarity_score"],
            "question_matched": (
                rag_result["question_matched"]
            ),
            "moderation": {
                "status": mod_result["status"],
                "strikes": mod_result["strikes"],
            },
            "screen_time": screen_result,
        }

        # TAMBAHKAN SCREEN TIME REMINDER
        if screen_result.get("reminder"):

            response["answer"] += (
                f"\n\n⏰ {screen_result['reminder']}"
            )

            if screen_result.get("suggestion"):

                response["answer"] += (
                    f"\n💡 {screen_result['suggestion']}"
                )

        return jsonify(response)

    except Exception as e:
        log.error(
            "[%s] Error saat proses chat: %s",
            session_id,
            str(e),
            exc_info=True,
        )
        return jsonify(
            {
                "error": f"Server error: {str(e)}",
                "answer": "Maaf, terjadi kesalahan di server. Coba lagi ya 😊",
                "category": None,
                "confidence": 0.0,
            }
        ), 500

# ENDPOINT 2: /moderation (POST)
# Cek toxic tanpa RAG


@app.route("/moderation", methods=["POST"])
def check_moderation():
    """
    Request:
    {
        "text": "kamu bodoh",
        "session_id": "abc123"
    }

    Response:
    {
        "status": "warning",
        "strikes": 1,
        "message": "..."
    }
    """

    data = request.get_json()

    if not data or "text" not in data:
        return jsonify(
            {
                "error": "Field 'text' wajib diisi"
            }
        ), 400

    text = data["text"].strip()
    session_id = data.get("session_id", "default")

    result = moderation.check(
        text,
        session_id,
    )

    return jsonify(result)


# ENDPOINT 3: /health (GET)
# Health check endpoint


@app.route("/health", methods=["GET"])
def health():
    """
    Health check endpoint.
    Digunakan untuk memastikan
    server masih aktif.
    """

    return jsonify(
        {
            "status": "healthy",
            "components": {
                "retriever": "loaded",
                "moderation": (
                    f"{len(moderation.toxic_phrases)} "
                    "toxic phrases loaded"
                ),
                "screen_time": "active",
            },
        }
    )


# MAIN ENTRY
# python app.py

if __name__ == "__main__":

    print("=" * 60)
    print("  🤖 Chatbot Edukasi IPA SD — RAG API")
    print("  📍 http://localhost:5000")
    print("  📚 Endpoints:")
    print("     POST /chat")
    print("     POST /moderation")
    print("     GET  /health")
    print("=" * 60)

    app.run(
        # Bisa diakses dari luar localhost
        host="0.0.0.0",
        port=5000,
        debug=False,
    )
