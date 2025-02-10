import { Component } from '@angular/core';
import { inject, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServService } from '../serv.service';
import { portfolio } from '../portfolio.interface';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';


@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, MatProgressSpinnerModule, FormsModule, NgbAlert],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent {

  public currPricePortfoliodetails: { [key: string]: any } = {};

  constructor(private service: ServService,  private router: Router) {}
  public ticker: string = '';
  public isLoading: boolean = false;
  public shareBought: boolean = false;
  public shareSold: boolean = false;
  public moneyInWallet!: number;
  public buyInputValid: boolean = true
  public sellInputValid: boolean = true
  sellNonPositiveShare: boolean = false;
  buyNonPositiveShare: boolean = false
  public portfolioDetails!: portfolio[];
  sellButtonInputEnabled: boolean = false;
  public buyQuantityInputValue: number = 0;
  public sellQuantityInputValue: number = 0;
  public totalBuyValue = 0.0
  public totalSellValue = 0.0
  public buyButtonEnabled!: boolean;
  public sellButtonEnabled!: boolean;
  public boughtShareTickerName!: string
  public soldShareTickerName!: string
  public initialSellVal: number = 0;
  public processedPortfolioDetails: {
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

  faCaretDown = faCaretDown
  faCaretUp = faCaretUp
  empty = false

  ngOnInit() {
    this.isLoading = true
    if(!this.service.localProcessedPortfolioDetails.length) {
      this.service.getWalletAmount().subscribe(data => {
        this.moneyInWallet = data.moneyInWallet
        this.service.moneyInWallet = data.moneyInWallet
      })
  
      this.service.getPortfolioDetails().subscribe(data => {
        if(data.length == 0) {
          this.empty = true
        } else {
          this.empty = false
        }
  
        this.portfolioDetails = data
        this.service.setPortfolioDetails(data)
        data.forEach(jsonData => {
          this.service.getQuoteData(jsonData.ticker).subscribe(quoteData => {
            this.currPricePortfoliodetails[jsonData.ticker] = quoteData.c
            let quantity = jsonData.quantity
            let total_cost = parseFloat((jsonData.total_cost).toFixed(2))
            let ticker = jsonData.ticker
            let stockPurchases = jsonData.stockPurchases
            let currPrice = parseFloat((quoteData.c).toFixed(2))
            let marketValue = parseFloat((quantity*currPrice).toFixed(2))
            let avg_cost_per_share = parseFloat((total_cost/quantity).toFixed(2))
            let change = parseFloat((currPrice - avg_cost_per_share).toFixed(2))
            const color = currPrice < avg_cost_per_share ? 'text-danger' : currPrice > avg_cost_per_share ? 'text-success' : currPrice === avg_cost_per_share ? 'text-black' : '';
            // let color = currPrice > avg_cost_per_share ?'text-success':''
            // let color = currPrice == avg_cost_per_share ?'text-black':''
            this.processedPortfolioDetails.push({
              ticker: ticker,
              quantity: quantity,
              stockPurchases: stockPurchases,
              stock_name: jsonData.stock_name,
              total_cost: total_cost,
              change: change,
              currPrice: currPrice,
              avg_cost_per_share: avg_cost_per_share,
              market_value: marketValue,
              color: color
            })
            this.service.localProcessedPortfolioDetails.push({
              ticker: ticker,
              quantity: quantity,
              stockPurchases: stockPurchases,
              stock_name: jsonData.stock_name,
              total_cost: total_cost,
              change: change,
              currPrice: currPrice,
              avg_cost_per_share: avg_cost_per_share,
              market_value: marketValue,
              color: color
            })
          })  
        })
        setTimeout(() => {
          this.isLoading = false
        }, 200)
      })
    } else {
      this.moneyInWallet = this.service.moneyInWallet
      this.processedPortfolioDetails = this.service.localProcessedPortfolioDetails
      this.isLoading = false
    }


    // this.service.portfolioDetialsData$.subscribe(portfolioDetailsData => {
    //   this.portfolioDetails = portfolioDetailsData

    // })

    

  }

  buyShares(ticker: string, stock_name: string) {
    this.service.buyShares(ticker, this.buyQuantityInputValue, this.totalBuyValue, stock_name).subscribe(data => {
      this.boughtShareTickerName = ticker
      let newQuantity = this.buyQuantityInputValue + data.quantity
      let newTotalCost = data.total_cost + this.totalBuyValue
      
      this.moneyInWallet = this.moneyInWallet - this.totalBuyValue

      let buyingSharePortfolioDetails = this.processedPortfolioDetails.find(data => data.ticker === ticker)
      if(buyingSharePortfolioDetails) {
        buyingSharePortfolioDetails.quantity = newQuantity
        buyingSharePortfolioDetails.total_cost = newTotalCost
        buyingSharePortfolioDetails.avg_cost_per_share = parseFloat((newTotalCost/newQuantity).toFixed(2))
        buyingSharePortfolioDetails.market_value = newQuantity * buyingSharePortfolioDetails.currPrice
        buyingSharePortfolioDetails.change = parseFloat((buyingSharePortfolioDetails.currPrice - buyingSharePortfolioDetails.avg_cost_per_share).toFixed(2))
        buyingSharePortfolioDetails.color = buyingSharePortfolioDetails.currPrice < buyingSharePortfolioDetails.avg_cost_per_share ? 'text-danger' : buyingSharePortfolioDetails.currPrice > buyingSharePortfolioDetails.avg_cost_per_share ? 'text-success' : buyingSharePortfolioDetails.currPrice === buyingSharePortfolioDetails.avg_cost_per_share ? 'text-black' : '';
      }

      this.service.portfolioDetialsData$.subscribe(data => {
        let portfolioItem = data.find(jsonData => jsonData.ticker == ticker)
        if(portfolioItem && portfolioItem.quantity) {
          portfolioItem.quantity = newQuantity
        }
        if(portfolioItem && portfolioItem.total_cost) {
          portfolioItem.total_cost = newTotalCost
        }
        this.portfolioDetails = data
      })

      this.service.setPortfolioDetails(this.portfolioDetails)
      this.buyQuantityInputValue = 0
      this.shareBought = true
      setTimeout(() => {
        this.shareBought = false
      }, 5000)
    })
  }

  sellShares(ticker: string) {
    let sellQuantity = this.sellQuantityInputValue
    this.service.sellShares(ticker, this.sellQuantityInputValue, this.totalSellValue).subscribe(data => {
      this.soldShareTickerName = ticker
      let newQuantity = data.quantity - this.sellQuantityInputValue

      this.moneyInWallet = this.moneyInWallet + this.totalSellValue

      // if(this.portfolioDetails) {
      //   this.portfolioDetails.find(data => data.ticker == ticker)?.total_cost -= 
      // }

      let sellSharePortfolioDetails = this.processedPortfolioDetails.find(data => data.ticker === ticker)
      if(sellSharePortfolioDetails) {
        sellSharePortfolioDetails.quantity = newQuantity
        if(newQuantity == 0) {
          this.processedPortfolioDetails = this.processedPortfolioDetails.filter(data => data.quantity !== 0);
        }
        let removedStockValues = sellSharePortfolioDetails.stockPurchases.splice(0, this.sellQuantityInputValue)
        const sum = removedStockValues.reduce((acc, currVal) => {
          return acc + currVal
        }, 0)
        sellSharePortfolioDetails.total_cost = parseFloat((sellSharePortfolioDetails.total_cost - sum).toFixed(2))
        sellSharePortfolioDetails.avg_cost_per_share = parseFloat((sellSharePortfolioDetails.total_cost/newQuantity).toFixed(2))
        sellSharePortfolioDetails.market_value = newQuantity * sellSharePortfolioDetails.currPrice
        sellSharePortfolioDetails.change = parseFloat((sellSharePortfolioDetails.currPrice - sellSharePortfolioDetails.avg_cost_per_share).toFixed(2))
        sellSharePortfolioDetails.color = sellSharePortfolioDetails.currPrice < sellSharePortfolioDetails.avg_cost_per_share ? 'text-danger' : sellSharePortfolioDetails.currPrice > sellSharePortfolioDetails.avg_cost_per_share ? 'text-success' : sellSharePortfolioDetails.currPrice === sellSharePortfolioDetails.avg_cost_per_share ? 'text-black' : '';
      }

      // this.service.portfolioDetialsData$.subscribe(portfolioData => {
      //   console.log("Entered subscribe")
      //   if(portfolioData) {
          
      //     let portfolioItem = portfolioData.find(jsonData => jsonData.ticker == ticker)
      //     if(portfolioData.filter(data => data.quantity != 0).length) {
      //       this.empty = false
      //     } else {
      //       console.log(portfolioData)
      //       console.log(portfolioData.filter(data => data.quantity != 0))
      //       console.log(portfolioData.filter(data => data.quantity != 0).length)
      //       this.empty = true
      //     }
  
      //     if(newQuantity <= 0) {
      //       this.portfolioDetails = this.portfolioDetails.filter(data => data.quantity !== 0)
      //     }
          
      //     if(portfolioItem && portfolioItem.quantity) {
      //       portfolioItem.quantity = newQuantity
      //     }
  
      //     this.portfolioDetails = portfolioData.filter(data => data.quantity != 0)
      //     if(portfolioData.filter(data => data.quantity != 0).length) {
      //       console.log("line 136")
      //       this.empty = false;
      //     } else {
      //       console.log("Line 139")
      //       this.empty = true;
      //     }
      //   }
      // }) 

      // this.service.setPortfolioDetails(this.portfolioDetails)
      this.sellQuantityInputValue = 0
      this.shareSold = true
      if(!this.processedPortfolioDetails.length) {
        this.empty = true
      }
      setTimeout(() => {
        this.shareSold = false
      }, 5000)
    })
  }

  calculateTotalBuyValue(ticker: string) {
    this.totalBuyValue = this.buyQuantityInputValue * this.currPricePortfoliodetails[ticker]

    
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
        if(this.totalBuyValue > this.moneyInWallet) {
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

  calculateTotalSellValue(ticker: string, quantityOfStock: number) {
    let porfolioDetails = this.service.localProcessedPortfolioDetails.find(data => data.ticker == ticker)
    if(porfolioDetails?.currPrice) {
      this.totalSellValue = this.sellQuantityInputValue * porfolioDetails?.currPrice
    } else {
    }
    
    if(Number.isInteger(this.sellQuantityInputValue)) {
      if(this.sellQuantityInputValue < 0) {
        this.sellButtonEnabled = false
        this.sellInputValid = true
        this.sellNonPositiveShare = true
      } else if(this.sellQuantityInputValue == 0) {
        this.sellInputValid = false
        this.sellNonPositiveShare = false
        this.sellButtonEnabled = false
      } else {
        if(this.sellQuantityInputValue > quantityOfStock) {
          this.sellButtonEnabled = false
          this.sellInputValid = true
          this.sellNonPositiveShare = false
        } else {
          this.sellButtonEnabled = true
          this.sellInputValid = true
          this.sellNonPositiveShare = false
        }
      }
    } else {
      this.sellButtonInputEnabled = false
      this.sellInputValid = false
      this.sellNonPositiveShare = false
    }
    
    
    
    // this.sellButtonEnabled = (this.sellQuantityInputValue > quantityOfStock)?false:true;
    // if(this.totalSellValue < 0 || this.sellQuantityInputValue < 0) {
    //   this.sellButtonEnabled = false
    // }
    // if(Number.isInteger(this.sellQuantityInputValue)) {
    //   this.sellInputValid = true
    //   this.sellButtonEnabled = true
    // } else {
    //   this.sellInputValid = false
    //   this.sellButtonEnabled = false
    // }
  }

  private modalService = inject(NgbModal)
  closeResult = '';
  open(content: TemplateRef<any>) {

		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
	}

  cardOnClick(ticker: string) {
    this.router.navigate(['/search', ticker])
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
}
