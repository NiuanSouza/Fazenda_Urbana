import os
import re

files_to_patch = ["sensors.py", "production.py", "dashboard.py"]
for filename in files_to_patch:
    filepath = os.path.join("app/routes", filename)
    with open(filepath, "r") as f:
        content = f.read()

    # Replacing .all()
    content = re.sub(r'db\.query\((models\.[A-Za-z]+)\)\.all\(\)', r'db.query(\1).filter_by(fazenda_id=fazenda_id).all()', content)
    # Replacing .first() with filtering
    content = re.sub(r'db\.query\((models\.[A-Za-z]+)\)\.filter\(', r'db.query(\1).filter_by(fazenda_id=fazenda_id).filter(', content)
    
    # Adding fazenda_id to creation
    content = re.sub(r'(\w+)\s*=\s*models\.([A-Za-z]+)\(\*\*payload\.model_dump\(\)\)', r'\1 = models.\2(fazenda_id=fazenda_id, **payload.model_dump())', content)

    with open(filepath, "w") as f:
        f.write(content)

print("Filters applied to sensors, production, dashboard.")
