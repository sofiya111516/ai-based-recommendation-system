from flask import Blueprint, request, jsonify, current_app

profile = Blueprint("profile", __name__)

@profile.route("/get/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    try:
        mysql = current_app.config["MYSQL"]
        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT id, name, email, phone, college, location, skills, interest, photo, resume
            FROM users WHERE id=%s
        """, (user_id, ))

        row = cur.fetchone()
        cur.close()

        if not row:
            return jsonify({"status": "error", "message": "User not found"}), 404

        user_data = {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "phone": row[3],
            "college": row[4],
            "location": row[5],
            "skills": row[6],
            "interest": row[7],
            "photo": row[8],
            "resume": row[9]
        }

        return jsonify({"status": "success", "user": user_data})

    except Exception as e:
        print("GET ERROR:", e)
        return jsonify({"status": "error", "message": "Server error"}), 500

@profile.route('/update/<int:user_id>', methods=['PUT'])
def update_profile(user_id):

    mysql = current_app.config.get("MYSQL")
    if not mysql:
        return jsonify({"status": "error", "message": "DB not initialized"}), 500

    data = request.json

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    college = data.get("college")
    location = data.get("location")
    skills = data.get("skills")
    interest = data.get("interest")

    try:
        cur = mysql.connection.cursor()

        cur.execute("""
            UPDATE users 
            SET name=%s, email=%s, phone=%s, college=%s, location=%s, skills=%s, interest=%s
            WHERE id=%s
        """, (name, email, phone, college, location, skills, interest, user_id))

        mysql.connection.commit()
        cur.close()

        return jsonify({"status": "success", "message": "Profile updated successfully"})

    except Exception as e:
        print("UPDATE ERROR:", e)
        return jsonify({"status": "error", "message": "Server error"}), 500
