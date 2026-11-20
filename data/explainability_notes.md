# Stage 5 — Explainable AI (SHAP) Technical & Business Documentation

This document records the methodology, global feature attributions, local customer case studies, business retention workflows, and technical limitations derived from applying **SHAP (SHapley Additive exPlanations)** to the **Customer Churn Prediction** model.

---

## 1. Model Explained & Selection Rationale

### Baseline Performance Summary (Stage 4 Evaluation):
In Stage 4, three baseline classification models were trained and evaluated on the held-out test dataset (`1,409` samples, `47` preprocessed features):

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | **80.48%** | **65.62%** | **55.61%** | **0.6020** | **0.8421** |
| **XGBoost** | 79.35% | 63.61% | 51.87% | 0.5714 | 0.8363 |
| **Random Forest** | 78.85% | 62.93% | 49.47% | 0.5539 | 0.8195 |

### Selection Rationale:
1. **Primary Baseline Model Selected:** **Logistic Regression** achieved the highest performance across all primary metrics: top **Recall (55.61%)**, **F1-Score (0.6020)**, and **ROC-AUC (0.8421)**.
2. **Business Impact of Recall:** In telecom churn prediction, False Negatives (unidentified churners who leave for competitors) represent lost customer lifetime value. Logistic Regression correctly identified **208 out of 374** actual churners in the test set, outperforming XGBoost (194 TP) and Random Forest (185 TP).
3. **Artifact Integrity:** `models/logistic_regression.joblib` and `models/xgboost.joblib` were loaded directly; zero retraining or model modification was performed.

---

## 2. SHAP Method Used & Mathematical Framework

### SHAP Explainers Configured:
- **Primary Explainer:** `shap.LinearExplainer(logistic_regression, X_test_df)`
  - **Mathematical Formulation:** Calculates exact additive feature attributions in log-odds space:
    $$\text{logit}(P) = \beta_0 + \sum_{i=1}^{p} \phi_i(x)$$
    where $\phi_i(x) = \beta_i (x_i - \mathbb{E}[X_i])$ represents the SHAP value for feature $i$.
- **Comparative Tree Explainer:** `shap.TreeExplainer(xgboost)`
  - Used to contrast non-linear tree split attributions against linear log-odds attributions.

### Input Data & Dimension Matching:
- **Explanation Set:** 100% held-out test data (`1,409` samples, `47` features).
- **Feature Names:** Mapped directly from `preprocessor.get_feature_names_out()`.
- **Dimension Check:** `number of SHAP features (47) == number of preprocessor output columns (47)`.

---

## 3. Global Feature Importance Findings

Global feature importance is measured by the mean absolute SHAP value across all 1,409 test set customers:

$$\text{Importance}_j = \frac{1}{N} \sum_{k=1}^{N} |\phi_j^{(k)}|$$

Mean absolute SHAP values are non-negative magnitudes measuring total overall feature influence without direction:

### Top 15 Global Features Ranked by Mean $| \text{SHAP Value} |$ (Magnitudes):

| Rank | Feature Name | Feature Type | Mean $\| \text{SHAP Value} \|$ Magnitude | Primary Impact Direction |
| :---: | :--- | :---: | :---: | :--- |
| **1** | `num__tenure` | Numerical | **1.10** | Low tenure $\rightarrow + \text{SHAP}$ (High Churn Risk) |
| **2** | `num__TotalCharges` | Numerical | **0.39** | Low total charges $\rightarrow + \text{SHAP}$ |
| **3** | `num__ServiceCount` | Numerical | **0.35** | Low service count $\rightarrow + \text{SHAP}$ |
| **4** | `cat__Contract_Month-to-month` | One-Hot Binary | **0.30** | Presence (`1`) $\rightarrow + \text{SHAP}$ (High Churn Risk) |
| **5** | `cat__Contract_Two year` | One-Hot Binary | **0.23** | Presence (`1`) $\rightarrow - \text{SHAP}$ (Strong Retention) |
| **6** | `num__AverageMonthlySpend` | Numerical | **0.23** | High spend relative to tenure $\rightarrow + \text{SHAP}$ |
| **7** | `cat__MultipleLines_No` | One-Hot Binary | **0.15** | Single line $\rightarrow + \text{SHAP}$ |
| **8** | `cat__PaperlessBilling_No` | One-Hot Binary | **0.13** | Paper billing $\rightarrow - \text{SHAP}$ (Slight Retention) |
| **9** | `num__MonthlyCharges` | Numerical | **0.13** | High monthly charges $\rightarrow + \text{SHAP}$ |
| **10** | `cat__InternetService_Fiber optic` | One-Hot Binary | **0.11** | Fiber optic subscription $\rightarrow + \text{SHAP}$ |
| **11** | `cat__InternetService_DSL` | One-Hot Binary | **0.11** | DSL subscription $\rightarrow - \text{SHAP}$ |
| **12** | `cat__PaymentMethod_Electronic check` | One-Hot Binary | **0.10** | Electronic check $\rightarrow + \text{SHAP}$ |
| **13** | `cat__Dependents_Yes` | One-Hot Binary | **0.08** | Has dependents $\rightarrow - \text{SHAP}$ |
| **14** | `cat__OnlineSecurity_No` | One-Hot Binary | **0.07** | No online security $\rightarrow + \text{SHAP}$ |
| **15** | `cat__StreamingTV_No` | One-Hot Binary | **0.07** | No streaming TV $\rightarrow + \text{SHAP}$ |

---

## 4. Feature Direction & Non-Causal Interpretation Guidelines

### Directional Rules:
1. **Positive SHAP Value ($+ \phi_i > 0$):** Pushes the log-odds prediction higher, **increasing predicted churn risk**.
2. **Negative SHAP Value ($- \phi_i < 0$):** Pushes the log-odds prediction lower, **increasing predicted customer retention**.

### Non-Causal Interpretation Statement (Fiber Optic):
"Fiber optic service is associated with positive SHAP contributions in this model, indicating that its presence can increase predicted churn risk for some customers. SHAP does not establish why this association exists or imply causation."

### Non-Causal Terminology Standard:
> [!WARNING]
> **Strict Non-Causal Attribution Rules:**
> - **Incorrect (Causal Claim):** "Low tenure causes customers to churn."
> - **Correct (Attribution Claim):** "Low customer tenure contributes strongly toward elevating the model's predicted churn risk."

---

## 5. Technical Notes on Dependence Plots & Waterfall Scales

### Technical Note 1: Dependence Plot Linearity
The dependence plots for Logistic Regression exhibit approximately linear relationships because the selected model is Logistic Regression and SHAP is explaining its linear log-odds decision function ($	ext{logit}(P) = Xeta$). For linear models, the SHAP value of a continuous feature $x_j$ is equal to $eta_j (x_j - \mathbb{E}[x_j])$, which is strictly linear in $x_j$.

### Technical Note 2: Waterfall Plot Output Space vs. Predicted Probability
In SHAP waterfall plots, the baseline value $E[f(x)]$ and final output value $f(x)$ are expressed in model output / log-odds space ($f(x) = 	ext{logit}(P)$). The predicted churn probability $P = \sigma(f(x)) = rac{1}{1 + e^{-f(x)}}$ is mapped from log-odds to probability space via the sigmoid function.

---

## 6. Local Customer Explanations (Waterfall Case Studies)

Three actual test-set customers were analyzed using local SHAP waterfall decompositions:

### Case Study A: High-Risk Customer (`customerID`: `5178-LMXOP`)
- **Model Output:** Predicted Churn Probability = **0.855** (85.49%). Actual Target = **Churned (`1`)**.
- **Base Value (Dataset Average Log-Odds):** $\mathbb{E}[f(x)] = -1.037$ (Prob $pprox 26.2\%$).
- **Top 4 Churn Risk Drivers ($+ 	ext{SHAP}$):**
  1. `num__tenure = 1.0` month $ightarrow +1.5046$ SHAP
  2. `num__AverageMonthlySpend = $95.10` $ightarrow +0.2937$ SHAP
  3. `cat__Contract_Month-to-month = 1` $ightarrow +0.2770$ SHAP
  4. `num__MonthlyCharges = $95.10` $ightarrow +0.1680$ SHAP
  5. `cat__PaymentMethod_Electronic check = 1` $ightarrow +0.1584$ SHAP
- **Top 2 Retention Stabilizers ($- 	ext{SHAP}$):**
  1. `num__TotalCharges = $95.10` $ightarrow -0.4058$ SHAP
  2. `num__ServiceCount = 5.0` services $ightarrow -0.2147$ SHAP

### Case Study B: Medium/Borderline Risk Customer (`customerID`: `1452-KIOVK`)
- **Model Output:** Predicted Churn Probability = **0.482** (48.16%). Actual Target = **Retained (`0`)**.
- **Top 3 Churn Risk Drivers ($+ 	ext{SHAP}$):**
  1. `num__tenure = 22.0` months $ightarrow +0.4479$ SHAP
  2. `cat__Contract_Month-to-month = 1` $ightarrow +0.2770$ SHAP
  3. `num__AverageMonthlySpend = $88.61` $ightarrow +0.2382$ SHAP
- **Top 3 Retention Stabilizers ($- 	ext{SHAP}$):**
  1. `num__ServiceCount = 5.0` services $ightarrow -0.2147$ SHAP
  2. `cat__Dependents_Yes = 1` $ightarrow -0.1361$ SHAP
  3. `cat__PaymentMethod_Credit card (auto) = 1` $ightarrow -0.1330$ SHAP

### Case Study C: Low-Risk Customer (`customerID`: `4277-BWBML`)
- **Model Output:** Predicted Churn Probability = **0.002** (0.18%). Actual Target = **Retained (`0`)**.
- **Top 4 Retention Stabilizers ($- 	ext{SHAP}$):**
  1. `num__tenure = 72.0` months $ightarrow -2.0682$ SHAP
  2. `cat__Contract_Two year = 1` $ightarrow -0.5058$ SHAP
  3. `num__AverageMonthlySpend = $18.37` $ightarrow -0.3632$ SHAP
  4. `cat__Contract_Month-to-month = 0` $ightarrow -0.3252$ SHAP
  5. `num__MonthlyCharges = $19.95` $ightarrow -0.2036$ SHAP

---

## 7. Business Interpretation & Retention Workflow

### Customer Retention Playbook Example:
When a frontline customer success representative reviews Customer A (`5178-LMXOP`):
1. **Model Alert:** High risk of imminent churn ($P = 0.855$).
2. **SHAP Breakdown:** The model's alarm is driven primarily by **short account tenure (1 month)**, a **month-to-month contract**, **high monthly charges ($95.10/mo)**, and **manual electronic check billing**.
3. **Targeted Intervention Plan:**
   - **Contract Incentive:** Offer a 15% discount on MonthlyCharges in exchange for converting to a 1-year contract.
   - **Billing Optimization:** Transition the customer to automatic bank transfer / credit card payment to eliminate manual check friction.
   - **Service Onboarding:** Schedule a complimentary onboarding session for their subscribed services (`ServiceCount = 5`) to increase feature adoption and satisfaction.

---

## 8. EDA vs SHAP Comparative Synthesis

| Feature | Stage 2 Bivariate EDA Finding | Stage 5 SHAP Model Attribution | Alignment Assessment |
| :--- | :--- | :--- | :--- |
| **`tenure`** | Customer churn rate peaked in months 1-12 (~40%+ churn rate), decaying rapidly after 24+ months. | Ranked **#1 global feature** (`mean |SHAP| = 1.10`). Low tenure produces large positive SHAP values. | **Strong Agreement:** EDA identified high churn among low-tenure customers, and SHAP ranks tenure as the #1 global feature. |
| **`Contract`** | Month-to-month contract churn was 42.7% vs. 1-year (11.3%) and 2-year (2.8%). | `Contract_Month-to-month` is #4 feature (`0.30`); `Contract_Two year` is #5 (`0.23`). | **Strong Agreement:** Month-to-month elevates risk; 2-year secures retention. |
| **`MonthlyCharges`** | Fiber optic customers paid higher monthly charges ($91.50 avg) and churned at 41.9%. | High `MonthlyCharges` and `Fiber optic` generate positive SHAP contributions. | **Strong Agreement:** Higher charges increase price sensitivity and model churn risk. |
| **`ServiceCount`** | Customers with 5+ subscribed services had significantly lower churn rates (~15%). | Ranked **#3 global feature** (`mean |SHAP| = 0.35`). High `ServiceCount` pushes SHAP negative. | **Strong Agreement:** EDA indicated that customers with more services tend to have lower churn, while SHAP ranks ServiceCount as the #3 feature and higher service counts generally push predictions toward retention. |

---

## 9. Technical & Business Limitations of SHAP

1. **Behavioral Attribution vs Causality:** SHAP explains how the machine learning model combines input features to compute a prediction. It does **not** prove physical real-world cause-and-effect.
2. **Static Counterfactual Assumption:** Changing a customer's contract text column in a CRM database does not automatically alter their underlying customer sentiment or budget constraints.
3. **Correlated Feature Redistribution:** When features are highly correlated (e.g. `tenure` and `TotalCharges`), SHAP distributes predictive importance across the correlated set based on marginal feature combinations.
4. **Model Architecture Dependence:** SHAP values are strictly conditional on the trained model parameters and training dataset distribution.
5. **Operational Context Requirement:** SHAP outputs must be integrated with business domain rules before taking customer-facing actions.

---

## 10. Saved Artifacts Verification

All Stage 5 visualization artifacts have been generated and exported to `reports/shap/`:

- [shap_beeswarm.png](file:///c:/Users/eluri%20surya%20vamsi/OneDrive/Desktop/customer-churn-ai/reports/shap/shap_beeswarm.png) (365.9 KB) — Global SHAP beeswarm plot (top 20 features).
- [shap_feature_importance.png](file:///c:/Users/eluri%20surya%20vamsi/OneDrive/Desktop/customer-churn-ai/reports/shap/shap_feature_importance.png) (344.6 KB) — Global mean absolute SHAP bar plot.
- [shap_dependence_tenure.png](file:///c:/Users/eluri%20surya%20vamsi/OneDrive/Desktop/customer-churn-ai/reports/shap/shap_dependence_tenure.png) (150.0 KB) — Dependence scatter plot for `tenure`.
- [shap_dependence_monthly_charges.png](file:///c:/Users/eluri%20surya%20vamsi/OneDrive/Desktop/customer-churn-ai/reports/shap/shap_dependence_monthly_charges.png) (159.4 KB) — Dependence scatter plot for `MonthlyCharges`.
- [shap_waterfall_high_risk.png](file:///c:/Users/eluri%20surya%20vamsi/OneDrive/Desktop/customer-churn-ai/reports/shap/shap_waterfall_high_risk.png) (227.3 KB) — Local waterfall plot for High-Risk Customer A (`5178-LMXOP`).
- [shap_waterfall_medium_risk.png](file:///c:/Users/eluri%20surya%20vamsi/OneDrive/Desktop/customer-churn-ai/reports/shap/shap_waterfall_medium_risk.png) (240.8 KB) — Local waterfall plot for Medium-Risk Customer B (`1452-KIOVK`).
- [shap_waterfall_low_risk.png](file:///c:/Users/eluri%20surya%20vamsi/OneDrive/Desktop/customer-churn-ai/reports/shap/shap_waterfall_low_risk.png) (236.8 KB) — Local waterfall plot for Low-Risk Customer C (`4277-BWBML`).
