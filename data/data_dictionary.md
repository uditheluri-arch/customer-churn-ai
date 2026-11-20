# Data Dictionary — IBM Telco Customer Churn Dataset

This data dictionary outlines all 21 attributes present in `data/telco_customer_churn.csv`, detailing their data types, business definitions, and potential use for machine learning models.

| Column | Type | Meaning | Potential ML Use |
| ------ | ---- | ------- | ---------------- |
| `customerID` | Categorical (String) | Unique alphanumeric identifier for each customer | **No** — High cardinality identifier; causes overfitting if included. |
| `gender` | Categorical (Binary) | Customer's gender (`Male`, `Female`) | **Yes** — Demographic feature. |
| `SeniorCitizen` | Numerical / Categorical (Binary) | Whether the customer is a senior citizen (`1`: Yes, `0`: No) | **Yes** — Demographic feature indicating age group. |
| `Partner` | Categorical (Binary) | Whether the customer has a partner (`Yes`, `No`) | **Yes** — Household composition feature. |
| `Dependents` | Categorical (Binary) | Whether the customer has dependents (`Yes`, `No`) | **Yes** — Household composition feature. |
| `tenure` | Numerical (Discrete, Months) | Number of months the customer has stayed with the company | **Yes** — Crucial predictor representing customer relationship length/loyalty. |
| `PhoneService` | Categorical (Binary) | Whether the customer has a phone service subscription (`Yes`, `No`) | **Yes** — Core product feature. |
| `MultipleLines` | Categorical | Whether customer has multiple phone lines (`Yes`, `No`, `No phone service`) | **Yes** — Phone service add-on feature. |
| `InternetService` | Categorical | Customer's internet service provider type (`DSL`, `Fiber optic`, `No`) | **Yes** — Crucial product line predictor. |
| `OnlineSecurity` | Categorical | Whether customer has online security add-on (`Yes`, `No`, `No internet service`) | **Yes** — Value-added security feature. |
| `OnlineBackup` | Categorical | Whether customer has online backup add-on (`Yes`, `No`, `No internet service`) | **Yes** — Value-added cloud storage feature. |
| `DeviceProtection` | Categorical | Whether customer has tech device protection plan (`Yes`, `No`, `No internet service`) | **Yes** — Value-added warranty feature. |
| `TechSupport` | Categorical | Whether customer has tech support service (`Yes`, `No`, `No internet service`) | **Yes** — Key customer support & retention feature. |
| `StreamingTV` | Categorical | Whether customer has streaming TV service (`Yes`, `No`, `No internet service`) | **Yes** — Entertainment content add-on. |
| `StreamingMovies` | Categorical | Whether customer has streaming movies service (`Yes`, `No`, `No internet service`) | **Yes** — Entertainment content add-on. |
| `Contract` | Categorical | The contract commitment term (`Month-to-month`, `One year`, `Two year`) | **Yes** — Crucial churn predictor indicating commitment level. |
| `PaperlessBilling` | Categorical (Binary) | Whether the customer chose paperless billing (`Yes`, `No`) | **Yes** — Billing method feature. |
| `PaymentMethod` | Categorical | Payment method (`Electronic check`, `Mailed check`, `Bank transfer (automatic)`, `Credit card (automatic)`) | **Yes** — Payment mechanism predictor. |
| `MonthlyCharges` | Numerical (Continuous, USD) | The amount charged to the customer monthly | **Yes** — Financial cost feature. |
| `TotalCharges` | Numerical (Continuous, USD) | Total amount charged over the customer's entire tenure | **Yes** — Cumulative financial value feature (requires type conversion from string to float). |
| `Churn` | Categorical (Binary) | Target Variable: Whether the customer churned in the last month (`Yes`, `No`) | **Target** — Ground truth label for binary classification. |
