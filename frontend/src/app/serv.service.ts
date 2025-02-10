import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiResponse } from './search-bar/search-bar.interface';
import { stockProfile } from './stock-profile.interface';
import { quoteData } from './quote-data.interface';
import { companyPeers } from './company-peers.interface';
import { newsData } from './news.interface';
import { companyInsights } from './company-insights.interface';
import { chartsTabApiResponse } from './charts-tab.interface';
import { recommdationTrends } from './recommendation-trends.interface';
import { watchlist } from './watchlist.interface';
import { companyAllDetails } from './company-all-details.interface';
import { companyEarnings } from './company-earnings.interface';
import { portfolio } from './portfolio.interface';

@Injectable({
  providedIn: 'root'
})
export class ServService {
  public error: boolean = false;
  public tickerValue: string = '';

  private companyDetailsDataSource = new Subject<companyAllDetails>();
  public companyDetailsData$: Observable<companyAllDetails> = this.companyDetailsDataSource.asObservable()

  public localProcessedPortfolioDetails: {
    ticker: string;
    quantity: number;
    stockPurchases: number[];
    stock_name: string;
    total_cost: number;
    change: number;
    currPrice: number;
    avg_cost_per_share: number;
    market_value: number;
    color: string;
  }[] = []

  public moneyInWallet: number = 0;

  private portfolioDetailsSource = new Subject<portfolio[]>()
  public portfolioDetialsData$: Observable<portfolio[]> = this.portfolioDetailsSource.asObservable()
  // public
  public portfolioDetails!: portfolio[];
  localhost = 'http://localhost:8081/'

  // private routeChanges
  private routeChangeSource = new Subject<string>()
  public routeChangeData$: Observable<string> = this.routeChangeSource.asObservable()

  public watchlistSource = new Subject<watchlist[] | null>()
  public watchlistData$: Observable<watchlist[] | null> = this.watchlistSource.asObservable()

  public watchlistData: watchlist[] | null = null
  public localWatchlistData: watchlist[] = []
  public routeValue!: string;
  public companyDetails!: companyAllDetails
  constructor(private http: HttpClient) { }

  public setWatchlistData(data: watchlist[] | null) {
    this.watchlistData = data
    this.watchlistSource.next(data)
  }

  public setRouteChange(route: string) {
    this.routeValue = route
    this.routeChangeSource.next(route)
  }

  public setPortfolioDetails(data: portfolio[]) {
    this.portfolioDetails = data
    this.portfolioDetailsSource.next(data)
  }

  public setCompanyDetails(data: companyAllDetails) {
    this.companyDetails = data
    this.companyDetailsDataSource.next(data)
  }

  public clearCompanyDetails() {
    let emptyObject = {
      quoteData: {} as quoteData,
      stockProfileData: {} as stockProfile,
      companyPeer: [],
      newsData: [],
      chartsTabData: [],
      volumeData: [],
      hourlyPriceApiData: [],
      recommendationTrends: [] as recommdationTrends[],
      companyInsights: []
    }
    this.companyDetails = emptyObject; 
    this.companyDetailsDataSource.next(emptyObject);
  }

  public setErrorToTrue() {
    this.error = true;
  }

  public setTickerValue(ticker: string) {
    this.tickerValue = ticker
  }

  public setErrorToFalse() {
    this.error = false;
  }

  public addToWatchlist(watchListObject: Object):Observable<watchlist> {
    return this.http.post<watchlist>( this.localhost + `watchlist`, watchListObject)
  }

  public getWalletAmount():Observable<{_id: string, moneyInWallet: number, documentId: number}> {
    return this.http.get<{_id: string, moneyInWallet: number, documentId: number}>(this.localhost + "walletMoney")
  }

  public addMoneyToWallet(amount: number):Observable<{_id: string, moneyInWallet: number, documentId: number}> {
    return this.http.get<{_id: string, moneyInWallet: number, documentId: number}>(this.localhost + `increase-wallet?amount=${amount}`)
  }

  public reduceWalletMoney(amount: number): Observable<{ _id: string, moneyInWallet: { $numberDecimal: number}, documentId: number; }> {
    return this.http.post<{ _id: string, moneyInWallet: { $numberDecimal: number}, documentId: number }>(this.localhost + `reduce-wallet`, { amount });
  }

  public checkWatchlist(ticker: string): Observable<{exist: boolean}> {
    return this.http.get<{ exist: boolean }>(this.localhost + `check-watchlist?ticker=${ticker}`)
  }

  public getWatchlist():Observable<watchlist[]> {
    return this.http.get<watchlist[]>(this.localhost + 'watchlist')
  }

  public deleteFromWatchlist(ticker: string) {
    return this.http.delete(this.localhost + `watchlist?ticker=${ticker}`)
  }

  public getData(query: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.localhost + `auto-complete?text=${query}`)
  }

  public getStockProfileData(ticker: string): Observable<stockProfile> {
    return this.http.get<stockProfile>(this.localhost + `company-desc?ticker=${ticker}`)
  }

  public getQuoteData(ticker: string): Observable<quoteData> {
    return this.http.get<quoteData>(this.localhost + `company-latest-price?ticker=${ticker}`)
  }

  public companyPeersData(ticker: string): Observable<string[]> {
    return this.http.get<string[]>(this.localhost + `company-peers?ticker=${ticker}`)
  }

  public getNewsData(ticker: string): Observable<newsData[]> {
    return this.http.get<newsData[]>(this.localhost + `company-news?ticker=${ticker}`)
  }

  public getCompanyInsightsData(ticker: string): Observable<companyInsights> {
    return this.http.get<companyInsights>(this.localhost + `company-insider-sentiment?ticker=${ticker}`)
  }

  public getChartsTabData(ticker: string): Observable<chartsTabApiResponse> {
    return this.http.get<chartsTabApiResponse>(this.localhost + `charts-tab-data?ticker=${ticker}`)
  }

  public getHourPriceApiData(ticker: string, from_date: string, to_date: string): Observable<chartsTabApiResponse> {
    return this.http.get<chartsTabApiResponse>(this.localhost + `market-hpd?ticker=${ticker}&from_date=${from_date}&to_date=${to_date}`)
  }

  public getRecommendationTrendsData(ticker: string): Observable<recommdationTrends[]> {
    return this.http.get<recommdationTrends[]>(this.localhost + `recommendation-trends?ticker=${ticker}`)
  }

  public getCompanyEarnings(ticker: string): Observable<companyEarnings[]> {
    return this.http.get<companyEarnings[]>(this.localhost + `company-earnings?ticker=${ticker}`)
  }

  public getPortfolioDetails(): Observable<portfolio[]> {
    return this.http.get<portfolio[]>(this.localhost +`portfolio-details`)
  }

  public getTickerPortfolioDetails(ticker: string): Observable<portfolio> {
    return this.http.get<portfolio>(this.localhost + `get-ticker-portfolio?ticker=${ticker}`)
  }

  public buyShares(ticker: string, quantity: number, total_buy_cost: number, stock_name: string): Observable<{_id: string, ticker: string, quantity: number, stock_name: string, total_cost: number}>  {
    this.moneyInWallet = 0
    this.localProcessedPortfolioDetails = []
    return this.http.post<{_id: string, ticker: string, quantity: number, stock_name: string, total_cost: number}>( this.localhost + `add-shares`, { 
      ticker,
      quantity,
      total_buy_cost,
      stock_name
    })
  }

  public sellShares(ticker: string, quantity: number, total_sell_cost: number): Observable<{_id: string, ticker: string, quantity: number, stock_name: string, total_cost: number}> {
    return this.http.post<{_id: string, ticker: string, quantity: number, stock_name: string, total_cost: number}>(this.localhost + `sell-shares`, {
      ticker,
      quantity,
      total_sell_cost
    })
  }
}