import redis, datetime
from datetime import datetime as dt
from redis.exceptions import ResponseError
from flask import request, jsonify, g
from functools import wraps

redis_client = redis.StrictRedis(host='redis', port=6379, decode_responses=True)


def set_key(key, value):
    return redis_client.set(key, value)


def get_key(key):
    return redis_client.get(key)


def set_token(token, user_id):
    current_time = datetime.datetime.now()
    expiration_time = current_time + datetime.timedelta(minutes=30)
    # Convert the expiration time to a Unix timestamp (seconds since the epoch)
    expiration_timestamp = expiration_time.timestamp()

    hash_key = token
    redis_client.hset(hash_key, 'token', token)
    redis_client.hset(hash_key, 'user_id', user_id)
    redis_client.hset(hash_key, 'expiry', expiration_time.isoformat())
    return hash_key


def get_token(token):
    try:
        hash_data = redis_client.hgetall(token)

        if not hash_data:
            return False

        # Check if the token has expired
        expiry = hash_data.get(b'expiry', b'').decode('utf-8')
        if expiry and datetime.strptime(expiry, "%Y-%m-%dT%H:%M:%S.%f") < datetime.utcnow():
            return False

        return hash_data
    except ResponseError as e:
        # Handle Redis-specific response error
        print(f"Redis Response Error: {e}")
        return {"message": "Error retrieving token from Redis"}
    except Exception as e:
        # Handle other exceptions
        print(f"Error retrieving token from Redis: {e}")
        return {"message": "Error retrieving token from Redis"}


def remove_token(token):
    try:
        # Delete the hash (token) from Redis
        redis_client.delete(token)
        return True
    except Exception as e:
        return False


def custom_jwt_required(fn):
    @wraps(fn)
    def decorated_function(*args, **kwargs):
        try:
            token = request.headers.get("Authorization", "").split()[1]

            # Check if the token exists in Redis
            token_data = get_token(token)

            if not token_data:
                return jsonify({"message": "Token not found in Redis"}), 401

            # Extract and validate the expiration time from the Redis data
            expiry = token_data["expiry"]
            if is_token_expired(expiry):
                return jsonify({"message": "Token has expired"}), 401
            
            # Extract user_id from token_data
            user_id = token_data["user_id"]
            employee_id = token_data["employee_id"]
            first_name = token_data["first_name"]
            last_name = token_data["last_name"]
            pfs_num = token_data["pfs_num"]

            # Attach user_id to the request context for further use
            g.user = {
                "id": user_id,
                "employee_id": employee_id,
                "first_name": first_name,
                "last_name": last_name,
                "pfs_num": pfs_num
            }

            # Continue to your route function
            return fn(*args, **kwargs)
        except IndexError:
            return jsonify({"message": "Token not provided"}), 401

    return decorated_function


def is_token_expired(expiry):
    try:
        current_time = dt.now()
        expiry_time = dt.fromisoformat(expiry)

        # Compare the current time to the token's expiry time
        return current_time > expiry_time
    except (ValueError, KeyError):
        return True  # If there is an issue with the JSON or missing 'expiry' field

    # If 'value' or 'expiry' key is not present, consider the token as expired
    return True