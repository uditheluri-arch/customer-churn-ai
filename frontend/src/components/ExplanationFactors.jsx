import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export default function ExplanationFactors({ churnFactors, retentionFactors }) {
  const [showTechnical, setShowTechnical] = useState(false);

  // Helper to calculate bar width percentage relative to max absolute SHAP value
  const maxAbsShap = Math.max(
    ...churnFactors.map((f) => Math.abs(f.shap_value)),
    ...retentionFactors.map((f) => Math.abs(f.shap_value)),
    0.1
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <Info size={20} style={{ color: 'var(--accent-cyan)' }} />
          Local Feature Attribution (SHAP Explainer)
        </h3>
        <button
          className="btn btn-secondary"
          onClick={() => setShowTechnical(!showTechnical)}
          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
        >
          <Terminal size={14} />
          {showTechnical ? 'Hide Tech Details' : 'Show Tech Details (SHAP Values)'}
          {showTechnical ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Top Churn Risk Drivers */}
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--risk-high)' }}>
            <TrendingUp size={18} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Top Factors Increasing Churn Risk
            </h4>
          </div>

          {churnFactors.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No strong positive churn drivers detected.</p>
          ) : (
            churnFactors.map((item, idx) => {
              const barWidth = Math.min(100, Math.max(15, (Math.abs(item.shap_value) / maxAbsShap) * 100));
              return (
                <div key={idx} className="factor-item">
                  <div className="factor-header">
                    <span className="factor-title">{item.feature_display_name}</span>
                    <span className="factor-badge churn">↑ Churn Risk</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Customer Value: <strong style={{ color: '#fff' }}>{String(item.value)}</strong></span>
                    {showTechnical && (
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--risk-high)' }}>
                        +{item.shap_value.toFixed(4)}
                      </span>
                    )}
                  </div>
                  <div className="factor-bar-bg">
                    <div className="factor-bar-fill churn" style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Top Retention Drivers */}
        <div className="glass-card" style={{ borderColor: 'rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--risk-low)' }}>
            <TrendingDown size={18} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Top Factors Supporting Retention
            </h4>
          </div>

          {retentionFactors.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No strong retention stabilizing factors detected.</p>
          ) : (
            retentionFactors.map((item, idx) => {
              const barWidth = Math.min(100, Math.max(15, (Math.abs(item.shap_value) / maxAbsShap) * 100));
              return (
                <div key={idx} className="factor-item">
                  <div className="factor-header">
                    <span className="factor-title">{item.feature_display_name}</span>
                    <span className="factor-badge retention">↓ Retention</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Customer Value: <strong style={{ color: '#fff' }}>{String(item.value)}</strong></span>
                    {showTechnical && (
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--risk-low)' }}>
                        {item.shap_value.toFixed(4)}
                      </span>
                    )}
                  </div>
                  <div className="factor-bar-bg">
                    <div className="factor-bar-fill retention" style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
