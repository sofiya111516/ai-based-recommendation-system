import mysql.connector
from config import Config

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DATABASE
        )
        return conn
    except mysql.connector.Error as err:
        print("Database Connection Error:", err)
        return None
