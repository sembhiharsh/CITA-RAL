import os
import json

DATABASE_URL = os.getenv("DATABASE_URL")
APPOINTMENTS_FILE = "appointments.json"

def get_conn():
    if not DATABASE_URL:
        return None
    import psycopg2
    return psycopg2.connect(DATABASE_URL)

def init_db():
    if not DATABASE_URL:
        if not os.path.exists(APPOINTMENTS_FILE):
            with open(APPOINTMENTS_FILE, "w") as f:
                json.dump([], f)
        return
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

def load_appointments():
    if not DATABASE_URL:
        if not os.path.exists(APPOINTMENTS_FILE):
            return []
        with open(APPOINTMENTS_FILE, "r") as f:
            return json.load(f)
            
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT data FROM appointments")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [row[0] for row in rows]

def save_appointment(app_data):
    if not DATABASE_URL:
        data = load_appointments()
        for i, a in enumerate(data):
            if a["id"] == app_data["id"]:
                data[i] = app_data
                break
        else:
            data.append(app_data)
        with open(APPOINTMENTS_FILE, "w") as f:
            json.dump(data, f, indent=2)
        return

    import psycopg2
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO appointments (id, data) VALUES (%s, %s)
        ON CONFLICT (id) DO UPDATE SET data = %s
    """, (app_data["id"], json.dumps(app_data), json.dumps(app_data)))
    conn.commit()
    cur.close()
    conn.close()

def delete_appointment(appointment_id):
    if not DATABASE_URL:
        data = load_appointments()
        data = [a for a in data if a["id"] != appointment_id]
        with open(APPOINTMENTS_FILE, "w") as f:
            json.dump(data, f, indent=2)
        return

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM appointments WHERE id = %s", (appointment_id,))
    conn.commit()
    cur.close()
    conn.close()
