# Stage 4 — Model Training & Comparison Documentation

This document records the training, evaluation, comparison, and serialization of three baseline machine learning models for the **Customer Churn Prediction + Explainable AI** project.

---

## 1. Models Trained & Architectural Rationale

Three diverse classification algorithms were evaluated to establish baseline predictive performance:

1. **Logistic Regression (`models/logistic_regression.joblib`):**
   - **Why Selected:** Serves as a primary linear baseline. Models log-odds probabilities using the sigmoid function $\sigma(z) = \frac{1}{1 + e^{-z}}$.
   - **Configuration:** `max_iter=1000`, `random_state=42`.
2. **Random Forest Classifier (`models/random_forest.joblib`):**
   - **Why Selected:** Bagging ensemble algorithm combining 100 decorrelated decision trees. Captures complex non-linear feature interactions while reducing single-tree variance.
   - **Configuration:** `n_estimators=100`, `random_state=42`.
3. **XGBoost Classifier (`models/xgboost.joblib`):**
   - **Why Selected:** Sequential gradient boosting decision tree framework optimized for tabular data. Trees are fitted sequentially to minimize residual errors of preceding trees.
   - **Configuration:** `n_estimators=100`, `learning_rate=0.1`, `eval_metric='logloss'`, `random_state=42`.

---

## 2. Test Set Performance Comparison Table

All models were evaluated on the exact same test dataset (`1,409` samples, `47` preprocessed features):

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | **80.48%** | **65.62%** | **55.61%** | **0.6020** | **0.8421** |
| **XGBoost** | 79.35% | 63.61% | 51.87% | 0.5714 | 0.8363 |
| **Random Forest** | 78.85% | 62.93% | 49.47% | 0.5539 | 0.8195 |

---

## 3. Key Observations & Trade-offs

1. **Best Overall Baseline:** **Logistic Regression** achieved the highest performance across all 5 evaluation metrics, delivering the top **Recall (55.61%)**, **F1-Score (0.6020)**, and **ROC-AUC (0.8421)**.
2. **Precision vs. Recall:**
   - **Logistic Regression:** Identified 208 out of 374 actual churners (**55.61% Recall**).
   - **XGBoost:** Identified 194 out of 374 actual churners (**51.87% Recall**).
   - **Random Forest:** Identified 185 out of 374 actual churners (**49.47% Recall**).
3. **Overfitting Analysis:** Default Random Forest exhibited slight overfitting on training splits (100% training accuracy vs 78.85% test accuracy). Hyperparameter tuning in Stage 5/6 (e.g., `max_depth`, `min_samples_leaf`, `scale_pos_weight`) can help regularize tree models.

---

## 4. Confusion Matrix & Risk Interpretation

### Confusion Matrix Breakdown (Test Set = 1,409 Customers)

| Metric | Logistic Regression | Random Forest | XGBoost |
| :--- | :---: | :---: | :---: |
| **True Negatives (TN)** | 926 | 926 | 924 |
| **False Positives (FP)** | 109 | 109 | 111 |
| **False Negatives (FN)** | **166** | **189** | **180** |
| **True Positives (TP)** | **208** | **185** | **194** |

### Business Cost of False Negatives vs. False Positives:
- **False Negative (FN) Cost:** A customer intending to churn is misclassified as Retained (`0`). The company takes no action, and the customer leaves for a competitor. **Financial Impact:** Loss of entire customer lifetime value.
- **False Positive (FP) Cost:** A loyal customer is misclassified as Churning (`1`). The company offers a retention discount. **Financial Impact:** Minor margin compression.
- **Conclusion:** **False Negatives are significantly more costly than False Positives.**

---

## 5. Threshold Sensitivity & Business Scenario

### Shifting XGBoost Decision Threshold ($P \ge \text{Threshold}$):
By default, models classify churn if risk probability $P \ge 0.50$. Shifting the decision threshold allows business teams to prioritize Recall over Precision:

| Threshold | Predicted Churners | True Positives (TP) | Precision | Recall | F1-Score |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **0.60** | 208 | 145 | 69.71% | 38.77% | 0.4983 |
| **0.50 (Default)** | 305 | 194 | 63.61% | 51.87% | 0.5714 |
| **0.40** | 419 | 237 | 56.56% | 63.37% | 0.5977 |
| **0.30** | 529 | 279 | 52.74% | **74.60%** | **0.6179** |

### Recalculated Threshold Observations:
- **Shift to Threshold 0.30:** Lowering the XGBoost decision threshold from `0.50` to `0.30` increases Recall from **51.87%** (194 out of 374 actual churners detected) to **74.60%** (279 out of 374 actual churners detected). Precision shifts from **63.61%** to **52.74%** across 529 total predicted churners.
- **Cost-Benefit Trade-off (Hypothetical Illustrative Assumption):** Lowering the threshold allows the business to capture significantly more at-risk customers at the expense of additional False Positives. If retention intervention costs are low relative to customer value (*hypothetical illustrative assumption*), a lower threshold (e.g. 0.30 or 0.40) can capture more churners. However, selecting the mathematically optimal threshold requires a formal cost-benefit calculation ($\text{Net Profit} = \text{TP} \times \text{Savings} - \text{FP} \times \text{Cost} - \text{FN} \times \text{Loss}$) tailored to exact company financial parameters.

---

## 6. Serialized Model Artifacts

All models were serialized using `joblib` into `models/`:
- `models/logistic_regression.joblib` (1,634 bytes)
- `models/random_forest.joblib` (2,776,211 bytes)
- `models/xgboost.joblib` (356,895 bytes)

All artifacts passed 100% automated integrity tests for prediction range, array lengths, reloadability, and zero test-set leakage.
