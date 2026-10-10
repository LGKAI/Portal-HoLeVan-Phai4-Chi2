import urllib.request
import json
import os
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

API_BASE = "https://portal-holevan-phai4-chi2.onrender.com/api"

def fetch_json(endpoint):
    url = f"{API_BASE}/{endpoint}"
    print(f"Fetching from {url}...")
    req = urllib.request.Request(url, headers={"User-Agent": "SyncScript/1.0"})
    with urllib.request.urlopen(req, timeout=45) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        if isinstance(data, dict) and 'data' in data:
            return data['data']
        return data

def main():
    members = fetch_json("members")
    memorials = fetch_json("memorials")
    news = fetch_json("news")

    print(f"Fetched {len(members)} members, {len(memorials)} memorials, {len(news)} news.")

    # Paths to save
    targets = {
        "members": [
            "backend/src/data/members.json",
            "frontend/src/data/members.json",
            "rag-service/data/members.json"
        ],
        "memorials": [
            "frontend/src/data/memorials.json"
        ],
        "news": [
            "backend/src/data/news.json",
            "frontend/src/data/news.json"
        ]
    }

    # Identify new members compared to backend/src/data/members.json
    local_members_path = "backend/src/data/members.json"
    if os.path.exists(local_members_path):
        with open(local_members_path, 'r', encoding='utf-8') as f:
            old_members = json.load(f)
        old_ids = {m['id'] for m in old_members}
        new_members = [m for m in members if m['id'] not in old_ids]
        print(f"\n--- {len(new_members)} THÀNH VIÊN MỚI ĐƯỢC THÊM ---")
        for m in new_members:
            print(f"- ID {m.get('id')}: {m.get('full_name')} (Giới tính: {m.get('gender')}, Đời: {m.get('generation_in_branch')}, Cha: {m.get('father_id')}, Mẹ: {m.get('mother_id')}, Phối ngẫu: {m.get('spouse_id')})")

    # Write members
    for p in targets["members"]:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(members, f, ensure_ascii=False, indent=2)
        print(f"Saved: {p} ({len(members)} records)")

    # Write memorials
    for p in targets["memorials"]:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(memorials, f, ensure_ascii=False, indent=2)
        print(f"Saved: {p} ({len(memorials)} records)")

    # Write news
    for p in targets["news"]:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(news, f, ensure_ascii=False, indent=2)
        print(f"Saved: {p} ({len(news)} records)")

if __name__ == "__main__":
    main()
