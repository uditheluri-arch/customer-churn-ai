

import React from 'react';
import { X, Cpu, BarChart3 } from 'lucide-react';

export default function ModelInfoModal({ isOpen, onClose, modelInfo }) {
  if (!isOpen) return null;

  const metrics = modelInfo?.metrics || {
    roc_auc: 0.8421,
    accuracy: 0.8048,
    precision: 0.6562,
    recall: 0.5561,
    f1_score: 0.6020,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={22} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
              Model Architecture & Evaluation Metrics
            </h3>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(31, 41, 61, 0.4)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Primary Classifier</span>
              <strong style={{ fontSize: '1rem', color: 'var(--accent-cyan)' }}>{modelInfo?.model || 'Logistic Regression'}</strong>
            </div>
            <div style={{ background: 'rgba(31, 41, 61, 0.4)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Feature Dimensions</span>
              <strong style={{ fontSize: '1rem', color: '#fff' }}>20 Raw → 47 Transformed</strong>
            </div>
            <div style={{ background: 'rgba(31, 41, 61, 0.4)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Explainability Engine</span>
              <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)' }}>SHAP LinearExplainer</strong>
            </div>
            <div style={{ background: 'rgba(31, 41, 61, 0.4)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Evaluation Test Set</span>
              <strong style={{ fontSize: '1rem', color: '#fff' }}>1,409 Samples (Stratified)</strong>
            </div>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={16} style={{ color: 'var(--risk-low)' }} />
            Stage 4 Evaluation Metrics (Hold-out Test Set)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ROC-AUC</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--risk-low)' }}>{metrics.roc_auc}</span>
            </div>
            <div style={{ background: 'rgba(31, 41, 61, 0.4)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Accuracy</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{metrics.accuracy}</span>
            </div>
            <div style={{ background: 'rgba(31, 41, 61, 0.4)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Precision</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{metrics.precision}</span>
            </div>
            <div style={{ background: 'rgba(31, 41, 61, 0.4)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Recall</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{metrics.recall}</span>
            </div>
            <div style={{ background: 'rgba(31, 41, 61, 0.4)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>F1-Score</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{metrics.f1_score}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '0.5rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
