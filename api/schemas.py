from typing import Literal, Optional, List, Union, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class CustomerData(BaseModel):
    """
    Pydantic request schema representing individual customer attributes.
    Matches raw dataset feature definitions with strict domain validation.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "customerID": "5178-LMXOP",
                "gender": "Female",
                "SeniorCitizen": 0,
                "Partner": "No",
                "Dependents": "No",
                "tenure": 1,
                "PhoneService": "Yes",
                "MultipleLines": "No",
                "InternetService": "Fiber optic",
                "OnlineSecurity": "No",
                "OnlineBackup": "No",
                "DeviceProtection": "No",
                "TechSupport": "No",
                "StreamingTV": "Yes",
                "StreamingMovies": "No",
                "Contract": "Month-to-month",
                "PaperlessBilling": "Yes",
                "PaymentMethod": "Electronic check",
                "MonthlyCharges": 95.10,
                "TotalCharges": 95.10
            }
        }
    )

    customerID: Optional[str] = Field(
        default="DEMO-001",
        description="Optional customer identifier string for display purposes (excluded from ML feature matrix)"
    )
    gender: Literal["Female", "Male"] = Field(..., description="Customer gender")
    SeniorCitizen: int = Field(..., ge=0, le=1, description="Whether the customer is a senior citizen (0 = No, 1 = Yes)")
    Partner: Literal["Yes", "No"] = Field(..., description="Whether the customer has a partner")
    Dependents: Literal["Yes", "No"] = Field(..., description="Whether the customer has dependents")
    tenure: int = Field(..., ge=0, le=120, description="Number of months the customer has stayed with the company")
    PhoneService: Literal["Yes", "No"] = Field(..., description="Whether the customer has phone service")
    MultipleLines: Literal["Yes", "No", "No phone service"] = Field(..., description="Whether customer has multiple lines")
    InternetService: Literal["DSL", "Fiber optic", "No"] = Field(..., description="Customer internet service provider type")
    OnlineSecurity: Literal["Yes", "No", "No internet service"] = Field(..., description="Whether customer has online security service")
    OnlineBackup: Literal["Yes", "No", "No internet service"] = Field(..., description="Whether customer has online backup service")
    DeviceProtection: Literal["Yes", "No", "No internet service"] = Field(..., description="Whether customer has device protection plan")
    TechSupport: Literal["Yes", "No", "No internet service"] = Field(..., description="Whether customer has tech support service")
    StreamingTV: Literal["Yes", "No", "No internet service"] = Field(..., description="Whether customer has streaming TV service")
    StreamingMovies: Literal["Yes", "No", "No internet service"] = Field(..., description="Whether customer has streaming movies service")
    Contract: Literal["Month-to-month", "One year", "Two year"] = Field(..., description="Customer contract term commitment")
    PaperlessBilling: Literal["Yes", "No"] = Field(..., description="Whether customer uses paperless billing")
    PaymentMethod: Literal["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"] = Field(
        ..., description="Customer payment billing method"
    )
    MonthlyCharges: float = Field(..., ge=0.0, description="Amount charged to customer monthly ($)")
    TotalCharges: float = Field(..., ge=0.0, description="Total amount charged to customer to date ($)")


class PredictionResponse(BaseModel):
    """
    Standardized API prediction output schema.
    """
    customer_id: str = Field(..., description="Customer identifier string")
    churn_probability: float = Field(..., ge=0.0, le=1.0, description="Model predicted churn risk probability (0.0 to 1.0)")
    churn_percentage: float = Field(..., ge=0.0, le=100.0, description="Model predicted churn probability formatted as percentage (%)")
    risk_level: Literal["LOW", "MEDIUM", "HIGH"] = Field(..., description="Business risk category classification")
    prediction: Literal["CHURN", "RETAIN"] = Field(..., description="Binary prediction decision at 0.50 threshold")


class FactorImpact(BaseModel):
    """
    Individual SHAP feature attribution element.
    """
    feature: str = Field(..., description="Transformed preprocessor feature column name")
    feature_display_name: str = Field(..., description="Human-readable business feature label")
    value: Union[int, float, str] = Field(..., description="Customer feature value")
    shap_value: float = Field(..., description="SHAP attribution value in log-odds space")
    contribution: str = Field(..., description="Non-causal contribution directional statement")


class ExplanationResponse(PredictionResponse):
    """
    Extended API output schema containing SHAP local feature attributions.
    """
    top_churn_factors: List[FactorImpact] = Field(..., description="Top features contributing toward higher predicted churn risk")
    top_retention_factors: List[FactorImpact] = Field(..., description="Top features contributing toward customer retention")


class HealthResponse(BaseModel):
    """
    API health check response schema.
    """
    status: str = Field(default="healthy")
    model: str = Field(default="logistic_regression")
    model_loaded: bool = Field(...)
    preprocessor_loaded: bool = Field(...)


class ModelInfoResponse(BaseModel):
    """
    Model metadata and Stage 4 evaluation metrics response schema.
    """
    model: str = Field(default="Logistic Regression")
    purpose: str = Field(default="Telecom customer churn prediction")
    input_features: int = Field(default=20)
    transformed_features: int = Field(default=47)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    explainability: str = Field(default="SHAP (LinearExplainer)")
    training_stage: str = Field(default="Stage 4")
    explainability_stage: str = Field(default="Stage 5")
