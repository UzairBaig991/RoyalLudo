import re

metadata_path = r'C:/Users/Hp/.gemini/antigravity/brain/6b940f53-0764-4116-8827-96e86c004f9e/.system_generated/steps/2011/output.txt'

with open(metadata_path, 'r', encoding='utf-8') as f:
    text = f.read()

top_frames = list(re.finditer(r'<frame id="(2:\d+)" name="(\d\d · [^"]+)"', text))
print(f"Total top-level screens found: {len(top_frames)}")

results = []

for i, m in enumerate(top_frames):
    start = m.start()
    end = top_frames[i+1].start() if i+1 < len(top_frames) else len(text)
    chunk = text[start:end]
    node_id = m.group(1)
    name = m.group(2)
    
    # Extract text items
    texts = re.findall(r'<text id="[^"]+" name="([^"]+)"', chunk)
    # Filter out clock e.g. "9:41"
    filtered_texts = [t for t in texts if t != "9:41"]
    
    # Extract subframes/buttons
    subframes = re.findall(r'<frame id="[^"]+" name="([^"]+)"', chunk)
    key_subframes = [s for s in subframes if not s.startswith("Path cell") and not s in ("Screen content", name)]
    
    results.append({
        "id": node_id,
        "name": name,
        "texts": filtered_texts,
        "frames": key_subframes
    })

with open("scripts/screens_summary.txt", "w", encoding="utf-8") as out:
    for r in results:
        out.write(f"=== {r['name']} ({r['id']}) ===\n")
        out.write(f"Texts: {r['texts']}\n")
        out.write(f"Key Frames: {r['frames'][:15]}\n\n")

print("Saved screens_summary.txt")
