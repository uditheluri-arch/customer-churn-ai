import React from 'react';
import { Activity, Database, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Header({ health, onOpenModelInfo }) {
  const isHealthy = health?.status === 'healthy' && health?.model_loaded;

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-title">
          <div className="brand-badge">STAGE 8 AI</div>
          <span>Telco Churn AI Studio</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            | Logistic Regression & SHAP Explainer
          </span>
        </div>

        <div className="header-actions">
          <div className="status-indicator">
            <span className={`status-dot ${isHealthy ? 'online' : 'offline'}`} />
            <span style={{ color: isHealthy ? 'var(--risk-low)' : 'var(--risk-high)' }}>
              {isHealthy ? 'Backend API Connected' : 'API Disconnected'}
            </span>
          </div>

          <button className="btn btn-secondary" onClick={onOpenModelInfo} style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}>
            <Activity size={15} />
            Model Metrics
          </button>
        </div>
      </div>
    </header>
  );
}
