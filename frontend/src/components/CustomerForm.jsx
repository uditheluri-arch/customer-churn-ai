import React, { useState } from 'react';
import { Zap, Send, RotateCcw, User } from 'lucide-react';

export const DEMO_CUSTOMER_A = {
  customerID: "5178-LMXOP",
  gender: "Male",
  SeniorCitizen: 1,
  Partner: "Yes",
  Dependents: "No",
  tenure: 1,
  PhoneService: "Yes",
  MultipleLines: "Yes",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "Yes",
  StreamingMovies: "Yes",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  MonthlyCharges: 95.10,
  TotalCharges: 95.10
};

export const INITIAL_FORM_STATE = {
  customerID: "DEMO-001",
  gender: "Female",
  SeniorCitizen: 0,
  Partner: "No",
  Dependents: "No",
  tenure: 12,
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "DSL",
  OnlineSecurity: "Yes",
  OnlineBackup: "No",
  DeviceProtection: "No",
  TechSupport: "Yes",
  StreamingTV: "No",
  StreamingMovies: "No",
  Contract: "One year",
  PaperlessBilling: "Yes",
  PaymentMethod: "Credit card (automatic)",
  MonthlyCharges: 65.50,
  TotalCharges: 786.00
};

export default function CustomerForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleLoadDemo = () => {
    setFormData(DEMO_CUSTOMER_A);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <User size={20} style={{ color: 'var(--accent-primary)' }} />
          Customer Attribute Entry
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLoadDemo}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
          >
            <Zap size={14} /> Load Demo Customer (5178-LMXOP)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Section 1: Customer Profile */}
          <div className="form-section-divider">Account & Profile</div>

          <div className="form-group">
            <label className="form-label">Customer ID</label>
            <input
              type="text"
              name="customerID"
              className="form-input"
              value={formData.customerID}
              onChange={handleChange}
              placeholder="e.g. 5178-LMXOP"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Senior Citizen</label>
            <select name="SeniorCitizen" className="form-select" value={formData.SeniorCitizen} onChange={handleChange}>
              <option value={0}>0 (No)</option>
              <option value={1}>1 (Yes)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Partner</label>
            <select name="Partner" className="form-select" value={formData.Partner} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Dependents</label>
            <select name="Dependents" className="form-select" value={formData.Dependents} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tenure (Months)</label>
            <input
              type="number"
              name="tenure"
              className="form-input"
              value={formData.tenure}
              onChange={handleChange}
              min="0"
              max="120"
              required
            />
          </div>

          {/* Section 2: Subscriptions & Services */}
          <div className="form-section-divider">Services & Subscriptions</div>

          <div className="form-group">
            <label className="form-label">Phone Service</label>
            <select name="PhoneService" className="form-select" value={formData.PhoneService} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Multiple Lines</label>
            <select name="MultipleLines" className="form-select" value={formData.MultipleLines} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No phone service">No phone service</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Internet Service</label>
            <select name="InternetService" className="form-select" value={formData.InternetService} onChange={handleChange}>
              <option value="Fiber optic">Fiber optic</option>
              <option value="DSL">DSL</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Online Security</label>
            <select name="OnlineSecurity" className="form-select" value={formData.OnlineSecurity} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Online Backup</label>
            <select name="OnlineBackup" className="form-select" value={formData.OnlineBackup} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Device Protection</label>
            <select name="DeviceProtection" className="form-select" value={formData.DeviceProtection} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tech Support</label>
            <select name="TechSupport" className="form-select" value={formData.TechSupport} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Streaming TV</label>
            <select name="StreamingTV" className="form-select" value={formData.StreamingTV} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Streaming Movies</label>
            <select name="StreamingMovies" className="form-select" value={formData.StreamingMovies} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          {/* Section 3: Billing & Contract */}
          <div className="form-section-divider">Contract & Billing</div>

          <div className="form-group">
            <label className="form-label">Contract Commitment</label>
            <select name="Contract" className="form-select" value={formData.Contract} onChange={handleChange}>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Paperless Billing</label>
            <select name="PaperlessBilling" className="form-select" value={formData.PaperlessBilling} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select name="PaymentMethod" className="form-select" value={formData.PaymentMethod} onChange={handleChange}>
              <option value="Electronic check">Electronic check</option>
              <option value="Mailed check">Mailed check</option>
              <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
              <option value="Credit card (automatic)">Credit card (automatic)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Charges ($)</label>
            <input
              type="number"
              step="0.05"
              name="MonthlyCharges"
              className="form-input"
              value={formData.MonthlyCharges}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Charges ($)</label>
            <input
              type="number"
              step="0.05"
              name="TotalCharges"
              className="form-input"
              value={formData.TotalCharges}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', maxWidth: '320px' }}>
            {isLoading ? (
              <>Running SHAP ML Pipeline...</>
            ) : (
              <>
                <Send size={18} /> Predict & Explain Churn Risk
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

