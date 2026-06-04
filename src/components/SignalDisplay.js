import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

function SignalDisplay({ signal }) {
  if (!signal || signal.signal === 'ERROR') {
    return (
      <div className="signal-card error">
        <AlertCircle size={32} />
        <h3>Error Generating Signal</h3>
        <p>{signal?.error || 'Unknown error'}</p>
      </div>
    );
  }

  const getSignalColor = (sig) => {
    if (sig.includes('BUY')) return 'buy';
    if (sig.includes('SELL')) return 'sell';
    return 'neutral';
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return '#10b981'; // green
    if (conf >= 65) return '#f59e0b'; // yellow
    if (conf >= 50) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const colorClass = getSignalColor(signal.signal);

  return (
    <div className="signal-display">
      {/* Main Signal Box */}
      <div className={`signal-card main ${colorClass}`}>
        <div className="signal-header">
          <div className="signal-icon">
            {signal.signal.includes('BUY') ? (
              <TrendingUp size={40} color="#10b981" />
            ) : signal.signal.includes('SELL') ? (
              <TrendingDown size={40} color="#ef4444" />
            ) : (
              <AlertCircle size={40} color="#6b7280" />
            )}
          </div>
          
          <div className="signal-text">
            <h2>{signal.signal}</h2>
            <p className="signal-time">{new Date(signal.timestamp).toLocaleString()}</p>
          </div>

          <div className="confidence-circle">
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getConfidenceColor(signal.confidence)}
                strokeWidth="8"
                strokeDasharray={`${2.827 * signal.confidence} 282.7`}
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="55" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
                {signal.confidence}%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Scores Breakdown */}
      <div className="scores-box">
        <h3>Signal Breakdown</h3>
        <div className="scores-grid">
          <div className="score-item">
            <label>Technical</label>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{width: `${(signal.scores.technical / 25) * 100}%`}}
              ></div>
            </div>
            <span>{signal.scores.technical}/25</span>
          </div>

          <div className="score-item">
            <label>Momentum</label>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{width: `${(signal.scores.momentum / 25) * 100}%`}}
              ></div>
            </div>
            <span>{signal.scores.momentum}/25</span>
          </div>

          <div className="score-item">
            <label>Order Flow</label>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{width: `${(signal.scores.orderFlow / 15) * 100}%`}}
              ></div>
            </div>
            <span>{signal.scores.orderFlow}/15</span>
          </div>

          <div className="score-item">
            <label>Sentiment</label>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{width: `${(signal.scores.sentiment / 15) * 100}%`}}
              ></div>
            </div>
            <span>{signal.scores.sentiment}/15</span>
          </div>
        </div>
      </div>

      {/* Price Action */}
      <div className="price-action-box">
        <h3>Trade Setup</h3>
        <div className="price-grid">
          <div className="price-item">
            <label>Current Price</label>
            <span className="price">${signal.priceAction.currentPrice.toFixed(2)}</span>
          </div>
          <div className="price-item">
            <label>Entry</label>
            <span className="price-entry">${signal.priceAction.entry.toFixed(2)}</span>
          </div>
          <div className="price-item">
            <label>Stop Loss</label>
            <span className="price-stop">${signal.priceAction.stopLoss.toFixed(2)}</span>
          </div>
          <div className="price-item">
            <label>Target 1</label>
            <span className="price-target">${signal.priceAction.target1.toFixed(2)}</span>
          </div>
          <div className="price-item">
            <label>Target 2</label>
            <span className="price-target">${signal.priceAction.target2.toFixed(2)}</span>
          </div>
          <div className="price-item">
            <label>Risk:Reward</label>
            <span className="risk-reward">1:{signal.priceAction.riskReward}</span>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="indicators-box">
        <h3>Indicators</h3>
        <div className="indicators-grid">
          <div className="indicator-item">
            <label>Trend</label>
            <span className={`badge ${signal.indicators.trend.toLowerCase()}`}>
              {signal.indicators.trend}
            </span>
          </div>
          <div className="indicator-item">
            <label>RSI</label>
            <span className={`value ${signal.indicators.rsi > 70 ? 'overbought' : signal.indicators.rsi < 30 ? 'oversold' : ''}`}>
              {signal.indicators.rsi}
            </span>
          </div>
          <div className="indicator-item">
            <label>MACD</label>
            <span className="value">{signal.indicators.macd}</span>
          </div>
          <div className="indicator-item">
            <label>Divergence</label>
            <span className={`badge ${signal.indicators.divergence.toLowerCase()}`}>
              {signal.indicators.divergence}
            </span>
          </div>
          <div className="indicator-item">
            <label>Volume Spike</label>
            <span className={`badge ${signal.indicators.volumeSpike ? 'yes' : 'no'}`}>
              {signal.indicators.volumeSpike ? 'YES' : 'NO'} ({signal.indicators.volumeRatio}x)
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="recommendation-box">
        <h3>Recommendation</h3>
        <div className="recommendation-grid">
          <div className="rec-item">
            <label>Position Size</label>
            <span className="rec-value">{signal.recommendation.positionSize}</span>
          </div>
          <div className="rec-item">
            <label>Timeframe</label>
            <span className="rec-value">{signal.recommendation.timeframe}</span>
          </div>
        </div>
        
        <div className="action-box">
          <h4>Risk Management Rules:</h4>
          <ul>
            <li>Always use stop loss at {signal.priceAction.stopLoss.toFixed(2)}</li>
            <li>Risk-reward ratio: 1:{signal.priceAction.riskReward}</li>
            <li>Take profit 50% at target 1: {signal.priceAction.target1.toFixed(2)}</li>
            <li>Trailing stop remaining 50% to target 2</li>
            <li>Scale position size based on confidence level</li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <p>⚠️ This is not financial advice. Always do your own research and use proper risk management. Past performance does not guarantee future results.</p>
      </div>
    </div>
  );
}

export default SignalDisplay;
