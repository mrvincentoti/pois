from datetime import datetime
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from binascii import hexlify, unhexlify
from dotenv import load_dotenv
import psutil
import json
from . import db

# Load environment variables from a .env file
load_dotenv()


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