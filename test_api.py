"""Quick test script untuk API chatbot."""
import requests

BASE = "http://localhost:5000"

def test_endpoint(name, method, url, json_data=None):
    """Helper untuk test endpoint dengan error handling."""
    print(f"\n{'=' * 55}")
    print(f"TEST: {name}")
    print(f"{'=' * 55}")
    try:
        if method == "GET":
            r = requests.get(url, timeout=60)
        else:
            r = requests.post(url, json=json_data, timeout=60)

        print(f"Status Code: {r.status_code}")

        if r.status_code == 500:
            print(f"❌ SERVER ERROR!")
            print(f"Response: {r.text[:500]}")
            return None

        data = r.json()
        return data

    except requests.exceptions.ConnectionError:
        print("❌ Tidak bisa konek ke server. Pastikan app.py sudah jalan!")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"Raw response: {r.text[:500] if r else 'No response'}")
        return None


# Test 1: Health check
data = test_endpoint("Health Check", "GET", f"{BASE}/health")
if data:
    print(f"✅ Status: {data['status']}")
    print(f"   Components: {data['components']}")

# Test 2: Chat - pertanyaan IPA
data = test_endpoint(
    "Pertanyaan IPA",
    "POST",
    f"{BASE}/chat",
    {"message": "Apa itu fotosintesis?", "session_id": "test123"},
)
if data:
    if "error" in data:
        print(f"❌ Error: {data['error']}")
    else:
        print(f"✅ Jawaban:    {data.get('answer', 'N/A')[:120]}...")
        print(f"   Topik:      {data.get('category', 'N/A')}")
        print(f"   Confidence: {data.get('confidence', 'N/A')}")
        print(f"   Moderation: {data.get('moderation', 'N/A')}")

# Test 3: Chat - kata kasar (test moderation)
data = test_endpoint(
    "Kata Kasar (moderation strike 1)",
    "POST",
    f"{BASE}/chat",
    {"message": "dasar bodoh", "session_id": "test_mod"},
)
if data:
    print(f"✅ Jawaban:    {data.get('answer', 'N/A')}")
    print(f"   Moderation: {data.get('moderation', 'N/A')}")

# Test 4: Moderation endpoint
data = test_endpoint(
    "Moderation Only",
    "POST",
    f"{BASE}/moderation",
    {"text": "halo teman", "session_id": "test_safe"},
)
if data:
    print(f"✅ Status: {data.get('status', 'N/A')}")

print(f"\n{'=' * 55}")
print("Semua test selesai!")
print(f"{'=' * 55}")
