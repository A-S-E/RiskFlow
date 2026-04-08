import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, ShieldAlert, Activity, Save, FolderOpen, Percent, Info } from 'lucide-react';

// --- NEW COMPONENT: INFO NUGGET ---
const InfoNugget = ({ title, definition, range, standard }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      onMouseEnter={() => setShow(true)} 
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', cursor: 'help', display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}
    >
      <Info size={16} color="#94a3b8" />
      
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '130%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          backgroundColor: '#0f172a',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          zIndex: 999,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          fontSize: '13px',
          lineHeight: '1.4',
          pointerEvents: 'none'
        }}>
          <strong style={{ display: 'block', marginBottom: '6px', color: '#38bdf8', fontSize: '14px' }}>{title}</strong>
          <p style={{ margin: '0 0 10px 0', color: '#e2e8f0' }}>{definition}</p>
          <div style={{ borderTop: '1px solid #334155', paddingTop: '8px', fontSize: '12px' }}>
            <div style={{ marginBottom: '4px' }}><span style={{ color: '#94a3b8' }}>Typical Range:</span> {range}</div>
            <div><span style={{ color: '#94a3b8' }}>Ideal Standard:</span> <span style={{ color: '#4ade80' }}>{standard}</span></div>
          </div>
          {/* Tooltip Arrow */}
          <div style={{ position: 'absolute', top: '100%', left: '50%', marginLeft: '-6px', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #0f172a' }}></div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [tickers, setTickers] = useState('AAPL, MSFT, GOOGL');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [portfolioName, setPortfolioName] = useState('');

  useEffect(() => {
    fetchSavedPortfolios();
  }, []);

  const fetchSavedPortfolios = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/portfolios');
      setSavedPortfolios(response.data);
    } catch (error) { console.error("Error fetching", error); }
  };

  const calculateRisk = async () => {
    setLoading(true);
    try {
      const tickerArray = tickers.split(',').map(t => t.trim().toUpperCase());
      const response = await axios.post('http://127.0.0.1:8000/calculate_risk', {
        tickers: tickerArray,
        weights: tickerArray.map(() => 1 / tickerArray.length)
      });
      setResults(response.data);
    } catch (error) { alert("Error: Check Backend"); }
    setLoading(false);
  };

  const saveCurrentPortfolio = async () => {
    if (!portfolioName) return alert("Enter a name!");
    try {
      const tickerArray = tickers.split(',').map(t => t.trim().toUpperCase());
      await axios.post('http://127.0.0.1:8000/portfolios', {
        name: portfolioName,
        tickers: tickerArray,
        weights: tickerArray.map(() => 1 / tickerArray.length)
      });
      setPortfolioName('');
      fetchSavedPortfolios();
      alert("Saved!");
    } catch (error) { alert("Error saving"); }
  };

  const getHeatmapColor = (value) => {
    const opacity = Math.abs(value);
    return value >= 0 ? `rgba(37, 99, 235, ${opacity})` : `rgba(220, 38, 38, ${opacity})`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', padding: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '600' }}>
          <FolderOpen size={20} /> Portfolios
        </h2>
        <hr style={{ borderColor: '#1e293b', margin: '20px 0' }} />
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {savedPortfolios.map((p) => (
            <li 
              key={p.id} 
              onClick={() => setTickers(p.tickers.join(', '))}
              style={{ padding: '12px', cursor: 'pointer', borderRadius: '8px', marginBottom: '8px', fontSize: '14px', transition: '0.2s', backgroundColor: 'transparent' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {p.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', color: '#0f172a', margin: '0 0 8px 0' }}>RiskFlow Pro</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Portfolio Risk & Performance Analytics</p>
        </header>

        <div style={{ marginBottom: '32px', display: 'flex', gap: '12px' }}>
          <input 
            value={tickers} 
            onChange={(e) => setTickers(e.target.value)}
            placeholder="Enter Tickers (AAPL, TSLA...)"
            style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #e2e8e8', fontSize: '15px' }}
          />
          <input 
            placeholder="Name"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            style={{ width: '160px', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8e8' }}
          />
          <button onClick={calculateRisk} style={{ padding: '0 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
          <button onClick={saveCurrentPortfolio} style={{ padding: '0 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            <Save size={20} />
          </button>
        </div>

        {results && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {/* Volatility Card */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <Activity size={18} color="#2563eb" />
                  <span style={{ marginLeft: '8px', fontWeight: '600', color: '#64748b' }}>Volatility</span>
                  <InfoNugget 
                    title="Volatility (Standard Deviation)"
                    definition="How much your portfolio price 'bounces'. High volatility means wider swings in value."
                    range="10% (Steady) to 40%+ (Aggressive)"
                    standard="15% - 25% (Balanced)"
                  />
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{results.metrics["Annualized Volatility"]}</div>
              </div>

              {/* Beta Card */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <TrendingUp size={18} color="#10b981" />
                  <span style={{ marginLeft: '8px', fontWeight: '600', color: '#64748b' }}>Beta</span>
                  <InfoNugget 
                    title="Portfolio Beta"
                    definition="Sensitivity to the S&P 500. A beta of 1.2 means if the market rises 1%, you rise 1.2%."
                    range="0.5 (Defensive) to 2.0 (High Octane)"
                    standard="1.0 (Market Match)"
                  />
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{results.metrics["Beta"]}</div>
              </div>

              {/* VaR Card */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <ShieldAlert size={18} color="#ef4444" />
                  <span style={{ marginLeft: '8px', fontWeight: '600', color: '#64748b' }}>Daily VaR</span>
                  <InfoNugget 
                    title="Value at Risk (95%)"
                    definition="The maximum expected loss on a single day with 95% confidence based on history."
                    range="-1% (Safe) to -5% (Risky)"
                    standard="-2% to -3%"
                  />
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{results.metrics["Daily VaR (95%)"]}</div>
              </div>

              {/* Sharpe Card */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <Percent size={18} color="#8b5cf6" />
                  <span style={{ marginLeft: '8px', fontWeight: '600', color: '#64748b' }}>Sharpe</span>
                  <InfoNugget 
                    title="Sharpe Ratio"
                    definition="Efficiency metric. Measures how much 'extra' return you get for every unit of risk."
                    range="< 1.0 (Poor) to 3.0+ (Elite)"
                    standard="Above 1.0"
                  />
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{results.metrics["Sharpe Ratio"]}</div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '18px' }}>Performance vs Benchmark (1Y)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={results.chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="Date" hide />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36}/>
                  <Line name="Portfolio" type="monotone" dataKey="Portfolio" stroke="#2563eb" strokeWidth={3} dot={false} />
                  <Line name="S&P 500 (SPY)" type="monotone" dataKey="SPY" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Asset Correlation Matrix</h3>
                <InfoNugget 
                    title="Correlation Guide"
                    definition="1.0 = Moves identical. 0.0 = No relation. -1.0 = Moves opposite. Blue is positive, Red is negative."
                    range="-1.0 to 1.0"
                    standard="Diversified (< 0.5)"
                  />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px' }}></th>
                      {Object.keys(results.correlation).map(h => <th key={h} style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(results.correlation).map(row => (
                      <tr key={row}>
                        <td style={{ padding: '12px', fontWeight: '600', color: '#64748b', fontSize: '13px' }}>{row}</td>
                        {Object.values(results.correlation[row]).map((v, i) => (
                          <td key={i} style={{ padding: '16px', textAlign: 'center', backgroundColor: getHeatmapColor(v), color: Math.abs(v) > 0.4 ? 'white' : '#0f172a', border: '1px solid #f8fafc', fontWeight: '600', fontSize: '14px' }}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;