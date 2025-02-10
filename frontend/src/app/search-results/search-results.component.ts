import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { stockProfile } from '../stock-profile.interface';
import { ServService } from '../serv.service';
import { quoteData } from '../quote-data.interface';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { NewsComponent } from '../news/news.component';
import { CompanyInsightsComponent } from '../company-insights/company-insights.component';
import { Observable, forkJoin} from 'rxjs';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { companyData } from '../company-insights.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; 
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import { faCaretDown, faCaretUp, faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { ChartsTabComponent } from '../charts-tab/charts-tab.component';
import { StateService } from '../state.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as Highcharts from 'highcharts/highstock';
import HC_indicators from 'highcharts/indicators/indicators';
import HC_vba from 'highcharts/indicators/volume-by-price';
import { HighchartsChartModule } from 'highcharts-angular';
import { recommdationTrends } from '../recommendation-trends.interface';
import { newsData } from '../news.interface';
import { companyAllDetails } from '../company-all-details.interface';
HC_indicators(Highcharts);
HC_vba(Highcharts);
import { inject, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { portfolio } from '../portfolio.interface';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [SearchBarComponent, FormsModule, ChartsTabComponent, HighchartsChartModule, MatProgressSpinnerModule, FontAwesomeModule, CompanyInsightsComponent, NewsComponent, CommonModule, MatTabsModule, RouterModule, NgbAlert],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent {
  @Input() public ticker!: string;
  
  watchListData!: Object;
  stockProfileData!: stockProfile;
  buyInputValid: boolean = true;
  sellInputValid: boolean = true;
  sellButtonInputEnabled: boolean = false;
  sellNonPositiveShare: boolean = false;
  buyNonPositiveShare: boolean = false
  quoteData!: quoteData;
  companyPeers!: string[];
  newsData!: newsData[];
  watchListRemoved: boolean = false;
  watchListAdded: boolean = false;

  moneyInWalet: number = 0.0

  watchlistExists!: boolean;

  isLoading: boolean = false;
  error: boolean = false;
  displayData: boolean = false;

  formattedTimeStamp!: string;
  lastTimeStamp!: number;
  marketStatus!: boolean;
  currTimeStamp!: string;
  color!: string;
  faRegularStar = faRegularStar
  faCaretDown = faCaretDown
  faCaretUp = faCaretUp
  Highcharts: typeof Highcharts = Highcharts;
  recommendationTrends!: recommdationTrends[];
  allCompanyData: companyAllDetails = {
    quoteData: {} as quoteData,
    stockProfileData: {} as stockProfile,
    companyPeer: [],
    newsData: [], 
    chartsTabData: [],
    volumeData: [],
    hourlyPriceApiData: [],
    recommendationTrends: [] as recommdationTrends[],
    companyInsights: []
  };

  @Output() tickerChange = new EventEmitter<string>()


  companyInsights!: companyData[];
  buttonClass: string = ''

  public chartsOhlcData!: number[][];
  public volumeData!: number[][];
  public hourlyPriceData!: number[][];

  totalBuyValue= 0.0;
  totalSellValue = 0.0;
  public buyButtonEnabled!: boolean;
  public sellButtonEnabled!: boolean;
  public shareBought: boolean = false;
  public shareSold: boolean = false;
  public buyQuantityInputValue: number = 0;
  public sellQuantityInputValue: number = 0;
  public stockTickerPortfolioDetails!: portfolio;
  public boughtShareTickerName!: string
  public soldShareTickerName!: string
  private interval$!: Observable<number>;
  private subscription!: Subscription;

  // quantityInputValue!: number;
  walletMoney!: number
  
  constructor(public service: ServService, public state: StateService, private route: ActivatedRoute, private router: Router) {}

  faStarValue = faRegularStar

  calculateTotalBuyValue() {
    this.totalBuyValue = this.buyQuantityInputValue * this.quoteData.c
    if(Number.isInteger(this.buyQuantityInputValue)) {
      if(this.buyQuantityInputValue < 0) {
        this.buyButtonEnabled = false
        this.buyInputValid = true
        this.buyNonPositiveShare = true
      } else if(this.buyQuantityInputValue == 0) {
        this.buyButtonEnabled = false
        this.buyInputValid = false
        this.buyNonPositiveShare = false
      }
      else {
        if(this.totalBuyValue > this.moneyInWalet) {
          this.buyButtonEnabled = false
          this.buyInputValid = true
          this.buyNonPositiveShare = false
        } else {
          this.buyButtonEnabled = true
          this.buyInputValid = true
          this.buyNonPositiveShare = false
        }
      } 
    } else {
      this.buyInputValid = false
      this.buyButtonEnabled = false
      this.buyNonPositiveShare = false
    }
    
  }

  calculateTotalSellValue() {
    this.totalSellValue = this.sellQuantityInputValue * this.quoteData.c
    this.service.getTickerPortfolioDetails(this.ticker).subscribe(data => {
      if(Number.isInteger(this.sellQuantityInputValue)) {
        if(this.sellQuantityInputValue < 0) {
          this.sellButtonInputEnabled = false
          this.sellInputValid = true
          this.sellNonPositiveShare = true

        } else if(this.sellQuantityInputValue == 0) {
          this.sellInputValid = false
          this.sellNonPositiveShare = false
          this.sellButtonInputEnabled = false
        }
        else {
          if(this.sellQuantityInputValue > data.quantity) {
            this.sellButtonInputEnabled = false
            this.sellInputValid = true
            this.sellNonPositiveShare = false
          } else {
            this.sellButtonInputEnabled = true
            this.sellInputValid = true
            this.sellNonPositiveShare = false
          }
        }
      } else {
        this.sellButtonInputEnabled = false
        this.sellInputValid = false
        this.sellNonPositiveShare = false
      }
    })
    
    
  }

  buyButtonOnClick() {
    if(this.buyButtonEnabled) {
      this.service.buyShares(this.ticker, this.buyQuantityInputValue, this.totalBuyValue, this.stockProfileData.name).subscribe(data => {
        this.boughtShareTickerName = this.ticker
        this.moneyInWalet = this.moneyInWalet - this.totalBuyValue
        this.buyQuantityInputValue = 0
        this.shareBought = true

        setTimeout(() => {
          this.shareBought = false
        }, 5000)
      })


    } 
  }

  sellButtonOnClick() {
    if(this.sellButtonEnabled) {
      this.service.sellShares(this.ticker, this.sellQuantityInputValue, this.totalSellValue).subscribe(data => {
        this.soldShareTickerName = this.ticker
        let newQuantity = data.quantity - this.sellQuantityInputValue
        this.moneyInWalet = this.moneyInWalet + this.totalSellValue
        this.sellQuantityInputValue = 0.0
        this.shareSold = true
        setTimeout(() => {
          this.shareSold = false
        }, 5000)
      })
    }
  }

  formatTimestamp() {
    const date = new Date(this.lastTimeStamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hrs = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');

    this.formattedTimeStamp = `${year}-${month}-${day} ${hrs}:${min}:${sec}`;
  }

  formatCurrentTimestamp() {
    const currentTime = new Date();
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    const hrs = String(currentTime.getHours()).padStart(2, '0');
    const min = String(currentTime.getMinutes()).padStart(2, '0');
    const sec = String(currentTime.getSeconds()).padStart(2, '0');

    this.currTimeStamp = `${year}-${month}-${day} ${hrs}:${min}:${sec}`;
  }

  formatPresentTimestamp(timestamp: number) {
    const currentTime = new Date();
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    const hrs = String(currentTime.getHours()).padStart(2, '0');
    const min = String(currentTime.getMinutes()).padStart(2, '0');
    const sec = String(currentTime.getSeconds()).padStart(2, '0');

    this.currTimeStamp = `${year}-${month}-${day} ${hrs}:${min}:${sec}`;
  }


  checkMarketStatus() {
    let currTime = new Date().getTime();
    let lastTimeStamp = this.lastTimeStamp * 1000;

    let timeDiff = currTime - lastTimeStamp
    let timeDiffMins = Math.floor(timeDiff / (1000 * 60));

    if(timeDiffMins > 5) {
      this.marketStatus = false;
    } else {
      this.marketStatus = true;
    }
  }

  private modalService = inject(NgbModal)
  closeResult = '';

  open(content: TemplateRef<any>) {
    this.service.getWalletAmount().subscribe(data => {
      this.moneyInWalet = data.moneyInWallet
    })
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
	}

  private getDismissReason(reason: any): string {
		switch (reason) {
			case ModalDismissReasons.ESC:
				return 'by pressing ESC';
			case ModalDismissReasons.BACKDROP_CLICK:
				return 'by clicking on a backdrop';
			default:
				return `with: ${reason}`;
		}
	}

  public chartoptions!: Highcharts.Options;
  ngOnInit() {
    
    this.service.getTickerPortfolioDetails(this.ticker).subscribe(data => {
      this.stockTickerPortfolioDetails = data
      if(data && data.quantity > 0) {
        this.sellButtonEnabled = true
      } else {
        this.sellButtonEnabled = false
      }
    })

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      let currRoute = this.router.url
      if(currRoute) {
        this.service.setRouteChange(currRoute)
      }

      if(currRoute.startsWith('/search')) {
      } else {
        this.stopInterval()
      }
    })
    
    this.route.paramMap.subscribe(params => {
      let ticker = params.get("ticker")
      if(ticker != null) {
        this.startInterval(ticker)
      }
    })

    this.loadData()
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['ticker'].previousValue !== undefined && changes['ticker'].currentValue) {
      this.loadData()
      // this.tickerChange.emit(changes['ticker'].currentValue)
      this.ticker = changes['ticker'].currentValue
    }
  }

  ngOnDestroy() {
    this.stopInterval()
  }

  private startInterval(ticker: string) {
    this.interval$ = interval(15000)
    this.subscription = this.interval$.subscribe(() => {
      this.service.getQuoteData(ticker).subscribe(data => { 
        this.quoteData = data
        this.formatPresentTimestamp(data['t'])
      })
    })
  }

  private stopInterval() {
    if(this.subscription) {
      this.subscription.unsubscribe()
    }
  }


  loadData() {
    let data = this.service.companyDetails
    
      this.isLoading = true;
      
      if(data && data.stockProfileData && data.stockProfileData.ticker && this.ticker === data.stockProfileData.ticker) {
        this.allCompanyData = data
        this.stockProfileData = data.stockProfileData
        this.quoteData = data.quoteData
        this.newsData = data.newsData
        this.chartsOhlcData = data.chartsTabData
        this.recommendationTrends = data.recommendationTrends
        this.companyInsights = data.companyInsights
        this.companyPeers = data.companyPeer
        this.volumeData = data.volumeData
        this.hourlyPriceData = data.hourlyPriceApiData
        this.isLoading = false
        this.displayData = true;

        this.lastTimeStamp = data.quoteData['t']
        this.formatTimestamp()
        this.checkMarketStatus()
        this.formatCurrentTimestamp()

        this.service.getWalletAmount().subscribe(data => {
          this.moneyInWalet = data.moneyInWallet
        })


        this.service.checkWatchlist(this.ticker).subscribe(data => {
          if(data.exist) {
            this.watchlistExists = true
            this.faStarValue = faSolidStar
            this.buttonClass = 'text-warning'
          } else {
            this.watchlistExists = false
            this.faStarValue = faRegularStar
            this.buttonClass = ''
          }
        })

        let graphlineColor = (data.quoteData['d'] <  0)?'#FF0000':'#00FF00'
        this.chartoptions = {
          title: {
              text: data.stockProfileData.ticker +  ' Hourly Price Variation'
          },
          chart: {
            backgroundColor: '#f5f5f5'
          },
          rangeSelector: {
            enabled: false
          },
          navigator: {
            enabled: false
          },
          series: [{
              name: data.stockProfileData.ticker +  ' Stock Price',
              data: this.hourlyPriceData,
              type: 'spline',
              color: graphlineColor,
              tooltip: {
                  valueDecimals: 2
              }
          }]
       };

        if(data.quoteData['dp'] < 0) {
          this.color = 'red'
        } else {
          this.color = 'green'
        }


      } else {
        this.service.getStockProfileData(this.ticker).subscribe(data => {
          if(Object.keys(data).length === 0) {
            this.error = true;
            this.isLoading = false;
            this.displayData = false;
          } 
          else {

            this.service.getWalletAmount().subscribe(data => {
              this.moneyInWalet = data.moneyInWallet
            })

            this.stockProfileData = data
            this.allCompanyData['stockProfileData'] = data;
            let sources = {
              quoteData: this.service.getQuoteData(this.ticker),
              companyPeersData: this.service.companyPeersData(this.ticker),
              newsData: this.service.getNewsData(this.ticker),
              chartsTabData: this.service.getChartsTabData(this.ticker),
              recommendationTrends: this.service.getRecommendationTrendsData(this.ticker),
              companyInsights: this.service.getCompanyInsightsData(this.ticker),
            }
            forkJoin(sources).subscribe(val => {
              this.allCompanyData['quoteData'] = val.quoteData
              this.allCompanyData['recommendationTrends'] = val.recommendationTrends
              this.recommendationTrends = val.recommendationTrends
    
              if(val == undefined || val.chartsTabData == undefined || val.chartsTabData.results == undefined || Object.keys(val.chartsTabData.results).length === 0 || val.companyPeersData.length === 0 || Object.keys(val.quoteData).length == 0 || Object.keys(val.companyInsights.data).length === 0) {
                this.error = true;
                this.isLoading = false;
              }
              if(this.error === false) {
                this.isLoading = false;
              }
              if(!this.error) {
                this.displayData = true;
              } else {
                this.displayData = false;
              }
              this.chartsOhlcData = val.chartsTabData.results.map(result => {
                return [result.t, result.o, result.h, result.l, result.c]
              })
    
              this.allCompanyData['chartsTabData'] = val.chartsTabData.results.map(result => {
                return [result.t, result.o, result.h, result.l, result.c]
              })
        
              this.volumeData = val.chartsTabData.results.map(result => {
                return [result.t, result.v]
              }) 
    
              this.allCompanyData['volumeData'] = val.chartsTabData.results.map(result => {
                return [result.t, result.v]
              })
    
              this.newsData = val.newsData
              this.allCompanyData['newsData'] = val.newsData
              this.companyPeers = val.companyPeersData.filter(data => !data.includes('.'))
              this.allCompanyData['companyPeer'] = val.companyPeersData.filter(data => !data.includes('.'))
    
              this.quoteData = val.quoteData;
              this.lastTimeStamp = val.quoteData['t']
              this.formatTimestamp()
              this.checkMarketStatus()
              this.formatCurrentTimestamp()
              this.service.checkWatchlist(this.ticker).subscribe(data => {
                if(data.exist) {
                  this.watchlistExists = true
                  this.faStarValue = faSolidStar
                  this.buttonClass = 'text-warning'
                } else {
                  this.watchlistExists = false
                  this.faStarValue = faRegularStar
                  this.buttonClass = ''
                }
              })
              
              let graphlineColor = (val.quoteData['dp'] <  0)?'red':'green'

              if(this.marketStatus === true) {
                // from date -> if market is open 1 day before curr date is from date, to_date is curr date
                let curr_date = new Date()
                let from_date = new Date()
                from_date.setDate(curr_date.getDate() - 1)
                
                let curr_date_year = curr_date.getFullYear()
                let curr_date_month = String(curr_date.getMonth() + 1).padStart(2, '0')
                let curr_date_day = String(curr_date.getDate()).padStart(2, '0')
        
                let final_curr_date = `${curr_date_year}-${curr_date_month}-${curr_date_day}`
                
                let from_date_year = from_date.getFullYear()
                let from_date_month = String(from_date.getMonth() + 1).padStart(2, '0')
                let from_date_day = String(from_date.getDate()).padStart(2, '0')
        
                let final_from_date = `${from_date_year}-${from_date_month}-${from_date_day}`
                

                this.service.getHourPriceApiData(this.ticker, final_from_date, final_curr_date).subscribe(data => {
                  if(data.results) {
                    this.hourlyPriceData = data.results.map(response => {
                      return [response.t, response.c]
                    })
                    this.allCompanyData['hourlyPriceApiData'] = data.results.map(response => {return [response.t, response.c]})
                    let chartData = data.results.map(response => {return [response.t, response.c]})
                    this.chartoptions = {
                      title: {
                          text: data.ticker + ' Hourly Price Variation'
                      },
                      chart: {
                        backgroundColor: '#f5f5f5'
                      },
                      rangeSelector: {
                        enabled: false
                      },
                      navigator: {
                        enabled: false
                      },
                      series: [{
                          name: data.ticker + 'AAPL Stock Price',
                          data: chartData,
                          type: 'spline',
                          color: graphlineColor,
                          tooltip: {
                              valueDecimals: 2
                          }
                      }]
                  };
                  }
                })
              } else{
                // if market closd -> from date is 1day before the market close date, to_date is market closing date
                let to_date_timestamp = this.lastTimeStamp
                let to_date = new Date(to_date_timestamp * 1000)
                let final_to_date = `${to_date.getFullYear()}-${String(to_date.getMonth() + 1).padStart(2, '0')}-${String(to_date.getDate()).padStart(2, '0')}`
                
                let from_date = new Date()
                from_date.setDate(to_date.getDate() - 1)
                let final_from_Date = `${from_date.getFullYear()}-${String(from_date.getMonth() + 1).padStart(2, '0')}-${String(from_date.getDate()).padStart(2, '0')}`
                
                this.service.getHourPriceApiData(this.ticker, final_from_Date, final_to_date).subscribe(data => {
                  if(data.results){
                    this.hourlyPriceData = data.results.map(jsonData => {
                        return [jsonData.t, jsonData.c]
                      })
                      this.allCompanyData['hourlyPriceApiData'] = data.results.map(jsonData => {
                        return [jsonData.t, jsonData.c]
                      })
                      let chartData = data.results.map(json_data => { return [json_data.t, json_data.c] })
                      
                      this.chartoptions = {
                        title: {
                            text: data.ticker + ' Hourly Price Variation'
                        },
                        chart: {
                          backgroundColor: '#f5f5f5'
                        },
                        rangeSelector: {
                          enabled: false
                        },
                        navigator: {
                          enabled: false
                        },
                        series: [{
                            name: data.ticker + ' Stock Price',
                            data: chartData,
                            type: 'spline',
                            color: graphlineColor,
                            tooltip: {
                                valueDecimals: 2
                            }
                        }]
                    };
                  }  
                })
              }
    
              if(val.quoteData['dp'] < 0) {
                this.color = 'red';
              } else {
                this.color = 'green'
              }
        
              this.companyInsights = val.companyInsights.data
              this.allCompanyData['companyInsights'] = val.companyInsights.data
    
              this.service.setCompanyDetails(this.allCompanyData)
            })
          }
        })
      }
  }

  starOnClick() {
    this.service.setWatchlistData(null)
    this.service.localWatchlistData = []
    if(this.faStarValue == faRegularStar) {
      this.faStarValue = faSolidStar
      this.buttonClass = 'text-warning'
      this.service.addToWatchlist({
        stockProfileTicker: this.stockProfileData.ticker,
        stockName: this.stockProfileData.name,
      }).subscribe(data => {
      })
      this.watchListAdded = true;

      setTimeout(() => {
        this.watchListAdded = false;
      }, 5000)
    } else {
      this.faStarValue = faRegularStar
      this.buttonClass = ''
      this.service.deleteFromWatchlist(this.ticker).subscribe(data => {
      })
      this.watchListRemoved = true;
      setTimeout(() => {
        this.watchListRemoved = false;
      }, 5000)
    }
  }

}
