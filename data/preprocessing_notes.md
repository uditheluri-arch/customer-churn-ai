# Data Preprocessing & Feature Engineering Documentation

This document records all data cleaning, feature engineering, and pipeline construction steps performed during **Stage 3** of the **Customer Churn Prediction + Explainable AI** project.

---

## 1. Raw Data Quality & Cleaning Decisions

### A. TotalCharges Conversion & Imputation
- **Problem Identified:** `TotalCharges` was stored as a generic text string (`object` data type) in the raw CSV.
- **Root Cause:** Exactly **11 rows** contained whitespace strings (`" "`). Inspection revealed these 11 rows belonged to brand-new customers with `tenure == 0` months who had not yet completed a billing cycle.
- **Solution:**
  1. Converted `TotalCharges` to numeric using `pd.to_numeric(df['TotalCharges'], errors='coerce')`, transforming blank strings into `NaN`.
  2. Rather than dropping these rows (which would lose valid customer records), `NaN` values are imputed with the median of `TotalCharges` during numerical preprocessing, or set equal to `MonthlyCharges` for zero-tenure records.
  3. The raw CSV (`data/telco_customer_churn.csv`) remains untouched.

### B. Removal of Customer Identifier (`customerID`)
- **Action:** Dropped `customerID` from the feature matrix `X`.
- **Rationale:** `customerID` is a 100% unique alphanumeric key (`7,043` unique values across `7,043` records). Including high-cardinality random identifiers in machine learning features causes severe overfitting, as tree algorithms will memorize arbitrary key strings rather than generalizable customer behavior patterns.

---

## 2. Target Encoding (`y`)
- **Mapping:** `Churn` text strings converted to binary integers:
  - `"No"` $\rightarrow$ `0` (Retained)
  - `"Yes"` $\rightarrow$ `1` (Churned)
- **Distribution:** `5,174` zeros (`73.46%`) vs. `1,869` ones (`26.54%`).

---

## 3. Data Leakage Prevention & Train/Test Split

### A. Stratified Train/Test Split
- **Split Ratio:** 80% Training (`5,634` samples) / 20% Testing (`1,409` samples).
- **Stratification:** Performed with `stratify=y` to preserve the ~26.5% churn ratio identically across both train and test splits.
- **Random Seed:** Set `random_state=42` for 100% experiment reproducibility.

### B. Strict Fitting Workflow
- **Rule:** The `ColumnTransformer` preprocessor is **fitted ONLY on `X_train`**.
- **Reasoning:** Fitting imputation statistics (e.g., medians) or encoding maps on the combined dataset before splitting causes **Data Leakage**. Information from the test set would leak into the training set, producing overly optimistic validation scores that fail in production.

---

## 4. Feature Engineering

Two domain-specific features were engineered prior to transformation:

### A. `AverageMonthlySpend`
- **Formula:** $\text{AverageMonthlySpend} = \frac{\text{TotalCharges}}{\text{tenure}}$
- **Zero-Division Defense:** For new customers with `tenure == 0`, `AverageMonthlySpend` defaults to `MonthlyCharges`.
- **Business Rationale:** Compares historical average monthly spending against current `MonthlyCharges`. A sudden increase in current charges relative to historical average spend often triggers price-sensitivity churn.
- **Leakage Check:** Uses only past account financial history per customer; zero test-set leakage risk.

### B. `ServiceCount`
- **Formula:** Sum of active subscribed services across 9 binary service categories:
  - `PhoneService`, `MultipleLines` (if 'Yes'), `InternetService` (if 'DSL' or 'Fiber optic'), `OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`.
- **Business Rationale:** Quantifies customer ecosystem stickiness. Customers with higher service counts experience higher switching costs and exhibit lower churn rates.
- **Leakage Check:** Derived directly from individual customer service records; zero test-set leakage risk.

---

## 5. Preprocessing Pipeline (`ColumnTransformer`)

### A. Numerical Pipeline
- **Transformer:** `SimpleImputer(strategy='median')`
- **Scaling Decision:** Scaling (e.g., `StandardScaler`) was omitted at this stage because our primary downstream classifier (XGBoost / Gradient Boosting) is invariant to monotonic feature scaling. (Scaling can easily be appended if linear/distance models are evaluated later).

### B. Categorical Pipeline
- **Transformers:** `SimpleImputer(strategy='most_frequent')` + `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`
- **Unknown Categories Defense:** `handle_unknown='ignore'` ensures that if a new unseen category appears during API production inference, it is encoded as all zeros without throwing a runtime exception.

---

## 6. Final Feature Counts & Dimensions

- **Original Raw Features:** 20 features (excluding `customerID` & `Churn`).
- **Engineered Features Added:** 2 (`AverageMonthlySpend`, `ServiceCount`).
- **One-Hot Encoded Features:** 43 binary columns generated from categorical variables.
- **Final Preprocessed Matrix Dimensions:**
  - `X_train_processed`: `(5634, 47)`
  - `X_test_processed`: `(1409, 47)`
- **Serialized Artifact:** Saved preprocessor to [preprocessor.joblib](file:///c:/Users/eluri%20surya%20vamsi/OneDrive/Desktop/customer-churn-ai/models/preprocessor.joblib).
- **ML Model Training:** `0` models trained (as restricted for Stage 3).
