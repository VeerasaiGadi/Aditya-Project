import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# Load dataset
df = pd.read_csv("C:/Users/veera/Desktop/kiran/AdityaProject/flaskism/employee_Dataset.csv")
df = df.drop(columns=["EmployeeNumber", "Name"])  # Remove irrelevant columns

# One-Hot Encoding for categorical features
categorical_cols = ["Department", "EducationField", "JobRole"]
ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
ohe_data = ohe.fit_transform(df[categorical_cols])
ohe_columns = ohe.get_feature_names_out(categorical_cols)

df_encoded = pd.DataFrame(ohe_data, columns=ohe_columns)
df = df.drop(columns=categorical_cols).reset_index(drop=True)
df_encoded = df_encoded.reset_index(drop=True)
final_df = pd.concat([df, df_encoded], axis=1)

# Define features and target
X = final_df.drop(columns=["MonthlyIncome"])
y = final_df["MonthlyIncome"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train XGBoost Model with Better Hyperparameters
model = XGBRegressor(n_estimators=500, learning_rate=0.05, max_depth=8, colsample_bytree=0.8, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"MAE: {mae}, R2 Score: {r2}")

# Save the model and encoder
joblib.dump(model, "salary_model.pkl")
joblib.dump(ohe, "encoder.pkl")
joblib.dump(X_train.columns, "model_columns.pkl")

print("Model training completed and saved!")