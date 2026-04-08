import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShieldAlert, Activity } from 'lucide-react';

function App() {
  const [tickers, setTickers] = useState('AAPL, MSFT, GOOGL');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateRisk = async () => {
    setLoading(true);
    try {
      const tickerArray = tickers.split(',').map(t => t.trim().toUpperCase());
      // Assuming equal weights for simplicity in this test
      const weight = 1 / tickerArray.length;
      const weights = tickerArray.map(() => weight);

      const response = await axios.post('http://127.0.0.1:8000/calculate_risk', {
        tickers: tickerArray,
        weights: weights
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error calling API:", error);
      alert("Make sure your Python server is running on port 8000!");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1>RiskFlow Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        <input 
          value={tickers} 
          onChange={(e) => setTickers(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button onClick={calculateRisk} style={{ marginLeft: '10px', padding: '10px 20px', cursor: 'pointer' }}>
          {loading ? 'Calculating...' : 'Analyze Risk'}
        </button>
      </div>

      {results && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Activity color="#2563eb" />
            <h3>Volatility</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{results["Annualized Volatility"]}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <TrendingUp color="#16a34a" />
            <h3>Beta</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{results["Beta"]}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <ShieldAlert color="#dc2626" />
            <h3>Value at Risk</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{results["Daily VaR (95%)"]}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
