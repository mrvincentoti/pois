import pika
import json
import os

rabbitmq_host = os.getenv('RABBITMQ_HOST')
rabbitmq_port = int(os.getenv('RABBITMQ_PORT', '5672'))
rabbitmq_user = os.getenv('RABBITMQ_USER')
rabbitmq_pass = os.getenv('RABBITMQ_PASS')
queue_name = os.getenv('QUEUE_NAME')


def publish_to_rabbitmq(data):
    try:
        credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_pass)
        connection = pika.BlockingConnection(pika.ConnectionParameters(
            host=rabbitmq_host, port=rabbitmq_port, credentials=credentials))
        channel = connection.channel()

        # Ensure the declared queue is durable
        channel.queue_declare(queue=queue_name, durable=True)

        # Publish a persistent message
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=data,
            properties=pika.BasicProperties(
                delivery_mode=2,  # Make message persistent
            )
        )

        connection.close()
        print("Message published successfully!")
    except Exception as e:
        print(f"Failed to publish message: {e}")
