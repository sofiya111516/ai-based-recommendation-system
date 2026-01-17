from flask import Blueprint, jsonify, current_app, request
import re

internship = Blueprint("internship", __name__)


# ===================== GET ALL INTERNSHIPS =====================
@internship.route("/", methods=["GET"])
def get_internships():
    try:
        mysql = current_app.config["MYSQL"]
        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT id, title, company, location, duration, stipend, description
            FROM internships
        """)

        data = cur.fetchall()
        cur.close()

        internships = []
        for i in data:
            internships.append({
                "id": i[0],
                "title": i[1],
                "company": i[2],
                "location": i[3],
                "duration": i[4],
                "stipend": i[5],
                "description": i[6]
            })

        return jsonify({"status": "success", "internships": internships})

    except Exception as e:
        print("INTERNSHIP ERROR:", e)
        return jsonify({"status": "error", "message": "Server error"}), 500


# ===================== RECOMMEND INTERNSHIPS =====================
@internship.route("/recommend/<int:user_id>", methods=["GET"])
def recommend_internships(user_id):
    try:
        mysql = current_app.config["MYSQL"]
        cur = mysql.connection.cursor()

        # 1. Get user profile data
        cur.execute("SELECT skills, interest FROM users WHERE id=%s", (user_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({"status": "error", "message": "User not found"}), 404

        skills = row[0] or ""
        interest = row[1] or ""

        text = f"{skills} {interest}".lower()

        raw_tokens = re.split(r"[,\s/]+", text)
        keywords = [t for t in raw_tokens if len(t) >= 3]

        # 2. If no keywords, show latest
        if not keywords:
            cur.execute("""
                SELECT id, title, company, location, duration, stipend, description
                FROM internships
                ORDER BY id DESC LIMIT 6
            """)
            data = cur.fetchall()

        else:
            # Full text search
            search_text = " ".join(keywords)

            cur.execute("""
                SELECT id, title, company, location, duration, stipend, description
                FROM internships
                WHERE MATCH(title, description) AGAINST (%s IN NATURAL LANGUAGE MODE)
                LIMIT 10
            """, (search_text,))
            data = cur.fetchall()

            # fallback
            if not data:
                like = "%" + keywords[0] + "%"
                cur.execute("""
                    SELECT id, title, company, location, duration, stipend, description
                    FROM internships
                    WHERE title LIKE %s OR description LIKE %s
                    LIMIT 6
                """, (like, like))
                data = cur.fetchall()

        cur.close()

        recs = []
        for i in data:
            recs.append({
                "id": i[0],
                "title": i[1],
                "company": i[2],
                "location": i[3],
                "duration": i[4],
                "stipend": i[5],
                "description": i[6]
            })

        return jsonify({"status": "success", "recommendations": recs})

    except Exception as e:
        print("RECOMMEND ERROR:", e)
        return jsonify({"status": "error", "message": "Server error"}), 500


# ===================== GET SINGLE INTERNSHIP =====================
@internship.route("/details/<int:internship_id>", methods=["GET"])
def get_internship_by_id(internship_id):
    try:
        mysql = current_app.config["MYSQL"]
        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT id, title, company, location, duration, stipend, description
            FROM internships
            WHERE id = %s
        """, (internship_id,))

        row = cur.fetchone()
        cur.close()

        if not row:
            return jsonify({"status": "error", "message": "Internship not found"}), 404

        data = {
            "id": row[0],
            "title": row[1],
            "company": row[2],
            "location": row[3],
            "duration": row[4],
            "stipend": row[5],
            "description": row[6]
        }

        return jsonify({"status": "success", "internship": data})

    except Exception as e:
        print("DETAILS ERROR:", e)
        return jsonify({"status": "error", "message": "Server error"}), 500


# ===================== APPLY INTERNSHIP =====================
@internship.route("/apply", methods=["POST"])
def apply_internship():
    mysql = current_app.config["MYSQL"]
    data = request.json

    user_id = data.get("user_id")
    internship_id = data.get("internship_id")

    if not user_id or not internship_id:
        return jsonify({"status": "error", "message": "Invalid data"}), 400

    try:
        cur = mysql.connection.cursor()

        # Check duplicate
        cur.execute("""
            SELECT id FROM applications 
            WHERE user_id=%s AND internship_id=%s
        """, (user_id, internship_id))

        if cur.fetchone():
            return jsonify({"status": "error", "message": "Already applied"}), 400

        # Insert new
        cur.execute("""
            INSERT INTO applications (user_id, internship_id)
            VALUES (%s, %s)
        """, (user_id, internship_id))

        mysql.connection.commit()
        cur.close()

        return jsonify({"status": "success", "message": "Application submitted!"})

    except Exception as e:
        print("APPLY ERROR:", e)
        return jsonify({"status": "error", "message": "Server error"}), 500
