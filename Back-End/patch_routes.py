import os
import re

routes_dir = "app/routes"
files = [
    "batches.py", "customers.py", "dashboard.py", "energy.py", 
    "inputs.py", "irrigation.py", "notifications.py", "production.py", 
    "products.py", "sales.py", "sensors.py", "suppliers.py"
]

for filename in files:
    filepath = os.path.join(routes_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, "r") as f:
        content = f.read()
        
    if "get_current_fazenda_id" not in content:
        content = content.replace("from app.routes.auth import get_current_user", "from app.routes.auth import get_current_user, get_current_fazenda_id")
        
    content = re.sub(r'_\s*=\s*Depends\(get_current_user\)', 'fazenda_id: int = Depends(get_current_fazenda_id)', content)
    content = re.sub(r'current_user:\s*models\.Usuario\s*=\s*Depends\(get_current_user\)', 'fazenda_id: int = Depends(get_current_fazenda_id)', content)
    
    # We will use simple regex to append .filter(models.X.fazenda_id == fazenda_id)
    # This is a bit hacky but works for standard sqlalchemy queries.
    # Ex: db.query(models.Sensor).all() -> db.query(models.Sensor).filter_by(fazenda_id=fazenda_id).all()
    # Let's replace db.query(models.XYZ).filter( -> db.query(models.XYZ).filter_by(fazenda_id=fazenda_id).filter(
    # And db.query(models.XYZ).all() -> db.query(models.XYZ).filter_by(fazenda_id=fazenda_id).all()
    
    # For now, I'll just save the dependency changes to avoid syntax errors.
    with open(filepath, "w") as f:
        f.write(content)

print("Patch applied.")
