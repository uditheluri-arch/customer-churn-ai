import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from api.schemas import (
    CustomerData,
    PredictionResponse,
    ExplanationResponse,
    HealthResponse,
    ModelInfoResponse
)
from api.predictor import (
    predict_churn,
    is_model_loaded,
    get_model_metadata
)
from api.explainer import explain_customer_prediction

# Initialize FastAPI application
app = FastAPI(
    title="Customer Churn Prediction & Explainability API",
    description=(
        "Production-style REST API serving a Logistic Regression Machine Learning model "
        "and SHAP local feature attributions for Telecom Customer Churn Prediction."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware
DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
if allowed_origins_env:
    # Support comma-separated origins from environment variable
    parsed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
    # Safety: Do not blindly allow wildcard '*' when allow_credentials=True (prohibited by CORS spec)
    origins = [origin for origin in parsed_origins if origin != "*"]
    if not origins:
        origins = DEFAULT_ORIGINS
else:
    origins = DEFAULT_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """Formats Pydantic validation errors cleanly."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "The request payload failed input validation checks.",
            "details": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    """Global fallback exception handler to prevent leaking internal stack traces."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing the request."
        }
    )


# API Endpoints
@app.get("/", summary="API Root Landing Page", tags=["System"])
async def root():
    """
    Root endpoint displaying API metadata and documentation link.
    """
    return {
        "message": "Customer Churn Prediction & Explainable AI API",
        "status": "running",
        "docs_url": "/docs",
        "health_check": "/health"
    }


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check Endpoint",
    tags=["System"]
)
async def health_check():
    """
    Verifies API status and preloaded model artifact availability.
    """
    loaded = is_model_loaded()
    if not loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model binaries or preprocessor pipeline failed to load."
        )
    return HealthResponse(
        status="healthy",
        model="logistic_regression",
        model_loaded=loaded,
        preprocessor_loaded=loaded
    )


@app.get(
    "/model-info",
    response_model=ModelInfoResponse,
    summary="Model Metadata & Evaluation Metrics",
    tags=["Model"]
)
async def model_info():
    """
    Returns model architecture, feature counts, and Stage 4 evaluation metrics.
    """
    metadata = get_model_metadata()
    return ModelInfoResponse(**metadata)


@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Generate Customer Churn Risk Prediction",
    tags=["Prediction"]
)
async def predict(customer: CustomerData):
    """
    Accepts customer profile data, applies saved preprocessing pipeline, 
    and predicts churn risk probability and risk level.
    """
    try:
        response, _, _, _ = predict_churn(customer)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction pipeline execution error: {str(e)}"
        )


@app.post(
    "/predict/explain",
    response_model=ExplanationResponse,
    summary="Generate Customer Churn Prediction with SHAP Explanations",
    tags=["Prediction & Explainability"]
)
async def predict_and_explain(customer: CustomerData):
    """
    Accepts customer profile data, generates churn prediction, and computes 
    local SHAP feature attributions for top churn and retention factors.
    """
    try:
        explanation = explain_customer_prediction(customer, top_n=5)
        return explanation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SHAP explanation pipeline execution error: {str(e)}"
        )
