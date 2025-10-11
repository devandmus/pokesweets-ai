import sqlite3

# Connect to the database
conn = sqlite3.connect('/app/recipes.db')
cursor = conn.cursor()

print("Ejecutando migraciones...")

try:
    # Add thematic_connection column
    cursor.execute("ALTER TABLE recipes ADD COLUMN thematic_connection TEXT")
    print("✅ Columna 'thematic_connection' agregada")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⚠️  Columna 'thematic_connection' ya existe")
    else:
        print(f"❌ Error: {e}")

try:
    # Add presentation column
    cursor.execute("ALTER TABLE recipes ADD COLUMN presentation TEXT")
    print("✅ Columna 'presentation' agregada")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⚠️  Columna 'presentation' ya existe")
    else:
        print(f"❌ Error: {e}")

# Commit changes
conn.commit()

# Show table structure
cursor.execute("PRAGMA table_info(recipes)")
columns = cursor.fetchall()
print("\n📋 Estructura de la tabla 'recipes':")
for col in columns:
    print(f"  - {col[1]} ({col[2]})")

conn.close()
print("\n✅ Migración completada!")
