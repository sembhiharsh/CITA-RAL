import os
import psycopg2
import json

DATABASE_URL = os.getenv("DATABASE_URL")

def get_conn():
    return psycopg2.connect(DATABASE_URL)

def init_db():
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
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT data FROM appointments")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [row[0] for row in rows]

def save_appointment(app_data):
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
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM appointments WHERE id = %s", (appointment_id,))
    conn.commit()
    cur.close()
    conn.close()
