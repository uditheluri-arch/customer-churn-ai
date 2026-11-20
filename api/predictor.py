import os
import joblib
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any

from api.schemas import CustomerData, PredictionResponse

# Artifact loading singleton
_PREPROCESSOR = None
_MODEL = None
_FEATURE_NAMES = None


def get_artifact_paths() -> Tuple[str, str]:
    """
    Locates model artifacts relative to current working directory.
    """
    base_dir = os.getcwd()
    models_dir = os.path.join(base_dir, 'models')
    
    if not os.path.exists(models_dir):
        # Fallback if executing from inside api/ or tests/
        models_dir = os.path.abspath(os.path.join(base_dir, '..', 'models'))
        
    preprocessor_path = os.path.join(models_dir, 'preprocessor.joblib')
    model_path = os.path.join(models_dir, 'logistic_regression.joblib')
    
    return preprocessor_path, model_path


def load_artifacts():
    """
    Pre-loads preprocessor and model binaries once at application startup.
    """
    global _PREPROCESSOR, _MODEL, _FEATURE_NAMES
    
    preprocessor_path, model_path = get_artifact_paths()
    
    if not os.path.exists(preprocessor_path):
        raise FileNotFoundError(f"Preprocessor artifact not found at {preprocessor_path}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Logistic Regression model artifact not found at {model_path}")
        
    _PREPROCESSOR = joblib.load(preprocessor_path)
    _MODEL = joblib.load(model_path)
    _FEATURE_NAMES = list(_PREPROCESSOR.get_feature_names_out())
    
    print(f"Artifacts loaded successfully from {os.path.dirname(model_path)}.")
    print(f"Preprocessor output features: {len(_FEATURE_NAMES)}")


# Auto-load on module import
load_artifacts()


def calculate_service_count(row: pd.Series) -> int:
    """
    Recreates Stage 3 ServiceCount feature logic:
    Sum of active subscribed services across 9 binary service categories.
    """
    count = 0
    if row.get('PhoneService') == 'Yes': count += 1
    if row.get('MultipleLines') == 'Yes': count += 1
    if row.get('InternetService') in ['DSL', 'Fiber optic']: count += 1
    for col in ['OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies']:
        if row.get(col) == 'Yes': count += 1
    return count


def preprocess_input(customer: CustomerData) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Converts a CustomerData Pydantic object into a 1-row DataFrame,
    applies feature engineering, and transforms via saved preprocessor.
    
    Returns:
        (raw_input_df, preprocessed_df_47_features)
    """
    data_dict = customer.model_dump()
    customer_id = data_dict.pop('customerID', 'DEMO-001')
    
    raw_df = pd.DataFrame([data_dict])
    
    # Feature Engineering (Identical to Stage 3/4/5)
    # 1. AverageMonthlySpend
    raw_df['AverageMonthlySpend'] = np.where(
        raw_df['tenure'] == 0,
        raw_df['MonthlyCharges'],
        raw_df['TotalCharges'] / raw_df['tenure']
    )
    
    # 2. ServiceCount
    raw_df['ServiceCount'] = raw_df.apply(calculate_service_count, axis=1)
    
    # Preprocessor transform
    proc_array = _PREPROCESSOR.transform(raw_df)
    proc_df = pd.DataFrame(proc_array, columns=_FEATURE_NAMES)
    
    return raw_df, proc_df


def predict_churn(customer: CustomerData) -> Tuple[PredictionResponse, pd.DataFrame, pd.DataFrame, float]:
    """
    Main prediction pipeline:
    CustomerData -> DataFrame -> Preprocess -> Predict Probability -> Categorize Risk Level.
    
    Returns:
        (PredictionResponse, raw_df, proc_df, probability)
    """
    customer_id = customer.customerID or "DEMO-001"
    raw_df, proc_df = preprocess_input(customer)
    
    # Predict Probability using Logistic Regression
    probabilities = _MODEL.predict_proba(proc_df.values)
    prob_churn = float(probabilities[0, 1])
    prob_percentage = round(prob_churn * 100.0, 2)
    
    # Risk Classification (Stage 4 Tiers):
    # prob >= 0.60 -> HIGH
    # 0.30 <= prob < 0.60 -> MEDIUM
    # prob < 0.30 -> LOW
    if prob_churn >= 0.60:
        risk_level = "HIGH"
    elif prob_churn >= 0.30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
        
    # Decision Boundary (Stage 4 default threshold = 0.50)
    prediction = "CHURN" if prob_churn >= 0.50 else "RETAIN"
    
    response = PredictionResponse(
        customer_id=customer_id,
        churn_probability=round(prob_churn, 4),
        churn_percentage=prob_percentage,
        risk_level=risk_level,
        prediction=prediction
    )
    
    return response, raw_df, proc_df, prob_churn


def is_model_loaded() -> bool:
    """Returns True if artifacts are preloaded."""
    return _PREPROCESSOR is not None and _MODEL is not None


def get_model_metadata() -> Dict[str, Any]:
    """Returns metadata and Stage 4 metrics."""
    return {
        "model": "Logistic Regression",
        "purpose": "Telecom customer churn prediction",
        "input_features": 20,
        "transformed_features": len(_FEATURE_NAMES) if _FEATURE_NAMES else 47,
        "metrics": {
            "roc_auc": 0.8421,
            "recall": 0.5561,
            "f1_score": 0.6020,
            "accuracy": 0.8048,
            "precision": 0.6562
        },
        "explainability": "SHAP (LinearExplainer)",
        "training_stage": "Stage 4",
        "explainability_stage": "Stage 5"
    }
