import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

upload = Blueprint("upload", __name__)

ALLOWED_IMAGE = {'png', 'jpg', 'jpeg'}
ALLOWED_PDF = {'pdf'}

def allowed_file(filename, allowed_exts):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts

@upload.route("/photo/<int:user_id>", methods=["POST"])
def upload_photo(user_id):
    mysql = current_app.config["MYSQL"]
    file = request.files.get("file")

    if not file:
        return jsonify({"status": "error", "message": "No file received"}), 400

    if not allowed_file(file.filename, ALLOWED_IMAGE):
        return jsonify({"status": "error", "message": "Invalid image format"}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = secure_filename(f"user_{user_id}.{ext}")

    folder = "uploads/photos"
    os.makedirs(folder, exist_ok=True)

    filepath = os.path.join(folder, filename)
    file.save(filepath)

    cur = mysql.connection.cursor()
    cur.execute("UPDATE users SET photo=%s WHERE id=%s", (filename, user_id))
    mysql.connection.commit()
    cur.close()

    return jsonify({
        "status": "success",
        "photo": filename,
        "url": f"/uploads/photos/{filename}"
    }), 200

@upload.route("/resume/<int:user_id>", methods=["POST"])
def upload_resume(user_id):
    mysql = current_app.config["MYSQL"]
    file = request.files.get("file")

    if not file:
        return jsonify({"status": "error", "message": "No file received"}), 400

    if not allowed_file(file.filename, ALLOWED_PDF):
        return jsonify({"status": "error", "message": "Only PDF allowed"}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = secure_filename(f"user_{user_id}.{ext}")

    folder = "uploads/resumes"
    os.makedirs(folder, exist_ok=True)

    filepath = os.path.join(folder, filename)
    file.save(filepath)

    cur = mysql.connection.cursor()
    cur.execute("UPDATE users SET resume=%s WHERE id=%s", (filename, user_id))
    mysql.connection.commit()
    cur.close()

    return jsonify({
        "status": "success",
        "resume": filename,
        "url": f"/uploads/resumes/{filename}"
    }), 200
