from datetime import datetime
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from binascii import hexlify, unhexlify
from dotenv import load_dotenv
import psutil

# Load environment variables from a .env file
load_dotenv() 

# Retrieve the encryption key from the environment
# APP_ENCRYPTION_KEY = os.getenv('APP_ENCRYPTION_KEY').encode('utf-8')


def find_key_file(search_paths):
    key_file_name = 'key.txt'
    for search_path in search_paths:
        for root, dirs, files in os.walk(search_path):
            if key_file_name in files:
                return os.path.join(root, key_file_name)
    raise FileNotFoundError(
        f'Key file "{key_file_name}" not found in search paths.')


def read_key():
    search_paths = os.getenv(
        'SEARCH_PATHS', '/media:/mnt:/Volumes:/mnt/d:/mnt/e:/mnt/f').split(':')
    key_file_path = find_key_file(search_paths)
    with open(key_file_path, 'rb') as file:  # Open the file in binary mode
        key = file.read().strip()
    return key

try:
    APP_ENCRYPTION_KEY = read_key()
except (FileNotFoundError, ValueError) as e:
    print(f"Error loading encryption key: {e}")
    exit(1)

# AES requires a 16, 24, or 32 byte key
# Ensure your APP_KEY matches one of these lengths
assert len(APP_ENCRYPTION_KEY) in [16, 24, 32], "Invalid AES key length"


def pad(data):
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data) + padder.finalize()
    return padded_data


def unpad(data):
    unpadder = padding.PKCS7(128).unpadder()
    unpadded_data = unpadder.update(data) + unpadder.finalize()
    return unpadded_data


def encrypt(text):
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(APP_ENCRYPTION_KEY), modes.CBC(iv),
                    backend=default_backend())
    encryptor = cipher.encryptor()
    padded_text = pad(text.encode('utf-8'))
    encrypted_text = encryptor.update(padded_text) + encryptor.finalize()
    return hexlify(iv + encrypted_text).decode('utf-8')


def decrypt(encrypted_text_hex):
    encrypted_text = unhexlify(encrypted_text_hex)
    iv = encrypted_text[:16]
    encrypted_data = encrypted_text[16:]
    cipher = Cipher(algorithms.AES(APP_ENCRYPTION_KEY), modes.CBC(iv),
                    backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_padded_text = decryptor.update(
        encrypted_data) + decryptor.finalize()
    decrypted_text = unpad(decrypted_padded_text)
    return decrypted_text.decode('utf-8')

def calculate_age(date_of_birth):
    today = datetime.today()
    age = today.year - date_of_birth.year - \
        ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    if age < 6:
        return "Less than 6"
    elif age > 18:
        return "Above 18"
    else:
        return age