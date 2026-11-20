import shap
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple

from api.schemas import CustomerData, ExplanationResponse, FactorImpact
from api.predictor import _MODEL, _FEATURE_NAMES, predict_churn

# SHAP explainer singleton
_EXPLAINER = None

# Feature display name mapping for clean business UI display
FEATURE_DISPLAY_NAMES = {
    'num__tenure': 'Account Tenure (Months)',
    'num__TotalCharges': 'Total Charges ($)',
    'num__MonthlyCharges': 'Monthly Recurring Charges ($)',
    'num__AverageMonthlySpend': 'Average Monthly Spend ($)',
    'num__ServiceCount': 'Subscribed Services Count',
    'cat__Contract_Month-to-month': 'Contract: Month-to-Month',
    'cat__Contract_One year': 'Contract: 1-Year Commitment',
    'cat__Contract_Two year': 'Contract: 2-Year Commitment',
    'cat__InternetService_Fiber optic': 'Internet: Fiber Optic',
    'cat__InternetService_DSL': 'Internet: DSL',
    'cat__InternetService_No': 'Internet: None',
    'cat__PaymentMethod_Electronic check': 'Payment Method: Electronic Check',
    'cat__PaymentMethod_Mailed check': 'Payment Method: Mailed Check',
    'cat__PaymentMethod_Bank transfer (automatic)': 'Payment Method: Automatic Bank Transfer',
    'cat__PaymentMethod_Credit card (automatic)': 'Payment Method: Automatic Credit Card',
    'cat__PaperlessBilling_Yes': 'Paperless Billing: Enabled',
    'cat__PaperlessBilling_No': 'Paperless Billing: Disabled',
    'cat__OnlineSecurity_No': 'Online Security: Not Subscribed',
    'cat__TechSupport_No': 'Tech Support: Not Subscribed',
    'cat__OnlineBackup_No': 'Online Backup: Not Subscribed',
    'cat__DeviceProtection_No': 'Device Protection: Not Subscribed',
    'cat__MultipleLines_No': 'Multiple Lines: Single Line',
    'cat__Dependents_Yes': 'Dependents: Yes',
    'cat__Partner_Yes': 'Partner: Yes',
    'cat__SeniorCitizen_1': 'Senior Citizen: Yes'
}


def init_explainer():
    """
    Initializes SHAP LinearExplainer once at application startup.
    """
    global _EXPLAINER
    if _MODEL is not None:
        # For linear models, shap.LinearExplainer requires a background mask DataFrame or model object
        _EXPLAINER = shap.LinearExplainer(_MODEL, masker=pd.DataFrame(np.zeros((1, len(_FEATURE_NAMES))), columns=_FEATURE_NAMES))
        print("SHAP LinearExplainer initialized successfully.")


# Auto-initialize on import
init_explainer()


def format_feature_display(feat_name: str) -> str:
    """Returns human-readable display name for transformed feature column."""
    if feat_name in FEATURE_DISPLAY_NAMES:
        return FEATURE_DISPLAY_NAMES[feat_name]
    
    # Generic formatter
    clean_name = feat_name.replace('num__', '').replace('cat__', '').replace('_', ' ')
    return clean_name


def get_raw_feature_value(feat_name: str, raw_df: pd.DataFrame, proc_df: pd.DataFrame) -> Any:
    """
    Retrieves original raw customer value associated with preprocessed feature column.
    """
    if feat_name.startswith('num__'):
        col = feat_name.replace('num__', '')
        if col in raw_df.columns:
            val = raw_df[col].iloc[0]
            if isinstance(val, (float, np.floating)):
                return round(float(val), 2)
            return val
    elif feat_name.startswith('cat__'):
        # One-hot encoded feature
        proc_val = proc_df[feat_name].iloc[0]
        return int(proc_val)
        
    return proc_df[feat_name].iloc[0]


def explain_customer_prediction(customer: CustomerData, top_n: int = 5) -> ExplanationResponse:
    """
    Generates local prediction explanation using SHAP values:
    1. Computes prediction probability and risk classification.
    2. Calculates individual SHAP values for the preprocessed 47 features.
    3. Sorts factors into top churn drivers (+SHAP) and top retention stabilizers (-SHAP).
    """
    pred_res, raw_df, proc_df, _ = predict_churn(customer)
    
    # Calculate SHAP values for the 1-row sample
    shap_obj = _EXPLAINER(proc_df)
    shap_vals = shap_obj.values[0]  # 47 SHAP values
    
    # Build attribution DataFrame
    attributions = []
    for feat_name, s_val in zip(_FEATURE_NAMES, shap_vals):
        val = get_raw_feature_value(feat_name, raw_df, proc_df)
        disp_name = format_feature_display(feat_name)
        attributions.append({
            'feature': feat_name,
            'feature_display_name': disp_name,
            'value': val,
            'shap_value': round(float(s_val), 4)
        })
        
    df_attr = pd.DataFrame(attributions)
    
    # Top Churn Factors (+SHAP > 0) sorted descending
    churn_df = df_attr[df_attr['shap_value'] > 0].sort_values('shap_value', ascending=False).head(top_n)
    top_churn_factors = []
    for _, row in churn_df.iterrows():
        top_churn_factors.append(FactorImpact(
            feature=row['feature'],
            feature_display_name=row['feature_display_name'],
            value=row['value'],
            shap_value=row['shap_value'],
            contribution="contributed toward higher predicted churn risk"
        ))
        
    # Top Retention Factors (-SHAP < 0) sorted ascending (most negative first)
    retention_df = df_attr[df_attr['shap_value'] < 0].sort_values('shap_value', ascending=True).head(top_n)
    top_retention_factors = []
    for _, row in retention_df.iterrows():
        top_retention_factors.append(FactorImpact(
            feature=row['feature'],
            feature_display_name=row['feature_display_name'],
            value=row['value'],
            shap_value=row['shap_value'],
            contribution="contributed toward customer retention"
        ))
        
    explanation_response = ExplanationResponse(
        customer_id=pred_res.customer_id,
        churn_probability=pred_res.churn_probability,
        churn_percentage=pred_res.churn_percentage,
        risk_level=pred_res.risk_level,
        prediction=pred_res.prediction,
        top_churn_factors=top_churn_factors,
        top_retention_factors=top_retention_factors
    )
    
    return explanation_response
