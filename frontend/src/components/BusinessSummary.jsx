import React from 'react';
import { Lightbulb, Target, CheckCircle } from 'lucide-react';

export default function BusinessSummary({ result }) {
  if (!result) return null;

  const { customer_id, churn_percentage, risk_level, prediction, top_churn_factors, top_retention_factors } = result;

  // Format top 2-3 factors into human readable phrase
  const churnDriverNames = top_churn_factors.slice(0, 3).map((f) => f.feature_display_name).join(', ');
  const retentionDriverNames = top_retention_factors.slice(0, 2).map((f) => f.feature_display_name).join(', ');

  return (
    <div className="glass-card" style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}>
      <h3 className="section-title">
        <Lightbulb size={20} style={{ color: 'var(--accent-primary)' }} />
        Executive Business Narrative & Retention Strategy
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.925rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
        <p>
          Customer <strong style={{ color: 'var(--accent-cyan)' }}>{customer_id}</strong> is classified as{' '}
          <strong className={`risk-badge ${risk_level}`} style={{ padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
            {risk_level} RISK
          </strong>{' '}
          with a predicted churn probability of <strong style={{ color: '#fff' }}>{churn_percentage}%</strong> (Prediction:{' '}
          <strong style={{ color: prediction === 'CHURN' ? 'var(--risk-high)' : 'var(--risk-low)' }}>{prediction}</strong>).
        </p>

        {top_churn_factors.length > 0 && (
          <p>
            The Machine Learning model identified <strong style={{ color: '#fff' }}>{churnDriverNames}</strong> as the primary factors that{' '}
            <span style={{ color: 'var(--risk-high)', fontWeight: 600 }}>contributed toward higher predicted churn risk</span> for this account profile.
          </p>
        )}

        {top_retention_factors.length > 0 && (
          <p>
            Conversely, <strong style={{ color: '#fff' }}>{retentionDriverNames}</strong> provided stabilizing support that{' '}
            <span style={{ color: 'var(--risk-low)', fontWeight: 600 }}>contributed toward customer retention</span>.
          </p>
        )}

        <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(31, 41, 61, 0.5)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            <Target size={16} style={{ color: 'var(--accent-primary)' }} />
            Recommended Actionable Intervention Playbook:
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {risk_level === 'HIGH' && (
              <>
                <li>Offer a 1-year or 2-year contract term discount (15% monthly discount) to transition away from month-to-month risk.</li>
                <li>Migrate billing to automatic payment (Credit Card / Bank Transfer) to reduce payment friction.</li>
                <li>Provide complimentary onboarding for Tech Support or Online Security services to boost service stickiness.</li>
              </>
            )}
            {risk_level === 'MEDIUM' && (
              <>
                <li>Proactively reach out with account health review and offer customized service tier upgrades.</li>
                <li>Encourage enrollment in automated paperless billing and multi-line package savings.</li>
              </>
            )}
            {risk_level === 'LOW' && (
              <>
                <li>Account is stable. Maintain current service delivery and target for cross-selling premium streaming features.</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
