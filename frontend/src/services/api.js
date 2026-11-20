const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Helper to handle fetch responses and extract clean error messages.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `Server error (HTTP ${response.status})`;
    try {
      const errData = await response.json();
      if (errData.message) {
        errorMsg = errData.message;
      } else if (errData.detail) {
        if (typeof errData.detail === 'string') {
          errorMsg = errData.detail;
        } else if (Array.isArray(errData.detail)) {
          errorMsg = errData.detail.map(d => `${d.loc ? d.loc.join('.') : ''}: ${d.msg}`).join(', ');
        }
      }
    } catch (e) {
      // Ignore JSON parse fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

/**
 * Checks FastAPI backend health status.
 */
export async function getHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return await handleResponse(res);
  } catch (err) {
    return { status: 'unhealthy', model_loaded: false, preprocessor_loaded: false, error: err.message };
  }
}

/**
 * Fetches model metadata and evaluation metrics.
 */
export async function getModelInfo() {
  const res = await fetch(`${BASE_URL}/model-info`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * Submits customer profile data for churn prediction & SHAP explainability.
 */
export async function predictAndExplain(customerData) {
  const res = await fetch(`${BASE_URL}/predict/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(customerData),
  });
  return handleResponse(res);
}
