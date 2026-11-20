import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CustomerForm from './components/CustomerForm';
import RiskCard from './components/RiskCard';
import ExplanationFactors from './components/ExplanationFactors';
import BusinessSummary from './components/BusinessSummary';
import ModelInfoModal from './components/ModelInfoModal';
import { getHealth, getModelInfo, predictAndExplain } from './services/api';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Check health and model metadata on mount
  useEffect(() => {
    fetchHealthStatus();
    fetchModelMetadata();
  }, []);

  const fetchHealthStatus = async () => {
    const h = await getHealth();
    setHealth(h);
  };

  const fetchModelMetadata = async () => {
    try {
      const info = await getModelInfo();
      setModelInfo(info);
    } catch (e) {
      console.warn('Failed to fetch model metadata:', e);
    }
  };

  const handlePredict = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await predictAndExplain(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || 'An error occurred while connecting to the prediction API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header health={health} onOpenModelInfo={() => setIsModalOpen(true)} />

      <main className="app-container">
        {/* Error Banner */}
        {error && (
          <div
            style={{
              background: 'var(--risk-high-bg)',
              border: '1px solid var(--risk-high)',
              color: '#fff',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle style={{ color: 'var(--risk-high)' }} />
              <div>
                <strong style={{ display: 'block' }}>API Prediction Error</strong>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{error}</span>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={fetchHealthStatus}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        )}

        {/* Top Split Dashboard */}
        <div
          className="dashboard-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: result ? '1.1fr 0.9fr' : '1fr',
            gap: '1.5rem',
            marginBottom: '1.5rem',
            transition: 'grid-template-columns 0.3s ease',
          }}
        >
          {/* Customer Entry Form */}
          <div>
            <CustomerForm onSubmit={handlePredict} isLoading={isLoading} />
          </div>

          {/* Result Card & Gauge */}
          {result ? (
            <div>
              <RiskCard result={result} />
            </div>
          ) : (
            <div
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '350px',
                color: 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: 'var(--accent-primary)',
                }}
              >
                🔮
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Ready for Churn Evaluation
              </h3>
              <p style={{ maxWidth: '340px', fontSize: '0.875rem' }}>
                Fill out the customer profile on the left or click{' '}
                <strong style={{ color: 'var(--accent-cyan)' }}>"Load Demo Customer (5178-LMXOP)"</strong> to view instant ML churn risk predictions & SHAP explanations.
              </p>
            </div>
          )}
        </div>

        {/* SHAP Explanation Factors & Business Narrative */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ExplanationFactors
              churnFactors={result.top_churn_factors || []}
              retentionFactors={result.top_retention_factors || []}
            />
            <BusinessSummary result={result} />
          </div>
        )}
      </main>

      {/* Model Metadata Modal */}
      <ModelInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modelInfo={modelInfo}
      />
    </div>
  );
}
