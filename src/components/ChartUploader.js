import React, { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';

function ChartUploader({ onDataSubmit, disabled }) {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('Daily');
  const [closes, setCloses] = useState('');
  const [highs, setHighs] = useState('');
  const [lows, setLows] = useState('');
  const [volumes, setVolumes] = useState('');
  const [error, setError] = useState('');

  const parseCSV = (text) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !isNaN(parseFloat(line)))
      .map(line => parseFloat(line));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      const closesArray = parseCSV(closes);
      const highsArray = parseCSV(highs);
      const lowsArray = parseCSV(lows);
      const volumesArray = parseCSV(volumes);

      if (closesArray.length < 50) {
        setError('Need at least 50 data points. Paste comma or newline separated values.');
        return;
      }

      if (closesArray.length !== highsArray.length || 
          closesArray.length !== lowsArray.length || 
          closesArray.length !== volumesArray.length) {
        setError('All data series must have the same number of values.');
        return;
      }

      const chartData = {
        symbol,
        timeframe,
        closes: closesArray,
        highs: highsArray,
        lows: lowsArray,
        volumes: volumesArray
      };

      onDataSubmit(chartData);
      // Clear form after submission
      setCloses('');
      setHighs('');
      setLows('');
      setVolumes('');
    } catch (err) {
      setError('Invalid data format: ' + err.message);
    }
  };

  const handleClear = () => {
    setCloses('');
    setHighs('');
    setLows('');
    setVolumes('');
    setError('');
  };

  const loadSampleData = () => {
    // Sample 50+ data points
    const sampleCloses = Array.from({length: 60}, (_, i) => (100 + Math.sin(i/10) * 20 + Math.random() * 5).toFixed(2)).join('\n');
    const sampleHighs = Array.from({length: 60}, (_, i) => (102 + Math.sin(i/10) * 20 + Math.random() * 5).toFixed(2)).join('\n');
    const sampleLows = Array.from({length: 60}, (_, i) => (98 + Math.sin(i/10) * 20 + Math.random() * 5).toFixed(2)).join('\n');
    const sampleVolumes = Array.from({length: 60}, () => (1000000 + Math.random() * 500000).toFixed(0)).join('\n');
    
    setCloses(sampleCloses);
    setHighs(sampleHighs);
    setLows(sampleLows);
    setVolumes(sampleVolumes);
  };

  return (
    <div className="chart-uploader">
      <form onSubmit={handleSubmit}>
        <h2>Chart Data Input</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label>Symbol:</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL, EURUSD, BTC"
              maxLength="10"
            />
          </div>
          
          <div className="form-group">
            <label>Timeframe:</label>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option>1H</option>
              <option>4H</option>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
        </div>

        <div className="data-inputs">
          <div className="form-group">
            <label>Close Prices (comma or newline separated):</label>
            <textarea
              value={closes}
              onChange={(e) => setCloses(e.target.value)}
              placeholder="100.50, 101.20, 102.30... (min 50 values)"
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>High Prices:</label>
            <textarea
              value={highs}
              onChange={(e) => setHighs(e.target.value)}
              placeholder="102.50, 103.20, 104.30..."
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Low Prices:</label>
            <textarea
              value={lows}
              onChange={(e) => setLows(e.target.value)}
              placeholder="98.50, 99.20, 100.30..."
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Volumes:</label>
            <textarea
              value={volumes}
              onChange={(e) => setVolumes(e.target.value)}
              placeholder="1000000, 1200000, 1500000..."
              rows="5"
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button 
            type="submit" 
            disabled={disabled}
            className="btn-primary"
          >
            <Upload size={18} /> Analyze Chart
          </button>
          <button 
            type="button" 
            onClick={handleClear}
            className="btn-secondary"
          >
            <Trash2 size={18} /> Clear
          </button>
          <button 
            type="button" 
            onClick={loadSampleData}
            className="btn-secondary"
          >
            Load Sample Data
          </button>
        </div>

        <div className="instruction-box">
          <h4>How to use:</h4>
          <ol>
            <li>Enter symbol (e.g., AAPL, EURUSD, BTC)</li>
            <li>Paste your price data (High, Low, Close, Volume)</li>
            <li>Click "Analyze Chart"</li>
            <li>View NEXUS signal with confidence score</li>
          </ol>
        </div>
      </form>
    </div>
  );
}

export default ChartUploader;
