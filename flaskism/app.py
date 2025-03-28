from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import pandas as pd
import joblib

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
    print(f"❌ Error loading model: {e}")
    model, ohe, model_columns = None, None, None

# ---------- Home Route ----------
@app.route('/')
def home():
    return "<p>Welcome to Salary Prediction API</p>"

# ---------- Get Employee Data ----------
@app.route('/data', methods=['GET'])
def get_data():
    data = list(mongo.db.Employee.find({}, {"_id": 0}))
    print(data)
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
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email, password = data.get("email"), data.get("password")

    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    # Fetch username from the database
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
    
if __name__ == '__main__':
    app.run(debug=True)
