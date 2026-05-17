import logging
import random
from datetime import datetime
from datetime import timedelta


# LOGGING
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

log = logging.getLogger(__name__)


# ACTIVITY SUGGESTIONS
ACTIVITY_SUGGESTIONS = [
    "🏃 Coba lari-lari kecil di halaman ya!",
    "📖 Baca buku cerita favoritmu selama 10 menit!",
    "🎨 Yuk gambar atau mewarnai sesuatu!",
    "🌳 Main di luar rumah sebentar!",
    "💪 Lakukan peregangan badan!",
    "🥤 Minum air putih dulu ya!",
    "👨‍👩‍👧 Ceritakan ke orang tua "
    "apa yang sudah dipelajari hari ini!",
    "🧩 Main puzzle edukatif!",
    "✍️ Tulis hal menarik di buku catatan!",
    "🎵 Dengarkan lagu favoritmu sambil istirahat!",
]


# SCREEN TIME MANAGER
class ScreenTimeManager:
    """
    Melacak durasi belajar user.
    """

    def __init__(self):
        """
        Initialize session storage.
        """

        self.sessions = {}

    # SESSION
    def _get_session(
        self,
        session_id: str,
    ) -> dict:
        """
        Ambil atau buat session baru.
        """

        if session_id not in self.sessions:

            self.sessions[session_id] = {
                "start_time": datetime.now(),
                "reminded_20": False,
                "reminded_30": False,
            }

            log.info(
                "Session %s: timer dimulai.",
                session_id,
            )

        return self.sessions[session_id]

    # MAIN CHECK
    def check(
        self,
        session_id: str,
    ) -> dict:
        """
        Check durasi belajar.
        """

        session = self._get_session(
            session_id
        )

        duration = (
            datetime.now()
            - session["start_time"]
        ).total_seconds() / 60

        result = {
            "duration_minutes": round(
                duration,
                1,
            ),
            "reminder": None,
            "suggestion": None,
            "should_break": False,
        }

        # 30 MINUTES

        if (
            duration >= 30
            and not session["reminded_30"]
        ):
            session["reminded_30"] = True

            suggestion = random.choice(
                ACTIVITY_SUGGESTIONS
            )

            result["reminder"] = (
                "Kamu sudah belajar "
                "30 menit, hebat sekali! 🌟 "
                "Yuk istirahat sebentar "
                "supaya otak tetap segar."
            )

            result["suggestion"] = suggestion

            result["should_break"] = True

            log.info(
                "Session %s: 30-min reminder "
                "(durasi %.1f menit)",
                session_id,
                duration,
            )

        # 20 MINUTES

        elif (
            duration >= 20
            and not session["reminded_20"]
        ):
            session["reminded_20"] = True

            result["reminder"] = (
                "Sudah 20 menit belajar, "
                "kamu rajin sekali! 📚 "
                "Sebentar lagi waktunya "
                "istirahat ya."
            )

            log.info(
                "Session %s: 20-min reminder "
                "(durasi %.1f menit)",
                session_id,
                duration,
            )

        return result

    # RESET SESSION
    def reset_session(
        self,
        session_id: str,
    ):
        """
        Reset session timer.
        """

        if session_id in self.sessions:

            del self.sessions[session_id]

            log.info(
                "Session %s: timer di-reset.",
                session_id,
            )

    # GET DURATION
    def get_duration(
        self,
        session_id: str,
    ) -> float:
        """
        Ambil durasi belajar.
        """

        session = self._get_session(
            session_id
        )

        return (
            datetime.now()
            - session["start_time"]
        ).total_seconds() / 60


# DIRECT TEST
if __name__ == "__main__":

    print("=" * 60)
    print("Screen Time Manager Test")
    print("=" * 60)

    screen_time = ScreenTimeManager()

    test_session = "test_user_1"

    # Simulasi timer
    screen_time._get_session(
        test_session
    )

    test_scenarios = [
        (
            0,
            "Baru mulai",
        ),
        (
            15,
            "15 menit",
        ),
        (
            20,
            "20 menit",
        ),
        (
            25,
            "25 menit",
        ),
        (
            30,
            "30 menit",
        ),
        (
            35,
            "35 menit",
        ),
    ]

    for minutes, description in test_scenarios:

        print("\n" + "─" * 60)

        print(
            f"⏱️ Skenario : "
            f"{description}"
        )

        screen_time.sessions[
            test_session
        ]["start_time"] = (
            datetime.now()
            - timedelta(
                minutes=minutes
            )
        )

        screen_time.sessions[
            test_session
        ]["reminded_20"] = False

        screen_time.sessions[
            test_session
        ]["reminded_30"] = False

        result = screen_time.check(
            test_session
        )

        print(
            f"📊 Durasi   : "
            f"{result['duration_minutes']} menit"
        )

        print(
            f"⏸️ Break?   : "
            f"{result['should_break']}"
        )

        if result["reminder"]:

            print(
                f"💬 Reminder : "
                f"{result['reminder']}"
            )

        if result["suggestion"]:

            print(
                f"🎯 Saran    : "
                f"{result['suggestion']}"
            )

        if not result["reminder"]:

            print(
                "✅ Tidak ada reminder"
            )

    print("\n" + "=" * 60)
    print("Test selesai!")
    print("=" * 60)
