# hello.py
import time
import logging
import pika
import json
import mysql.connector
import os
import requests

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST')
RABBITMQ_QUEUE = os.getenv('QUEUE_NAME')
RABBITMQ_USER = os.getenv('RABBITMQ_USER')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS')
RABBITMQ_PORT = os.getenv('RABBITMQ_PORT')

logging.basicConfig(
    level=logging.INFO,
    filename='worker.log',
    filemode='a',
    format='%(asctime)s - %(levelname)s - %(message)s'
)


def insert_data_to_mysql(audit_data):
    try:
        db_connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            port=os.getenv('MYSQL_PORT'),
            password=os.getenv('MYSQL_PASS'),
            database=os.getenv('MYSQL_DATABASE')
        )
        cursor = db_connection.cursor()
        insert_query = """
        INSERT INTO audit (
            user_id, user_email, event, auditable_id, old_values, new_values, url,
            ip_address, user_agent, tags, created_at, updated_at, employee_id,
            first_name, last_name, pfs_num
        ) VALUES (
            %(user_id)s, %(user_email)s, %(event)s, %(auditable_id)s, %(old_values)s, %(new_values)s, %(url)s,
            %(ip_address)s, %(user_agent)s, %(tags)s, %(created_at)s, %(updated_at)s, %(employee_id)s, %(first_name)s, %(last_name)s, %(pfs_num)s
        )
        """
        cursor.execute(insert_query, {
            'user_id': audit_data.get('user_id'),
            'user_email': audit_data.get('user_email'),
            'event': audit_data.get('event'),
            'auditable_id': audit_data.get('auditable_id'),
            'old_values': audit_data.get('old_values'),
            'new_values': audit_data.get('new_values'),
            'url': audit_data.get('url'),
            'ip_address': audit_data.get('ip_address'),
            'user_agent': audit_data.get('user_agent'),
            'tags': audit_data.get('tags'),
            'created_at': audit_data.get('created_at'),
            'updated_at': audit_data.get('updated_at'),
            'employee_id': audit_data.get('employee_id') or 0,
            'first_name': audit_data.get('first_name') or "",
            'last_name': audit_data.get('last_name') or "",
            'pfs_num': audit_data.get('pfs_num') or "",
        })

        db_connection.commit()
        cursor.close()
        db_connection.close()

        return {"code": "SUCCESS", "message": "Audit data inserted successfully!"}
    except mysql.connector.Error as error:
        return {"code": "DB_ERROR", "message": f"Error: {error}"}
    
def process_and_save_data(data):
    processed_data = {
        "user_id": data.get("user_id"),
        "user_email": data.get("user_email"),
        "event": data.get("event"),
        "auditable_id": data.get("auditable_id"),
        "old_values": data.get("old_values"),
        "new_values": data.get("new_values"),
        "url": data.get("url"),
        "ip_address": data.get("ip_address"),
        "user_agent": data.get("user_agent"),
        "tags": data.get("tags"),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
        "employee_id": data.get("employee_id"),
        'first_name': data.get('first_name') or "",
        'last_name': data.get('last_name') or "",
        'pfs_num': data.get('pfs_num') or "",
    }

    try:
        response = insert_data_to_mysql(processed_data)
        if response["code"] == "SUCCESS":
            logging.info("Data saved successfully!")
        else:
            logging.info(
                f"Failed to save data. Status code: {response}")
    except requests.exceptions.RequestException as e:
        logging.info(f"Request to API failed: {e}")

def on_message(channel, method, properties, body):
    try:
        data = json.loads(body)
        logging.info("Received message: %s", data)

        process_and_save_data(data)

        logging.info("Message processed successfully.")
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logging.error("Error processing message: %s", e)
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

while True:
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        connection = pika.BlockingConnection(pika.ConnectionParameters(
            host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials))
        channel = connection.channel()

        channel.basic_consume(
            queue=RABBITMQ_QUEUE, on_message_callback=on_message, auto_ack=False)
        channel.start_consuming()
    except pika.exceptions.ChannelWrongStateError as cwse:
        logging.info("Channel error:", cwse)
    except pika.exceptions.ConnectionClosed as cce:
        logging.info("Connection closed:", cce)
    except Exception as e:
        logging.info("Error processing message:", e)
        
    time.sleep(5)