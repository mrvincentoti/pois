# hello.py
import time
import logging
import pika
import json
import mysql.connector
import os
import requests

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST')
RABBITMQ_QUEUE = os.getenv('EMP_QUEUE_NAME')
RABBITMQ_USER = os.getenv('RABBITMQ_USER')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS')
RABBITMQ_PORT = '5672'

logging.basicConfig(
    level=logging.INFO,
    filename='create_employee_worker.log',
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
        INSERT INTO employee (
            employee_id, first_name, last_name, middle_name
        ) VALUES (
            %(employee_id)s, %(first_name)s, %(last_name)s, %(middle_name)s
        )
        """
        cursor.execute(insert_query, {
            'employee_id': audit_data.get('employee_id'),
            'first_name': audit_data.get('first_name'),
            'last_name': audit_data.get('last_name'),
            'middle_name': audit_data.get('middle_name')
        })

        db_connection.commit()
        cursor.close()
        db_connection.close()

        return {"code": "SUCCESS", "message": "Employee data inserted successfully!"}
    except mysql.connector.Error as error:
        return {"code": "DB_ERROR", "message": f"Error: {error}"}


def process_and_save_data(data):
    processed_data = {
        'employee_id': data.get('employee_id'),
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        'middle_name': data.get('middle_name')
    }

    try:
        response = insert_data_to_mysql(processed_data)
        if response.code == "SUCCESS":
            logging.info("Data saved successfully!")
        else:
            logging.info(
                f"Failed to save data. Status code: {response.code}")
    except requests.exceptions.RequestException as e:
        logging.info(f"Request to API failed: {e}")


def on_message(channel, method, properties, body):
    try:
        data = json.loads(body)
        process_and_save_data(data)
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logging.debug("Error processing message:", e)
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
