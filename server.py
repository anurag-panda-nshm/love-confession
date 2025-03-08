from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

import os

DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'confessions.db')

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    db.execute('''
        CREATE TABLE IF NOT EXISTS confessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            to_name TEXT NOT NULL,
            message TEXT NOT NULL,
            from_name TEXT,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now', 'utc'))
        )
    ''')
    db.commit()

with app.app_context():
    init_db()

@app.route('/api/confessions', methods=['GET'])
def get_confessions():
    page = request.args.get('page', 1, type=int)
    per_page = 5
    offset = (page - 1) * per_page
    
    db = get_db()
    confessions = db.execute(
        'SELECT * FROM confessions ORDER BY created_at DESC LIMIT ? OFFSET ?',
        (per_page, offset)
    ).fetchall()
    
    total_count = db.execute('SELECT COUNT(*) as count FROM confessions').fetchone()['count']
    total_pages = (total_count + per_page - 1) // per_page
    
    return jsonify({
        'confessions': [dict(confession) for confession in confessions],
        'total_pages': total_pages,
        'current_page': page
    })

@app.route('/api/confessions', methods=['POST'])
def create_confession():
    data = request.get_json()
    
    if not data or 'to_name' not in data or 'message' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    to_name = data['to_name']
    message = data['message']
    from_name = data.get('from_name', 'Anonymous')
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO confessions (to_name, message, from_name, created_at) VALUES (?, ?, ?, strftime("%Y-%m-%d %H:%M:%f", "now", "utc"))',
            (to_name, message, from_name)
        )
        db.commit()
        return jsonify({'message': 'Confession created successfully'}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True)