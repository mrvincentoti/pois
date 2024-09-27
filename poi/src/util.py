from datetime import datetime
import os, jwt, json
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from binascii import hexlify, unhexlify
from dotenv import load_dotenv
import psutil
from . import db
from datetime import datetime as dt
from flask import request, jsonify, g, current_app
from functools import wraps
import uuid

from minio import Minio
from minio.error import S3Error

# Load environment variables from a .env file
load_dotenv()

# Get MinIO configuration from environment variables
minio_endpoint = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
minio_access_key = os.getenv("MINIO_ACCESS_KEY")
minio_secret_key = os.getenv("MINIO_SECRET_KEY")

# Extract the host and secure (http/https) flag from the URL
minio_host = minio_endpoint.replace("http://", "").replace("https://", "")
use_https = minio_endpoint.startswith("https://")

# Configure the MinIO client
minio_client = Minio(
    minio_host,
    access_key=minio_access_key,
    secret_key=minio_secret_key,
    secure=False
)

# Custom JWT decorator
def custom_jwt_required(fn):
    @wraps(fn)
    def decorated_function(*args, **kwargs):
        try:
            # Extract token from Authorization header
            token = request.headers.get("Authorization", "").split()[1]
            
            # Decode the token to get the payload
            try:
                secret_key = os.getenv("SECRET_KEY")
                token_data = jwt.decode(token, secret_key, algorithms=["HS256"])

                # Extract the expiry time and other fields
                expiry = token_data.get("exp")
                if not expiry:
                    return jsonify({"message": "No expiry time in token"}), 401

                # Check if the token has expired
                if is_token_expired(expiry):
                    return jsonify({"message": "Token has expired"}), 401
                
                # Extract user fields from token
                user_id = token_data.get("sub")
                first_name = token_data.get("first_name")
                last_name = token_data.get("last_name")
                pfs_num = token_data.get("pfs_num")
                email = token_data.get("email")

                if not all([user_id, first_name, last_name, pfs_num, email]):
                    return jsonify({
                        "message": "Some fields are missing",
                        "user_id": user_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "pfs_num": pfs_num,
                        "email": email
                    }), 401

                # Attach user details to the request context
                g.user = {
                    "id": user_id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "pfs_num": pfs_num,
                    "email": email
                }

                # Continue to your route function
                return fn(*args, **kwargs)
            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Token has expired"}), 401
            except jwt.InvalidTokenError as e:
                # Log the error for debugging
                print("Invalid Token Error:", str(e))
                return jsonify({"message": "Invalid token"}), 401
        except IndexError:
            return jsonify({"message": "Token not provided"}), 401

    return decorated_function

# Check if the token expiry time is valid
def is_token_expired(expiry):
    try:
        current_time = dt.utcnow()
        expiry_time = dt.utcfromtimestamp(expiry)  # Convert expiry timestamp
        return current_time > expiry_time
    except (ValueError, KeyError):
        return True  # If there's an issue with the expiry field

def find_key_file(search_paths):
    key_file_name = 'key.txt'
    for search_path in search_paths:
        # Check if the path is mounted
        if not os.path.ismount(search_path):
            print(f"Path not mounted: {search_path}")
            continue  # Skip this path if it is not mounted
        print(f"Checking path: {search_path}")
        for root, dirs, files in os.walk(search_path):
            if key_file_name in files:
                return os.path.join(root, key_file_name)
    raise FileNotFoundError(
        f'Key file "{key_file_name}" not found in search paths.')

def read_key():
    search_paths = os.getenv('SEARCH_PATHS', '/Volumes').split(':')
    key_file_path = find_key_file(search_paths)
    with open(key_file_path, 'rb') as file:  # Open the file in binary mode
        key = file.read().strip()
        print(f"This is the key from the util file: {key}")
    return key

def get_app_encryption_key():
    try:
        key = read_key()
        assert len(key) in [16, 24, 32], "Invalid AES key length"
        return key
    except (FileNotFoundError, ValueError, AssertionError) as e:
        print(f"Error loading encryption key: {e}")
        return None

APP_ENCRYPTION_KEY = os.getenv("APP_ENCRYPTION_KEY").encode('utf-8')

def pad(data):
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data) + padder.finalize()
    return padded_data

def unpad(data):
    unpadder = padding.PKCS7(128).unpadder()
    unpadded_data = unpadder.update(data) + unpadder.finalize()
    return unpadded_data

def encrypt(text):
    if text is None:
        return None

    if isinstance(text, int):
        return text  # Return the integer as-is without encryption

    if APP_ENCRYPTION_KEY is None:
        raise RuntimeError("Encryption key not set.")

    if not isinstance(text, str):
        text = str(text)  # Convert non-string, non-int input to string

    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(APP_ENCRYPTION_KEY),
                    modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    padded_text = pad(text.encode('utf-8'))
    encrypted_text = encryptor.update(padded_text) + encryptor.finalize()
    return hexlify(iv + encrypted_text).decode('utf-8')

def decrypt(encrypted_text_hex):
    if encrypted_text_hex is None:
        return None
    if isinstance(encrypted_text_hex, int):
        return encrypted_text_hex  # Return the integer as-is without encryption

    if APP_ENCRYPTION_KEY is None:
        raise RuntimeError("Encryption key not set.")
    encrypted_text = unhexlify(encrypted_text_hex)
    iv = encrypted_text[:16]
    encrypted_data = encrypted_text[16:]
    cipher = Cipher(algorithms.AES(APP_ENCRYPTION_KEY),
                    modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_padded_text = decryptor.update(
        encrypted_data) + decryptor.finalize()
    decrypted_text = unpad(decrypted_padded_text)
    return decrypted_text.decode('utf-8')

def calculate_age(date_string):
    # Convert the date string to a datetime object
    birth_date = datetime.strptime(date_string, "%Y-%m-%d")

    # Get today's date
    today = datetime.today()

    # Calculate age
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

    return age

def calculate_age2(date_string):
    # Convert the date string to a datetime object
    birth_date = datetime.strptime(date_string, "%Y-%m-%d")

    # Determine the format of the date string
    if " " in date_string:  # if there's a space, assume time is included
        birth_date = datetime.strptime(date_string, "%Y-%m-%d %H:%M:%S")
    else:  # otherwise, it's just a date
        birth_date = datetime.strptime(date_string, "%Y-%m-%d")

    # Get today's date
    today = datetime.today()

    # Calculate age
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

    return age

def save_audit_data(audit_data):
    # Import Audit model here to avoid circular import
    from .audit.models import Audit

    try:
        new_audit = Audit(
            user_id=audit_data['user_id'],
            user_email=audit_data.get('user_email'),
            event=audit_data['event'],
            auditable_id=audit_data['auditable_id'],
            employee_id=audit_data.get('employee_id'),
            first_name=audit_data['first_name'],
            last_name=audit_data['last_name'],
            pfs_num=audit_data['pfs_num'],
            old_values=json.dumps(audit_data['old_values']),
            new_values=json.dumps(audit_data['new_values']) if audit_data['new_values'] else None,
            url=audit_data['url'],
            ip_address=audit_data['ip_address'],
            user_agent=audit_data['user_agent'],
            tags=audit_data['tags'],
            created_at=audit_data['created_at'],
            updated_at=audit_data['updated_at']
        )

        db.session.add(new_audit)
        db.session.commit()
        print("Audit saved successfully.")

    except Exception as e:
        db.session.rollback()
        print(f"Error saving audit: {str(e)}")


def upload_file_to_minio(bucket_name, file, new_filename):
    try:
        # Ensure the file stream is at the beginning
        file.seek(0, os.SEEK_END)  # Move the pointer to the end of the file to get the length
        file_length = file.tell()  # Get the position of the pointer which is the file size
        file.seek(0)  # Reset the file pointer to the beginning

        # Ensure file length is valid
        if file_length == 0:
            raise ValueError("The file is empty")

        # Upload the file to MinIO
        minio_client.put_object(
            bucket_name,
            new_filename,
            file.stream,  # Use the file stream for upload
            file_length,  # Manually computed file size
            content_type=file.content_type
        )

        # Return the URL for accessing the file
        return f"{os.getenv('MINIO_URL')}/{bucket_name}/{new_filename}"

    except S3Error as e:
        print(f"Error saving picture file to MinIO: {str(e)}")
        return None

    except Exception as e:
        print(f"An unexpected error occurred while saving picture file: {str(e)}")
        return None


def remove_object_from_minio(object_key):
    bucket_name = os.getenv("MINIO_BUCKET_NAME")
    try:
        minio_client.remove_object(bucket_name, object_key)
        print(f"Object {object_key} removed from bucket {bucket_name}.")
        return True

    except S3Error as e:
        print(f"Error occurred while removing object {object_key}: {str(e)}")
        return False


def save_picture_file(file):
    try:
        # Generate a new filename using UUID
        file_extension = os.path.splitext(file.filename)[1]  # Get the file extension
        new_filename = f"{uuid.uuid4()}{file_extension}"  # Create a new unique filename

        # Upload the file to the MinIO bucket
        bucket_name = current_app.config['MINIO_BUCKET_NAME']
        content_type = file.content_type  # Get the file's content type (e.g., image/jpeg)

        # Save the file to MinIO bucket
        minio_client.put_object(
            bucket_name,
            new_filename,
            file.stream,  # Use file stream for upload
            file.content_length,
            content_type=content_type
        )

        # Return the URL for accessing the file (assuming you serve files directly from MinIO)
        return f"{os.getenv['MINIO_URL']}/{bucket_name}/{new_filename}"

    except S3Error as e:
        # Log the error if needed
        print(f"Error saving picture file to MinIO: {str(e)}")
        raise e

    except Exception as e:
        # Log any other error
        print(f"An unexpected error occurred while saving picture file: {str(e)}")
        raise e
    
def delete_picture_file(picture_url):
    try:
        # Extract the bucket name and object name (the file path in MinIO)
        bucket_name = os.getenv['MINIO_BUCKET_NAME']
        object_name = os.path.basename(picture_url)  # This assumes the picture_url is a full path

        # Check if the object exists in the bucket before attempting deletion
        try:
            # Try to retrieve the object to ensure it exists
            minio_client.stat_object(bucket_name, object_name)

            # Delete the file from MinIO
            minio_client.remove_object(bucket_name, object_name)
            print(f"Picture file {object_name} deleted successfully from MinIO.")
        except S3Error as e:
            if e.code == 'NoSuchKey':
                print(f"File {object_name} does not exist in MinIO.")
            else:
                raise e  # Raise the error if it's something else

    except Exception as e:
        # Log the error if needed
        print(f"Error deleting picture file {picture_url} from MinIO: {str(e)}")


def get_media_type_from_extension(filename):
    extension = os.path.splitext(filename)[1].lower()
    if extension in ['.jpg', '.jpeg', '.png', '.gif']:
        return 'image'
    elif extension in ['.mp4', '.mov', '.avi', '.mkv']:
        return 'video'
    elif extension in ['.mp3', '.wav', '.ogg']:
        return 'audio'
    elif extension in ['.pdf']:
        return 'pdf'
    elif extension in ['.csv', '.xlsx', '.xls']:
        return 'spreadsheet'
    elif extension in ['.zip', '.rar']:
        return 'archive'
    else:
        return 'document'  # Default for other file types