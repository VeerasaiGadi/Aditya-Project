from werkzeug.utils import secure_filename
from flask import Flask, jsonify, request, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import joblib
import uuid
from datetime import datetime
import os
import pandas as pd

# Initialize Flask App
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# MongoDB Connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/mydatabase"
mongo = PyMongo(app)
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["mydatabase"]
users_collection = db["UserLogin"]

# Load Pre-trained Model and Encoder
try:
    model = joblib.load("salary_model.pkl")
    ohe = joblib.load("encoder.pkl")
    model_columns = joblib.load("model_columns.pkl")
    categorical_cols = ["Department", "EducationField", "JobRole"]
    print("✅ Model and encoder loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model: {e}. Check if 'salary_model.pkl', 'encoder.pkl', and 'model_columns.pkl' exist in the project root.")
    model, ohe, model_columns = None, None, None

# ---------- Home Route ----------
@app.route('/')
def home():
    return "<p>Welcome to Salary Prediction API</p>"

# ---------- Get Employee Data ----------
@app.route('/data', methods=['GET'])
def get_data():
    data = list(db["Employee"].find({}, {"_id": 0}))
    return jsonify(data) if data else jsonify({"message": "No employee data found"}), 200

# ---------- User Registration ----------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email, password = data.get("email"), data.get("password")
    username = data.get("username", "User")  # Get username if provided

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"success": False, "message": "Email already registered"}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users_collection.insert_one({"email": email, "password": hashed_password, "username": username})
    
    return jsonify({"success": True, "message": "User registered successfully"}), 201

# ---------- User Login ----------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email, password = data.get("email"), data.get("password")

    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    username = user.get("username", email)  # Fallback to email if username is not set
    return jsonify({"success": True, "username": username, "message": "Login successful"}), 200
# ---------- Salary Prediction ----------
@app.route('/predict', methods=['POST'])
def predict_salary():
    if not model or not ohe:
        return jsonify({"error": "Model or encoder not loaded"}), 500

    try:
        data = request.json
        print("🔍 Received Data from Frontend:", data)  # Debugging log

        # Convert input JSON to DataFrame
        df_input = pd.DataFrame([data])

        # Ensure categorical columns exist
        for col in categorical_cols:
            if col not in df_input.columns:
                df_input[col] = "Unknown"

        # ✅ Check if OneHotEncoder is fitted
        if not hasattr(ohe, "categories_"):
            return jsonify({"error": "Encoder not fitted properly"}), 500

        # One-hot encode input data
        encoded_data = ohe.transform(df_input[categorical_cols])
        encoded_df = pd.DataFrame(encoded_data, columns=ohe.get_feature_names_out(categorical_cols))

        # Drop categorical columns and merge encoded data
        df_input = df_input.drop(columns=categorical_cols).reset_index(drop=True)
        final_input = pd.concat([df_input, encoded_df], axis=1)

        # Ensure correct column alignment with trained model
        missing_cols = set(model_columns) - set(final_input.columns)
        for col in missing_cols:
            final_input[col] = 0  # Add missing columns with zero values
        final_input = final_input[model_columns]  # Ensure correct column order

        # Convert input to NumPy array for prediction
        features = final_input.to_numpy()

        # Make prediction
        predicted_salary = model.predict(features)

        return jsonify({"predicted_salary": float(predicted_salary[0])})

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500
    
# ---------- Profile Picture Upload ----------


# Configure upload directory
# Update this in your Flask app
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
# Or if you need to go up one directory to the project root
# UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/upload-image", methods=["POST"])
def upload_file():
    if 'multipart/form-data' in request.content_type:
        employee_id = request.form.get('employeeId')
        file = request.files.get('image')
    else:
        return jsonify({"error": "Invalid request format"}), 400

    if not employee_id or not file:
        return jsonify({"error": "Employee ID and image are required"}), 400

    try:
        employee_id_int = int(employee_id)
        
        # Save file to disk
        filename = f"{employee_id}_{secure_filename(file.filename)}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Store metadata in database
        update_operation = {
            "$set": {
                "profilePicFilename": filename,
                "profilePicPath": file_path,
                "lastProfilePicUploadTimestamp": datetime.now()
            }
        }

        result = mongo.db.Employee.update_one(
            {"EmployeeNumber": employee_id_int},
            update_operation,
            upsert=True
        )

        if result.matched_count == 0 and result.upserted_id is None:
            return jsonify({"error": "Employee not found"}), 404

        image_url = f"http://127.0.0.1:5000/images/{filename}"
        return jsonify({
            "message": "Image uploaded successfully!",
            "imageUrl": image_url
        }), 200

    except Exception as e:
        print(f"Upload Error: {str(e)}")
        return jsonify({
            "error": "Upload failed",
            "details": str(e)
        }), 500

# Add a route to serve images
@app.route("/images/<filename>", methods=["GET"])
def get_image(filename):
    try:
        # Debug info
        full_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        print(f"🔍 Serving image: {filename}")
        print(f"📂 Full path: {full_path}")
        print(f"✅ File exists: {os.path.exists(full_path)}")

        
        # Using the absolute path of your uploads folder
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"Error serving image: {str(e)}")
        return f"Error: {str(e)}", 500
@app.route("/test-image-path/<filename>")
def test_image_path(filename):
    full_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    exists = os.path.exists(full_path)
    return jsonify({
        "requested_file": filename,
        "full_path": full_path,
        "file_exists": exists,
        "upload_folder": app.config['UPLOAD_FOLDER'],
        "directory_contents": os.listdir(app.config['UPLOAD_FOLDER']) if exists else "N/A"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000, host='0.0.0.0')
