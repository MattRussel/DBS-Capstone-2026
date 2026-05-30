import csv
import json
import logging
import os
import random
import re
from datetime import datetime, timedelta

import mysql.connector
import numpy as np
import tensorflow as tf
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from tensorflow.keras import losses

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

load_dotenv("config.env")

DB_CONFIG = {
    "host":               os.getenv("DB_HOST"),
    "port":               int(os.getenv("DB_PORT", 4000)),
    "user":               os.getenv("DB_USER"),
    "password":           os.getenv("DB_PASSWORD"),
    "database":           os.getenv("DB_NAME"),
    "ssl_disabled":       False,
    "connection_timeout": 60,
}


# ---------------------------------------------------------------------------
# Custom Keras objects merekonstruksi arsitektur + compile config
# dari file .keras.
# ---------------------------------------------------------------------------

@tf.keras.saving.register_keras_serializable()
class AttentionPooling(tf.keras.layers.Layer):
    def build(self, input_shape):
        self.attention_weights = self.add_weight(
            name="attention_weights",
            shape=(input_shape[-1],),
            initializer="glorot_uniform",
            trainable=True,
        )
        super().build(input_shape)

    def call(self, inputs):
        scores = tf.tensordot(inputs, self.attention_weights, axes=[[2], [0]])
        scores = tf.nn.softmax(scores, axis=-1)
        return tf.reduce_sum(inputs * tf.expand_dims(scores, -1), axis=1)

    def get_config(self):
        return super().get_config()


@tf.keras.saving.register_keras_serializable()
class FocalLoss(losses.Loss):
    def __init__(self, gamma=2.0, alpha=0.25, **kwargs):
        kwargs.pop("dtype", None)
        super().__init__(**kwargs)
        self.gamma = gamma
        self.alpha = alpha

    def call(self, y_true, y_pred):
        n  = tf.shape(y_pred)[-1]
        oh = tf.one_hot(tf.cast(y_true, tf.int32), n)
        ce = -oh * tf.math.log(y_pred + 1e-7)
        w  = self.alpha * tf.pow(1.0 - y_pred, self.gamma)
        return tf.reduce_mean(tf.reduce_sum(w * ce, axis=-1))

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"gamma": self.gamma, "alpha": self.alpha})
        return cfg


@tf.keras.saving.register_keras_serializable()
class OneHotMAE(losses.Loss):
    """MAE antara label one-hot dan probabilitas prediksi."""

    def __init__(self, name="mae", **kwargs):
        kwargs.pop("dtype", None)
        super().__init__(name=name, **kwargs)

    def call(self, y_true, y_pred):
        return tf.reduce_mean(tf.abs(y_true - y_pred), axis=-1)

    def get_config(self):
        return super().get_config()


# ---------------------------------------------------------------------------
# Helpers moderation
# ---------------------------------------------------------------------------

def normalize_leet(text):
    leet = {"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s"}
    return "".join(leet.get(c, c) for c in text)


def clean_text_mod(text):
    text = re.sub(r"[^\w\s]", "", text.lower().strip())
    return normalize_leet(re.sub(r"\s+", " ", text))


def load_toxic_words(csv_path):
    words = set()
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                w = row.get("text", "").strip().lower()
                if w:
                    words.add(w)
    except FileNotFoundError:
        log.warning("File toxic tidak ditemukan: %s", csv_path)
    return words


# ---------------------------------------------------------------------------
# ModerationSystem
# ---------------------------------------------------------------------------

class ModerationSystem:
    COOLDOWN_MINUTES = 5

    def __init__(self, toxic_csv="dataset/dataset_kata_kasar.csv"):
        self.toxic_phrases = load_toxic_words(toxic_csv)
        self.toxic_words   = {
            normalize_leet(w)
            for p in self.toxic_phrases
            for w in p.split()
            if len(normalize_leet(w)) >= 3
        }
        self.sessions = {}

    def _get_session(self, sid):
        if sid not in self.sessions:
            self.sessions[sid] = {"count": 0, "cooldown_until": None}
        return self.sessions[sid]

    def _is_on_cooldown(self, sid):
        s = self._get_session(sid)
        if s["cooldown_until"] is None:
            return False
        if datetime.now() >= s["cooldown_until"]:
            s["count"] = 0
            s["cooldown_until"] = None
            return False
        return True

    def _is_toxic(self, text):
        c = clean_text_mod(text)
        if c in self.toxic_phrases:
            return {"is_toxic": True, "matched": c}
        for p in self.toxic_phrases:
            if len(p.split()) >= 2 and p in c:
                return {"is_toxic": True, "matched": p}
        for w in c.split():
            if normalize_leet(w) in self.toxic_words:
                return {"is_toxic": True, "matched": normalize_leet(w)}
        return {"is_toxic": False, "matched": None}

    def check(self, text, sid):
        if self._is_on_cooldown(sid):
            s   = self._get_session(sid)
            rem = max(1, (s["cooldown_until"] - datetime.now()).seconds // 60 + 1)
            return {
                "status":  "cooldown",
                "strikes": s["count"],
                "matched": None,
                "message": f"Coba lagi dalam {rem} menit 🕐",
            }

        r = self._is_toxic(text)
        s = self._get_session(sid)

        if not r["is_toxic"]:
            return {"status": "safe", "strikes": s["count"], "message": None, "matched": None}

        s["count"] += 1
        k = s["count"]

        if k >= 3:
            s["cooldown_until"] = datetime.now() + timedelta(minutes=self.COOLDOWN_MINUTES)
            return {
                "status":  "cooldown",
                "strikes": k,
                "matched": r["matched"],
                "message": f"Istirahat dulu {self.COOLDOWN_MINUTES} menit ya 🕐",
            }
        if k == 2:
            return {
                "status":  "warning",
                "strikes": 2,
                "matched": r["matched"],
                "message": "Sudah 2 peringatan. Yuk jaga kata-katanya ya 😊",
            }
        return {
            "status":  "warning",
            "strikes": 1,
            "matched": r["matched"],
            "message": "Yuk gunakan bahasa yang lebih sopan ya 😊",
        }


# ---------------------------------------------------------------------------
# ScreenTimeManager
# ---------------------------------------------------------------------------

ACTIVITY_SUGGESTIONS = [
    "🏃 Coba lari-lari kecil di halaman ya!",
    "📖 Baca buku cerita favoritmu 10 menit!",
    "🎨 Yuk gambar atau mewarnai sesuatu!",
    "💪 Lakukan peregangan badan!",
]


class ScreenTimeManager:
    def __init__(self):
        self.sessions = {}

    def _get_session(self, sid):
        if sid not in self.sessions:
            self.sessions[sid] = {
                "start_time":   datetime.now(),
                "reminded_20":  False,
                "reminded_30":  False,
            }
        return self.sessions[sid]

    def check(self, sid):
        s = self._get_session(sid)
        d = (datetime.now() - s["start_time"]).total_seconds() / 60
        r = {
            "duration_minutes": round(d, 1),
            "reminder":         None,
            "suggestion":       None,
            "should_break":     False,
        }

        if d >= 30 and not s["reminded_30"]:
            s["reminded_30"] = True
            r.update({
                "reminder":     "Sudah 30 menit belajar! 🌟 Istirahat sebentar ya.",
                "suggestion":   random.choice(ACTIVITY_SUGGESTIONS),
                "should_break": True,
            })
        elif d >= 20 and not s["reminded_20"]:
            s["reminded_20"] = True
            r["reminder"] = "Sudah 20 menit! 📚 Sebentar lagi waktunya istirahat ya."

        return r


# ---------------------------------------------------------------------------
# RAGRetriever (TiDB Vector)
# ---------------------------------------------------------------------------

class RAGRetriever:
    def __init__(self):
        self.embedder = SentenceTransformer("BAAI/bge-m3")
        self.db       = None
        self.cursor   = None
        self._connect()

    def _connect(self):
        self.db     = mysql.connector.connect(**DB_CONFIG)
        self.cursor = self.db.cursor(dictionary=True)

    def _ensure_connection(self):
        try:
            self.db.ping(reconnect=True, attempts=3, delay=2)
            self.cursor = self.db.cursor(dictionary=True)
        except Exception:
            self._connect()

    def get_best_answer(self, query, threshold=0.5):
        emb     = self.embedder.encode(query, normalize_embeddings=True)
        emb_str = "[" + ",".join(f"{v:.8f}" for v in emb.tolist()) + "]"

        self._ensure_connection()
        self.cursor.execute(
            """
            SELECT soal, jawaban, topik, subtopik, contoh, konteks,
                   VEC_COSINE_DISTANCE(embedding, %s) AS distance
            FROM knowledge
            ORDER BY distance ASC
            LIMIT 1
            """,
            (emb_str,),
        )
        results = self.cursor.fetchall()

        if not results or results[0]["distance"] > threshold:
            return {
                "answer":            "Maaf, pertanyaan itu belum ada di pengetahuan saya 😊",
                "category":          None,
                "subtopik":          "",
                "question_matched":  None,
                "similarity_score":  0.0,
            }

        best = results[0]
        return {
            "answer":           best["jawaban"],
            "category":         best["topik"],
            "subtopik":         best.get("subtopik", ""),
            "question_matched": best["soal"],
            "similarity_score": round(1 - best["distance"], 4),
        }


# ---------------------------------------------------------------------------
# Load semua artefak saat startup
# ---------------------------------------------------------------------------

print("Loading model TensorFlow ...")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

tf_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, "semantic_faq_model.keras"),
    custom_objects={
        "AttentionPooling": AttentionPooling,
        "FocalLoss":        FocalLoss,
        "OneHotMAE":        OneHotMAE,
    }
)

with open(os.path.join(BASE_DIR, "label_mapping.json")) as f:
    label_map = {int(k): v for k, v in json.load(f).items()}

retriever  = RAGRetriever()
moderator  = ModerationSystem()
screen_mgr = ScreenTimeManager()

print("Semua komponen berhasil di-load ✔")


# ---------------------------------------------------------------------------
# FastAPI
# ---------------------------------------------------------------------------

app = FastAPI(title="Chatbot IPA SD", version="2.0")


class ChatRequest(BaseModel):
    message:    str
    session_id: str = "default"


class ModerationRequest(BaseModel):
    text:       str
    session_id: str = "default"


@app.get("/")
def root():
    return {"message": "Chatbot IPA SD API aktif", "docs": "/docs"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "components": {
            "tf_model":   "loaded",
            "tidb":       "connected",
            "moderation": "active",
            "screen_time": "active",
        },
        "jumlah_kelas": len(label_map),
    }


@app.post("/chat")
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=422, detail="pesan kosong")

    # 1. Moderasi dulu sebelumn lanjut
    mod_result = moderator.check(req.message, req.session_id)
    if mod_result["status"] == "cooldown":
        return {
            "answer":          mod_result["message"],
            "moderation":      mod_result,
            "category":        None,
            "predicted_topic": None,
            "tf_confidence":   0.0,
            "similarity_score": 0.0,
            "question_matched": None,
        }

    # 2. Prediksi topik pakai model TF
    pred            = tf_model.predict(tf.constant([req.message], dtype=tf.string), verbose=0)
    idx             = int(np.argmax(pred))
    predicted_topic = label_map[idx]
    tf_confidence   = float(np.max(pred))

    # 3. Ambil jawaban dari TiDB (RAG)
    result = retriever.get_best_answer(req.message)

    # 4. Cek screen time
    st     = screen_mgr.check(req.session_id)
    answer = result["answer"]
    if st["reminder"]:
        answer += f"\n\n⏰ {st['reminder']}"

    return {
        "answer":           answer,
        "category":         result["category"],
        "subtopik":         result.get("subtopik", ""),
        "predicted_topic":  predicted_topic,
        "tf_confidence":    tf_confidence,
        "similarity_score": result["similarity_score"],
        "question_matched": result.get("question_matched"),
        "moderation":       mod_result,
        "screen_time":      st,
    }


@app.post("/moderation")
def check_moderation(req: ModerationRequest):
    return moderator.check(req.text, req.session_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)