import yfinance as yf
import pandas as pd
import numpy as np

def get_portfolio_metrics(tickers, weights, benchmark='SPY', period='1y'):
    print(f"Fetching data for {tickers}...")
    
    # 1. Fetch historical data
    all_tickers = tickers + [benchmark]
    data = yf.download(all_tickers, period=period, progress=False, auto_adjust=True)
    
    if 'Close' in data.columns:
        price_data = data['Close']
    else:
        price_data = data
    
    if price_data.empty:
        return None
    
    # 2. Calculate Daily Returns
    returns = price_data.pct_change().dropna()
    available_tickers = [t for t in tickers if t in returns.columns]
    
    # 3. Portfolio & Market Performance
    portfolio_returns = (returns[available_tickers] * weights).sum(axis=1)
    market_returns = returns[benchmark]
    
    # 4. Standard Risk Metrics
    volatility = np.std(portfolio_returns) * np.sqrt(252)
    covariance_matrix = np.cov(portfolio_returns, market_returns)
    beta = covariance_matrix[0][1] / np.var(market_returns)
    var_95 = np.percentile(portfolio_returns, 5)

    # 5. NEW: Advanced Financial Metrics
    # Sharpe Ratio (Assuming a 4% risk-free rate)
    risk_free_rate = 0.04
    annual_return = portfolio_returns.mean() * 252
    sharpe_ratio = (annual_return - risk_free_rate) / volatility if volatility != 0 else 0

    # Correlation Matrix (Helps identify diversification)
    # Shows how stocks move relative to each other (-1 to 1)
    correlation_matrix = returns[available_tickers].corr().round(2)
    
    # 6. Prepare Data for Visuals (Cumulative Growth)
    chart_df = pd.DataFrame(index=returns.index)
    chart_df['Portfolio'] = (portfolio_returns + 1).cumprod()
    chart_df['SPY'] = (market_returns + 1).cumprod()
    chart_df = chart_df.reset_index()
    chart_df['Date'] = chart_df['Date'].dt.strftime('%Y-%m-%d')

    # 7. Final Output Package
    return {
        "metrics": {
            "Annualized Volatility": f"{volatility:.2%}",
            "Beta": round(beta, 2),
            "Daily VaR (95%)": f"{var_95:.2%}",
            "Sharpe Ratio": round(sharpe_ratio, 2)
        },
        "chart": chart_df.to_dict(orient='records'),
        "correlation": correlation_matrix.to_dict()
    }

if __name__ == "__main__":
    # Quick Local Test
    test_stocks = ['AAPL', 'MSFT', 'TSLA']
    test_weights = [0.4, 0.3, 0.3]
    result = get_portfolio_metrics(test_stocks, test_weights)
    print(result["metrics"])