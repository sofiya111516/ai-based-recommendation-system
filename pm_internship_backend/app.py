from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_mysqldb import MySQL

app = Flask(__name__)
CORS(app)

app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_PORT'] = 3307
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'pm_internship'

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB

mysql = MySQL(app)
app.config["MYSQL"] = mysql

from routes.auth_routes import auth
from routes.profile_routes import profile
from routes.upload_routes import upload
from routes.internship_routes import internship
from routes.applications_routes import applications

app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(profile, url_prefix="/profile")
app.register_blueprint(upload, url_prefix="/upload")
app.register_blueprint(internship, url_prefix="/internships")
app.register_blueprint(applications, url_prefix="/applications")

@app.route('/uploads/photos/<filename>')
def photos(filename):
    return send_from_directory("uploads/photos", filename)

@app.route('/uploads/resumes/<filename>')
def resumes(filename):
    return send_from_directory("uploads/resumes", filename)

@app.route("/")
def home():
    return {"message": "Backend Running"}


if __name__ == "__main__":
    app.run(debug=True)
