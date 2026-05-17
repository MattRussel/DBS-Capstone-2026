import csv
import logging
import re
from datetime import datetime
from datetime import timedelta

# LOGGING
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

log = logging.getLogger(__name__)


# CONFIG
TOXIC_DATASET_PATH = (
    "dataset/dataset_kata_kasar.csv"
)

COOLDOWN_MINUTES = 5


# LOAD DATASET
def load_toxic_words(
    csv_path: str,
) -> set:
    """
    Load toxic words dari CSV.
    """

    toxic_words = set()

    try:
        with open(
            csv_path,
            "r",
            encoding="utf-8",
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:
                text = row.get(
                    "text",
                    "",
                ).strip().lower()

                if text:
                    toxic_words.add(text)

        log.info(
            "Loaded %s kata toxic "
            "dari %s",
            len(toxic_words),
            csv_path,
        )

    except FileNotFoundError:
        log.error(
            "File tidak ditemukan: %s",
            csv_path,
        )

    return toxic_words


# TEXT NORMALIZATION
def normalize_leet(text: str) -> str:
    """
    Ubah leet speak jadi huruf normal.

    Contoh:
        b0d0h -> bodoh
    """

    leet_map = {
        "0": "o",
        "1": "i",
        "3": "e",
        "4": "a",
        "5": "s",
        "7": "t",
        "8": "b",
        "@": "a",
        "$": "s",
    }

    result = ""

    for char in text:
        result += leet_map.get(
            char,
            char,
        )

    return result


def clean_text(text: str) -> str:
    """
    Bersihkan text user.
    """

    text = text.lower().strip()

    text = re.sub(
        r"[^\w\s]",
        "",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    text = normalize_leet(text)

    return text


# MODERATION SYSTEM
class ModerationSystem:
    """
    Sistem moderasi toxic chat.
    """

    def __init__(
        self,
        toxic_csv_path: str = (
            TOXIC_DATASET_PATH
        ),
    ):
        """
        Initialize moderation system.
        """

        self.toxic_phrases = (
            load_toxic_words(
                toxic_csv_path
            )
        )

        self.toxic_words = set()

        for phrase in self.toxic_phrases:

            for word in phrase.split():

                cleaned = normalize_leet(
                    word
                )

                if len(cleaned) >= 3:
                    self.toxic_words.add(
                        cleaned
                    )

        log.info(
            "Extracted %s kata toxic unik",
            len(self.toxic_words),
        )

        self.sessions = {}

    # =====================================================
    # SESSION
    # =====================================================

    def _get_session(
        self,
        session_id: str,
    ) -> dict:
        """
        Ambil data session user.
        """

        if session_id not in self.sessions:

            self.sessions[session_id] = {
                "count": 0,
                "cooldown_until": None,
            }

        return self.sessions[session_id]

    def _is_on_cooldown(
        self,
        session_id: str,
    ) -> bool:
        """
        Cek apakah user sedang cooldown.
        """

        session = self._get_session(
            session_id
        )

        if session["cooldown_until"] is None:
            return False

        if (
            datetime.now()
            >= session["cooldown_until"]
        ):
            session["count"] = 0

            session["cooldown_until"] = None

            log.info(
                "Session %s cooldown selesai.",
                session_id,
            )

            return False

        return True

    # =====================================================
    # TOXIC CHECK
    # =====================================================

    def _check_toxic(
        self,
        text: str,
    ) -> dict:
        """
        Cek apakah text toxic.
        """

        cleaned = clean_text(text)

        # Exact phrase match
        if cleaned in self.toxic_phrases:

            return {
                "is_toxic": True,
                "matched": cleaned,
            }

        # Phrase containment
        for phrase in self.toxic_phrases:

            if (
                len(phrase.split()) >= 2
                and phrase in cleaned
            ):
                return {
                    "is_toxic": True,
                    "matched": phrase,
                }

        # Word-level match
        input_words = cleaned.split()

        for word in input_words:

            normalized = normalize_leet(
                word
            )

            if normalized in self.toxic_words:

                return {
                    "is_toxic": True,
                    "matched": normalized,
                }

        return {
            "is_toxic": False,
            "matched": None,
        }

    # =====================================================
    # MAIN CHECK
    # =====================================================

    def check(
        self,
        text: str,
        session_id: str,
    ) -> dict:
        """
        Main moderation function.
        """

        # =============================================
        # COOLDOWN CHECK
        # =============================================

        if self._is_on_cooldown(
            session_id
        ):
            session = self._get_session(
                session_id
            )

            remaining = (
                session["cooldown_until"]
                - datetime.now()
            ).seconds // 60 + 1

            log.info(
                "Session %s masih cooldown "
                "(%s menit lagi)",
                session_id,
                remaining,
            )

            return {
                "status": "cooldown",
                "strikes": session["count"],
                "message": (
                    "Kamu sedang istirahat "
                    "sebentar ya. "
                    f"Coba lagi dalam "
                    f"{remaining} menit 🕐"
                ),
                "matched": None,
            }

        # =============================================
        # TOXIC CHECK
        # =============================================

        result = self._check_toxic(
            text
        )

        if not result["is_toxic"]:

            session = self._get_session(
                session_id
            )

            return {
                "status": "safe",
                "strikes": session["count"],
                "message": None,
                "matched": None,
            }

        # =============================================
        # ADD STRIKE
        # =============================================

        session = self._get_session(
            session_id
        )

        session["count"] += 1

        strikes = session["count"]

        log.info(
            "Session %s toxic detected | "
            "matched='%s' | strike=%s/3",
            session_id,
            result["matched"],
            strikes,
        )

        # =============================================
        # STRIKE 3
        # =============================================

        if strikes >= 3:

            session["cooldown_until"] = (
                datetime.now()
                + timedelta(
                    minutes=COOLDOWN_MINUTES
                )
            )

            return {
                "status": "cooldown",
                "strikes": strikes,
                "message": (
                    f"Kamu sudah mendapat "
                    f"{strikes} peringatan. "
                    "Istirahat dulu ya "
                    f"selama "
                    f"{COOLDOWN_MINUTES} menit 🕐"
                ),
                "matched": result["matched"],
            }

        # =============================================
        # STRIKE 2
        # =============================================

        if strikes == 2:

            return {
                "status": "warning",
                "strikes": strikes,
                "message": (
                    "Kamu sudah mendapat "
                    "2 peringatan. "
                    "Yuk jaga kata-kata "
                    "supaya belajar lebih "
                    "menyenangkan 😊"
                ),
                "matched": result["matched"],
            }

        # =============================================
        # STRIKE 1
        # =============================================

        return {
            "status": "warning",
            "strikes": strikes,
            "message": (
                "Yuk gunakan bahasa "
                "yang lebih sopan ya 😊"
            ),
            "matched": result["matched"],
        }

    # =====================================================
    # RESET
    # =====================================================

    def reset_session(
        self,
        session_id: str,
    ):
        """
        Reset strike session.
        """

        if session_id in self.sessions:

            del self.sessions[session_id]

            log.info(
                "Session %s di-reset.",
                session_id,
            )

    def get_strikes(
        self,
        session_id: str,
    ) -> int:
        """
        Ambil jumlah strike.
        """

        return self._get_session(
            session_id
        )["count"]


# TEST
if __name__ == "__main__":

    print("=" * 60)
    print("Moderation System Test")
    print("=" * 60)

    moderation = ModerationSystem()

    test_session = "test_user_1"

    test_inputs = [
        (
            "Apa itu fotosintesis?",
            "safe",
        ),
        (
            "Bagaimana cara kerja jantung?",
            "safe",
        ),
        (
            "Terima kasih ya!",
            "safe",
        ),
        (
            "dasar bodoh",
            "strike 1",
        ),
        (
            "goblok banget",
            "strike 2",
        ),
        (
            "anjing kamu",
            "strike 3",
        ),
        (
            "Apa itu air?",
            "cooldown",
        ),
    ]

    for text, expected in test_inputs:

        print("\n" + "─" * 60)

        print(f"📝 Input    : {text}")

        print(f"🎯 Expected : {expected}")

        result = moderation.check(
            text,
            test_session,
        )

        print(
            f"📊 Status   : "
            f"{result['status']}"
        )

        print(
            f"⚡ Strikes  : "
            f"{result['strikes']}/3"
        )

        if result["message"]:

            print(
                f"💬 Message  : "
                f"{result['message']}"
            )

        if result["matched"]:

            print(
                f"🔍 Matched  : "
                f"{result['matched']}"
            )

    print("\n" + "=" * 60)
    print("Test selesai!")
    print("=" * 60)
