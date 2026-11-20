import pytest
from fastapi.testclient import TestClient

from api.main import app

# Initialize TestClient
client = TestClient(app)

# Test customer payloads
VALID_CUSTOMER_A = {
    "customerID": "5178-LMXOP",
    "gender": "Male",
    "SeniorCitizen": 1,
    "Partner": "Yes",
    "Dependents": "No",
    "tenure": 1,
    "PhoneService": "Yes",
    "MultipleLines": "Yes",
    "InternetService": "Fiber optic",
    "OnlineSecurity": "No",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "Yes",
    "StreamingMovies": "Yes",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check",
    "MonthlyCharges": 95.10,
    "TotalCharges": 95.10
}

VALID_CUSTOMER_C = {
    "customerID": "4277-BWBML",
    "gender": "Female",
    "SeniorCitizen": 0,
    "Partner": "Yes",
    "Dependents": "Yes",
    "tenure": 72,
    "PhoneService": "Yes",
    "MultipleLines": "Yes",
    "InternetService": "DSL",
    "OnlineSecurity": "Yes",
    "OnlineBackup": "Yes",
    "DeviceProtection": "Yes",
    "TechSupport": "Yes",
    "StreamingTV": "Yes",
    "StreamingMovies": "Yes",
    "Contract": "Two year",
    "PaperlessBilling": "No",
    "PaymentMethod": "Bank transfer (automatic)",
    "MonthlyCharges": 19.95,
    "TotalCharges": 1322.85
}


def test_root_endpoint():
    """Verify GET / returns HTTP 200 and docs link."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs_url" in data
    assert data["status"] == "running"


def test_health_endpoint():
    """Verify GET /health returns HTTP 200 and loaded status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model"] == "logistic_regression"
    assert data["model_loaded"] is True
    assert data["preprocessor_loaded"] is True


def test_model_info_endpoint():
    """Verify GET /model-info returns metadata and Stage 4 metrics."""
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["model"] == "Logistic Regression"
    assert data["input_features"] == 20
    assert data["transformed_features"] == 47
    assert data["metrics"]["roc_auc"] == 0.8421


def test_predict_valid_customer_high_risk():
    """Verify POST /predict for Customer A matches Stage 4/5 prediction."""
    response = client.post("/predict", json=VALID_CUSTOMER_A)
    assert response.status_code == 200
    data = response.json()
    
    assert data["customer_id"] == "5178-LMXOP"
    assert 0.0 <= data["churn_probability"] <= 1.0
    assert 0.0 <= data["churn_percentage"] <= 100.0
    assert data["risk_level"] == "HIGH"
    assert data["prediction"] == "CHURN"
    
    # Check numerical equivalence with Stage 5 notebook (Prob = 0.8549)
    assert abs(data["churn_probability"] - 0.8549) < 0.001


def test_predict_valid_customer_low_risk():
    """Verify POST /predict for Customer C (low risk profile)."""
    response = client.post("/predict", json=VALID_CUSTOMER_C)
    assert response.status_code == 200
    data = response.json()
    
    assert data["customer_id"] == "4277-BWBML"
    assert data["churn_probability"] < 0.05
    assert data["risk_level"] == "LOW"
    assert data["prediction"] == "RETAIN"


def test_predict_invalid_categorical_input():
    """Verify POST /predict rejects invalid contract category with HTTP 422."""
    invalid_payload = VALID_CUSTOMER_A.copy()
    invalid_payload["Contract"] = "SuperFlexibleContract"
    
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422
    data = response.json()
    assert "error" in data or "detail" in data


def test_predict_invalid_numeric_input():
    """Verify POST /predict rejects negative tenure with HTTP 422."""
    invalid_payload = VALID_CUSTOMER_A.copy()
    invalid_payload["tenure"] = -10
    
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422


def test_predict_invalid_senior_citizen():
    """Verify POST /predict rejects SeniorCitizen outside [0, 1] with HTTP 422."""
    invalid_payload = VALID_CUSTOMER_A.copy()
    invalid_payload["SeniorCitizen"] = 5
    
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422


def test_predict_explain_endpoint():
    """Verify POST /predict/explain returns prediction and SHAP factors."""
    response = client.post("/predict/explain", json=VALID_CUSTOMER_A)
    assert response.status_code == 200
    data = response.json()
    
    assert data["customer_id"] == "5178-LMXOP"
    assert data["risk_level"] == "HIGH"
    assert "top_churn_factors" in data
    assert "top_retention_factors" in data
    
    assert len(data["top_churn_factors"]) > 0
    assert len(data["top_retention_factors"]) > 0
    
    # Check top churn factor is tenure or contract
    top_factor = data["top_churn_factors"][0]
    assert "feature" in top_factor
    assert "shap_value" in top_factor
    assert top_factor["shap_value"] > 0
    assert "contributed toward" in top_factor["contribution"]
