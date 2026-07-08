# Stock Search and Portfolio Management Platform

Full stack web platform for stock search, watchlists, and portfolio management with real time and historical market data.

## Architecture

```mermaid
flowchart LR
    UI["Angular front end<br/>Highcharts visualizations"] --> API["Node.js and Express backend<br/>response caching"]
    API --> F["Finnhub API<br/>real time quotes and company data"]
    API --> P["Polygon.io API<br/>historical prices"]
    API --> D["Deployed on<br/>Google Cloud Platform"]
```

## Features

- Real time quotes and company data from the Finnhub API, historical price charts from Polygon.io rendered with Highcharts
- Stock search with autocomplete suggestions, watchlist, and buy and sell portfolio simulation with profit and loss tracking
- Node.js and Express backend with response caching for API efficiency
- Deployed on Google Cloud Platform

## Stack

Angular · TypeScript · Node.js · Express · Highcharts · Finnhub and Polygon.io APIs · GCP
