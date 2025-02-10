import sys
import logging
import pymysql
import json
import os
import datetime

# RDS settings
DB_USER = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']
DB_HOST = os.environ['DB_HOST']
DB_NAME = os.environ['DB_NAME']

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def get_db_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

# Establish database connection
try:
    conn = pymysql.connect(
        host=DB_HOST, 
        user=DB_USER, 
        passwd=DB_PASSWORD, 
        db=DB_NAME, 
        connect_timeout=5
    )
except pymysql.MySQLError as e:
    logger.error("ERROR: Could not connect to MySQL instance.")
    logger.error(e)
    sys.exit(1)

logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")

def handler(event, context):
    """
    Lambda function to handle API Gateway requests
    """
    logger.info(f"Received Event: {json.dumps(event)}")  # Log the incoming event

    path = event.get('path')
    http_method = event.get('httpMethod')

    if not path:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Path is missing", "event": event})  # Return full event for debugging
        }

    if path == "/Prod/data" and http_method == "GET":
        return get_all_data()
    
    elif path == "/Prod/data" and http_method == "POST":
        try:
            request_body = json.loads(event.get('body', '{}'))
            return create_data(request_body)
        except json.JSONDecodeError:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Invalid JSON format in request body"})
            }

    elif path.startswith("/Prod/data/") and http_method == "GET":
        item_id = path.split("/")[-1]  # Extract ID from URL
        return get_data_by_id(item_id)

    else:
        return {
            "statusCode": 404,
            "body": json.dumps({"message": "Not Found"})
        }

def get_all_data():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM items")  
        rows = cursor.fetchall()

        # Convert datetime fields to string
        for row in rows:
            for key, value in row.items():
                if isinstance(value, (datetime.date, datetime.datetime)):
                    row[key] = value.isoformat()

        return {
            "statusCode": 200,
            "body": json.dumps(rows)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(e)})
        }
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()