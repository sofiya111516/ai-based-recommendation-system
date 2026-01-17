from flask import Blueprint, jsonify, current_app, request

applications = Blueprint("applications", __name__)


# ===================== GET APPLICATIONS =====================
@applications.route("/<int:user_id>", methods=["GET"])
def get_applications(user_id):
    try:
        mysql = current_app.config["MYSQL"]
        cur = mysql.connection.cursor()

        # UPDATED QUERY: includes internship_id
        cur.execute("""
            SELECT a.id, a.internship_id, i.title, i.company, 
                   a.applied_on, a.status
            FROM applications a
            JOIN internships i ON a.internship_id = i.id
            WHERE a.user_id = %s
            ORDER BY a.applied_on DESC
        """, (user_id, ))

        data = cur.fetchall()
        cur.close()

        apps = []
        for row in data:
            apps.append({
                "application_id": row[0],        # application table id
                "internship_id": row[1],         # internship id (IMPORTANT!)
                "title": row[2],
                "company": row[3],
                "applied_on": row[4].strftime("%Y-%m-%d"),
                "status": row[5]
            })

        return jsonify({"status": "success", "applications": apps})

    except Exception as e:
        print("GET APPLICATIONS ERROR:", e)
        return jsonify({"status": "error", "message": "Server error"}), 500



# ===================== CANCEL APPLICATION =====================
@applications.route("/cancel/<int:app_id>", methods=["DELETE"])
def cancel_application(app_id):
    try:
        mysql = current_app.config["MYSQL"]
        cur = mysql.connection.cursor()

        cur.execute("DELETE FROM applications WHERE id=%s", (app_id,))
        mysql.connection.commit()
        cur.close()

        return jsonify({"status": "success", "message": "Application canceled"})

    except Exception as e:
        print("CANCEL ERROR:", e)
        return jsonify({"status": "error", "message": "Server error"}), 500
