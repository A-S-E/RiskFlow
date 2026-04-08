import yfinance as yf
import pandas as pd
import numpy as np

def get_portfolio_metrics(tickers, weights, benchmark='SPY', period='1y'):
    print(f"Fetching data for {tickers}...")
    
    # Modern way to handle download without cache issues
    all_tickers = tickers + [benchmark]
    
    # Using 'group_by' and 'auto_adjust' for cleaner data retrieval
    data = yf.download(all_tickers, period=period, progress=False, auto_adjust=True)
    
    # Narrow down to just the closing prices
    # We use 'Close' because 'Adj Close' is often handled by 'auto_adjust=True'
    if 'Close' in data.columns:
        price_data = data['Close']
    else:
        # Fallback for different yfinance versions
        price_data = data
    
    if price_data.empty:
        print("Error: No data was downloaded. Check your internet connection.")
        return None
    
    # Calculate Daily Returns
    returns = price_data.pct_change().dropna()
    
    # Check if all our tickers actually made it into the returns dataframe
    available_tickers = [t for t in tickers if t in returns.columns]
    if len(available_tickers) < len(tickers):
        print(f"Warning: Only found data for {available_tickers}")
        # Adjust weights to match available tickers if necessary
        # For now, we'll just use the ones we found
    
    # Separate portfolio and market returns
    portfolio_returns = (returns[available_tickers] * weights).sum(axis=1)
    market_returns = returns[benchmark]
    
    # Calculate Volatility (Standard Deviation annualized)
    volatility = np.std(portfolio_returns) * np.sqrt(252)
    
    # Calculate Beta (Market Sensitivity)
    # Using the math: Covariance(Portfolio, Market) / Variance(Market)
    covariance_matrix = np.cov(portfolio_returns, market_returns)
    covariance = covariance_matrix[0][1]
    market_variance = np.var(market_returns)
    beta = covariance / market_variance
    
    # Calculate Value at Risk (VaR) - 95% Confidence
    var_95 = np.percentile(portfolio_returns, 5)
    
    return {
        "Annualized Volatility": f"{volatility:.2%}",
        "Beta": round(beta, 2),
        "Daily VaR (95%)": f"{var_95:.2%}"
    }

if __name__ == "__main__":
    stocks = ['AAPL', 'MSFT', 'GOOGL']
    # Ensure weights match the number of stocks
    my_weights = [0.4, 0.3, 0.3]
    
    results = get_portfolio_metrics(stocks, my_weights)
    
    if results:
        print("\n--- Risk-Flow Analysis ---")
        for metric, value in results.items():
            print(f"{metric}: {value}")