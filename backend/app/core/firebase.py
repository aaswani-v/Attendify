
import firebase_admin
from firebase_admin import credentials, auth
import os

# Initialize Firebase Admin
# TODO: Replace with your service account path or environment variables
# For now, we'll try to use default credentials or skip if not configured
try:
    if not firebase_admin._apps:
        # Check if service account file exists
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "service-account.json")
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        else:
            print("Warning: Firebase service account not found. Firebase Auth will not work.")
            # Optionally initialize with default credentials for cloud environments
            # firebase_admin.initialize_app()
except ValueError:
    pass

def verify_firebase_token(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying Firebase token: {e}")
        return None
