# Stage 6 — Production-Style FastAPI Backend Documentation

This document records the architectural design, API endpoints, Pydantic schemas, preloading mechanics, SHAP explanation pipeline, error handling strategies, test coverage, and local execution procedures for the **Customer Churn Prediction REST API**.

---

## 1. API Architecture & Module Design

The backend is built using **FastAPI** and follows clean separation of concerns:

```
api/
    __init__.py       # Package marker & version definition
    main.py           # FastAPI routes, CORS middleware, global exception handlers
    schemas.py        # Pydantic request and response schemas with domain validation
    predictor.py      # Artifact preloading, feature engineering, and inference service
    explainer.py      # Pre-loaded SHAP LinearExplainer and local attribution formatting
```

### Module Responsibilities:
- **`main.py`**: Initializes the FastAPI app, configures CORS middleware, declares endpoint handlers (`/`, `/health`, `/model-info`, `/predict`, `/predict/explain`), and handles custom HTTP 422/500 error responses.
- **`schemas.py`**: Defines strict Pydantic schemas (`CustomerData`, `PredictionResponse`, `ExplanationResponse`, `FactorImpact`, `HealthResponse`, `ModelInfoResponse`).
- **`predictor.py`**: Loads `models/preprocessor.joblib` and `models/logistic_regression.joblib` **once on startup**. Applies engineered features (`AverageMonthlySpend`, `ServiceCount`) and runs `.transform()` and `.predict_proba()`.
- **`explainer.py`**: Pre-initializes `shap.LinearExplainer` on the 47 preprocessed features to compute local SHAP feature attributions with non-causal language.

---

## 2. Endpoint Reference Table

| Method | Endpoint | Description | Request Body | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | API Root landing page & documentation link | None | `dict` |
| **GET** | `/health` | Application health check & artifact status | None | `HealthResponse` |
| **GET** | `/model-info` | Model metadata, feature counts & Stage 4 metrics | None | `ModelInfoResponse` |
| **POST** | `/predict` | Predict customer churn probability & risk level | `CustomerData` | `PredictionResponse` |
| **POST** | `/predict/explain` | Predict churn probability + top SHAP factors | `CustomerData` | `ExplanationResponse` |
| **GET** | `/docs` | Interactive Swagger UI API documentation | None | HTML UI |
| **GET** | `/redoc` | ReDoc API documentation | None | HTML UI |

---

## 3. Request Schema (`CustomerData`)

The `CustomerData` Pydantic model enforces strict data types, non-negative ranges, and enum constraints:

```python
class CustomerData(BaseModel):
    customerID: Optional[str] = "DEMO-001"
    gender: Literal["Female", "Male"]
    SeniorCitizen: int = Field(..., ge=0, le=1)
    Partner: Literal["Yes", "No"]
    Dependents: Literal["Yes", "No"]
    tenure: int = Field(..., ge=0, le=120)
    PhoneService: Literal["Yes", "No"]
    MultipleLines: Literal["Yes", "No", "No phone service"]
    InternetService: Literal["DSL", "Fiber optic", "No"]
    OnlineSecurity: Literal["Yes", "No", "No internet service"]
    OnlineBackup: Literal["Yes", "No", "No internet service"]
    DeviceProtection: Literal["Yes", "No", "No internet service"]
    TechSupport: Literal["Yes", "No", "No internet service"]
    StreamingTV: Literal["Yes", "No", "No internet service"]
    StreamingMovies: Literal["Yes", "No", "No internet service"]
    Contract: Literal["Month-to-month", "One year", "Two year"]
    PaperlessBilling: Literal["Yes", "No"]
    PaymentMethod: Literal[
        "Electronic check", 
        "Mailed check", 
        "Bank transfer (automatic)", 
        "Credit card (automatic)"
    ]
    MonthlyCharges: float = Field(..., ge=0.0)
    TotalCharges: float = Field(..., ge=0.0)
```

> [!NOTE]
> `customerID` is accepted optionally for customer tracking in responses but is **excluded from model feature transformation**.

---

## 4. Response Schemas

### Prediction Response (`POST /predict`):
```json
{
  "customer_id": "5178-LMXOP",
  "churn_probability": 0.8549,
  "churn_percentage": 85.49,
  "risk_level": "HIGH",
  "prediction": "CHURN"
}
```

### Explanation Response (`POST /predict/explain`):
```json
{
  "customer_id": "5178-LMXOP",
  "churn_probability": 0.8549,
  "churn_percentage": 85.49,
  "risk_level": "HIGH",
  "prediction": "CHURN",
  "top_churn_factors": [
    {
      "feature": "num__tenure",
      "feature_display_name": "Account Tenure (Months)",
      "value": 1,
      "shap_value": 1.5046,
      "contribution": "contributed toward higher predicted churn risk"
    },
    {
      "feature": "cat__Contract_Month-to-month",
      "feature_display_name": "Contract: Month-to-Month",
      "value": 1,
      "shap_value": 0.2770,
      "contribution": "contributed toward higher predicted churn risk"
    }
  ],
  "top_retention_factors": [
    {
      "feature": "num__TotalCharges",
      "feature_display_name": "Total Charges ($)",
      "value": 95.1,
      "shap_value": -0.4058,
      "contribution": "contributed toward customer retention"
    },
    {
      "feature": "num__ServiceCount",
      "feature_display_name": "Subscribed Services Count",
      "value": 5,
      "shap_value": -0.2147,
      "contribution": "contributed toward customer retention"
    }
  ]
}
```

---

## 5. Artifact Preloading & Memory Optimization

- **Preloading Strategy:** `preprocessor.joblib` and `logistic_regression.joblib` are preloaded into process memory upon module initialization in `api.predictor`.
- **Zero In-Request Disk Reads:** The API does not load joblib files repeatedly during individual HTTP requests.
- **Zero Model Retraining / Fitting:** Models are never retrained, and preprocessor statistics are never fitted on incoming request data.

---

## 6. Preprocessing & Feature Engineering Flow

```
Incoming JSON Request
        │
        ▼
Pydantic Validation (CustomerData)
        │
        ▼
1-Row Pandas DataFrame Construction
        │
        ▼
Feature Engineering:
  - AverageMonthlySpend = TotalCharges / tenure (0-tenure guard)
  - ServiceCount = Sum of active subscribed services across 9 categories
        │
        ▼
preprocessor.transform(df) ──► 47 Transformed Feature Columns
        │
        ▼
logistic_regression.predict_proba() ──► Churn Probability P
        │
        ▼
Risk Level & Decision Boundary Classification
```

### Risk Tier Boundaries (Stage 4 Threshold Analysis):
- **Decision Boundary ($P \ge 0.50$):** $P \ge 0.50 \rightarrow \text{Prediction: "CHURN"}$; $P < 0.50 \rightarrow \text{Prediction: "RETAIN"}$.
- **Risk Tiers:**
  - **HIGH Risk:** Probability $P \ge 0.60$
  - **MEDIUM Risk:** Probability $0.30 \le P < 0.60$
  - **LOW Risk:** Probability $P < 0.30$

---

## 7. SHAP Explanation Mechanics

- **Explainer:** `shap.LinearExplainer` initialized once on `logistic_regression.joblib`.
- **Calculation:** Computes 47 exact additive SHAP attributions in log-odds space for each request.
- **Factor Separation:**
  - **Top Churn Factors:** Positive SHAP values sorted descending ($+ \text{SHAP} > 0$).
  - **Top Retention Factors:** Negative SHAP values sorted ascending ($- \text{SHAP} < 0$).
- **Non-Causal Terminology:** All attributions specify *"contributed toward higher predicted churn risk"* or *"contributed toward customer retention"*. No causal claims are made.

---

## 8. Error Handling & Validation Policies

- **Validation Errors (HTTP 422):** Returns structured JSON detailing exact invalid fields when request payloads contain invalid data types, missing required attributes, or values outside allowed ranges (e.g. `tenure = -10` or invalid enum string).
- **Server Errors (HTTP 500):** Generic exception handler catches runtime errors and returns structured JSON error descriptions without exposing internal Python tracebacks.
- **Service Availability (HTTP 503):** Returned by `/health` if model artifacts fail to load.

---

## 9. CORS Configuration

Configured using FastAPI `CORSMiddleware` for local development origins:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:8000`
- `http://127.0.0.1:8000`

---

## 10. Automated Testing Strategy

Automated test suite located in `tests/test_api.py` executed via `pytest`:

```bash
.venv\Scripts\python.exe -m pytest tests/test_api.py -v
```

### Test Coverage (100% Pass Rate Across 9 Test Cases):
1. `test_root_endpoint`: GET `/` returns HTTP 200 and running status.
2. `test_health_endpoint`: GET `/health` returns HTTP 200 and artifact preloading flags.
3. `test_model_info_endpoint`: GET `/model-info` returns Stage 4 metrics (ROC-AUC `0.8421`).
4. `test_predict_valid_customer_high_risk`: POST `/predict` for Customer A (`5178-LMXOP`) returns `P = 0.8549`, `risk_level = "HIGH"`, `prediction = "CHURN"`.
5. `test_predict_valid_customer_low_risk`: POST `/predict` for Customer C (`4277-BWBML`) returns `P < 0.05`, `risk_level = "LOW"`, `prediction = "RETAIN"`.
6. `test_predict_invalid_categorical_input`: POST `/predict` with invalid contract string returns HTTP 422.
7. `test_predict_invalid_numeric_input`: POST `/predict` with negative tenure returns HTTP 422.
8. `test_predict_invalid_senior_citizen`: POST `/predict` with `SeniorCitizen = 5` returns HTTP 422.
9. `test_predict_explain_endpoint`: POST `/predict/explain` returns HTTP 200 with non-empty `top_churn_factors` and `top_retention_factors`.

---

## 11. Notebook vs. API Prediction Verification

To ensure zero prediction drift between Stage 4/5 development and Stage 6 API deployment, Customer A (`5178-LMXOP`) was evaluated across both pipelines:

| Metric | Stage 5 Notebook Output | Stage 6 API Endpoint Output | Difference ($\Delta$) | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Churn Probability** | `0.8549` | `0.8549` | `0.0000` | **Exact Match** |
| **Risk Level** | `HIGH` | `HIGH` | — | **Exact Match** |
| **Prediction** | `CHURN` | `CHURN` | — | **Exact Match** |
| **Top Churn Factor** | `tenure = 1` (+1.5046) | `tenure = 1` (+1.5046) | `0.0000` | **Exact Match** |

---

## 12. Local Execution Instructions

To launch the FastAPI dev server locally using Uvicorn:

```bash
# Activate python virtual environment and run uvicorn
.venv\Scripts\python.exe -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

Once running, access interactive API documentation at:
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc UI:** `http://127.0.0.1:8000/redoc`
- **Health Check:** `http://127.0.0.1:8000/health`
