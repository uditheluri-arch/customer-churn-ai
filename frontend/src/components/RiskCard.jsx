import React from 'react';
import { ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RiskCard({ result }) {
  if (!result) return null;

  const { customer_id, churn_probability, churn_percentage, risk_level, prediction } = result;
  
  // Calculate SVG arc for circular gauge (radius 50, circum 2 * PI * 50 = 314.16)
  const radius = 52;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (churn_percentage / 100) * circumference;

  let riskColor = 'var(--risk-low)';
  if (risk_level === 'HIGH') riskColor = 'var(--risk-high)';
  if (risk_level === 'MEDIUM') riskColor = 'var(--risk-medium)';

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Customer Evaluation
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            {customer_id || 'DEMO-001'}
          </h3>
        </div>
        <div className={`risk-badge ${risk_level}`}>
          {risk_level === 'HIGH' && <ShieldAlert size={16} />}
          {risk_level === 'MEDIUM' && <AlertCircle size={16} />}
          {risk_level === 'LOW' && <ShieldCheck size={16} />}
          {risk_level} RISK
        </div>
      </div>

      {/* Main Gauge Visualizer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.5rem 0' }}>
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg height="160" width="160" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              stroke="rgba(255, 255, 255, 0.08)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx="80"
              cy="80"
            />
            <circle
              stroke={riskColor}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx="80"
              cy="80"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
              {churn_percentage}%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Churn Probability
            </span>
          </div>
        </div>
      </div>

      {/* Prediction Decision Banner */}
      <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
          ML Decision Boundary (Threshold = 0.50)
        </span>
        <div className={`prediction-pill ${prediction}`}>
          {prediction}
        </div>
      </div>

      {/* Risk Tier Context */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div style={{ background: 'rgba(31, 41, 61, 0.4)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Raw Probability</span>
          <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{churn_probability.toFixed(4)}</span>
        </div>
        <div style={{ background: 'rgba(31, 41, 61, 0.4)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Risk Classifier</span>
          <span style={{ fontWeight: 600, color: riskColor }}>{risk_level} TIER</span>
        </div>
      </div>
    </div>
  );
}
