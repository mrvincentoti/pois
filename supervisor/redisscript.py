import requests
import redis
import logging
import json


def on_message(message):
    data_dict = json.loads(message)
    post_data = {
        "email": data_dict['email'],
        "username": data_dict['username'],
        "password": data_dict['password'],
        "role_id": data_dict['role_id'],
        "employee_id":data_dict['employee_id']
    }
    response = requests.post('http://auth-service:5001/users', json=post_data)
    if response.status_code == 201:
        print("Data sent successfully!")
        logging.info('Data sent successfully!')
    else:
        print(f"Failed to send data. Status code: {response.text}")
        logging.error(f'Failed to send data. Status code: {response.text}')

def listen_to_redis_channel():
    redis_channel = 'CREATE_USER_ACCOUNT'
    r = redis.StrictRedis(host='redis', port=6379, decode_responses=True)

    # Subscribe to the Redis channel
    pubsub = r.pubsub()
    pubsub.subscribe(redis_channel)

    # Start listening to messages
    for message in pubsub.listen():
        if message['type'] == 'message':
            on_message(message['data'])

if __name__ == "__main__":
    listen_to_redis_channel()