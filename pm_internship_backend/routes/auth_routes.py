from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import random, string

auth = Blueprint("auth", __name__)


# ------------------ SIGNUP ---------------------
@auth.route('/signup', methods=['POST'])
def signup():
    mysql = current_app.config.get("MYSQL")
    if not mysql:
        return jsonify({"status": "error", "message": "Database not initialized"}), 500

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"status": "error", "message": "All fields required"}), 400

    cur = mysql.connection.cursor()

    # Check existing user
    cur.execute("SELECT id FROM users WHERE email=%s", (email,))
    existing = cur.fetchone()
    if existing:
        cur.close()
        return jsonify({"status": "error", "message": "Email already exists"}), 400

    hashed_password = generate_password_hash(password)

    cur.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed_password)
    )
    mysql.connection.commit()
    cur.close()

    return jsonify({"status": "success", "message": "Signup successful"}), 201



# ------------------ LOGIN ----------------------
@auth.route('/login', methods=['POST'])
def login():
    mysql = current_app.config.get("MYSQL")
    if not mysql:
        return jsonify({"status": "error", "message": "Database not initialized"}), 500

    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "All fields required"}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT id, name, email, password FROM users WHERE email=%s", (email,))
    user = cur.fetchone()
    cur.close()

    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    if not check_password_hash(user[3], password):
        return jsonify({"status": "error", "message": "Invalid password"}), 400

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "user": {
            "id": user[0],
            "name": user[1],
            "email": user[2]
        }
    }), 200





# ------------------ FORGOT PASSWORD ----------------------
@auth.route("/forgot", methods=["POST"])
def forgot_password():
    mysql = current_app.config.get("MYSQL")

    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT id FROM users WHERE email=%s", (email,))
        user = cur.fetchone()

        if not user:
            cur.close()
            return jsonify({"status": "error", "message": "Email not registered"}), 404

        # create reset token
        token = "".join(random.choices(string.ascii_letters + string.digits, k=32))

        cur.execute("UPDATE users SET reset_token=%s WHERE email=%s", (token, email))
        mysql.connection.commit()
        cur.close()

        # 👉 yaha real project me email send hota
        # but abhi testing ke liye: terminal me print
        print("\n🔗 RESET LINK => http://127.0.0.1:5501/reset.html?token=" + token)

        return jsonify({"status": "success", "message": "Reset link sent to your email"})

    except Exception as e:
        print("FORGOT ERROR => ", e)
        return jsonify({"status": "error", "message": "Server error"}), 500




# ------------------ RESET PASSWORD ----------------------
@auth.route("/reset", methods=["POST"])
def reset_password():
    mysql = current_app.config.get("MYSQL")
    data = request.json

    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        return jsonify({"status": "error", "message": "Token and password required"}), 400

    try:
        cur = mysql.connection.cursor()

        cur.execute("SELECT id FROM users WHERE reset_token=%s", (token,))
        user = cur.fetchone()

        if not user:
            cur.close()
            return jsonify({"status": "error", "message": "Invalid or expired token"}), 400

        hashed_password = generate_password_hash(new_password)

        cur.execute(
            "UPDATE users SET password=%s, reset_token=NULL WHERE reset_token=%s",
            (hashed_password, token)
        )

        mysql.connection.commit()
        cur.close()

        return jsonify({"status": "success", "message": "Password reset successful"})

    except Exception as e:
        print("RESET ERROR => ", e)
        return jsonify({"status": "error", "message": "Server error"}), 500
