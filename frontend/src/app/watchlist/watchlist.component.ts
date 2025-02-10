import { Component, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServService } from '../serv.service';
import { Subscription } from 'rxjs';
import { watchlist } from '../watchlist.interface';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, NgbAlert, FontAwesomeModule, MatProgressSpinnerModule],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.scss'
})
export class WatchlistComponent {
  
  constructor(public service: ServService, private router: Router) {}

  watchlist: watchlist[] = [];
  watchListSubscription!: Subscription;
  empty: boolean = false;
  faTimes = faTimes
  color!: string;
  faCaretDown = faCaretDown
  faCaretUp = faCaretUp
  isLoading: boolean = true;

  ngOnInit() {
      if(!this.service.localWatchlistData.length) {
        this.service.getWatchlist().subscribe(data => {
          if(data.length == 0) {
            this.empty = true;
            this.isLoading = false;
          } else {
            this.empty = false;
          }
          this.service.localWatchlistData = data
          if(!this.service.watchlistData) {
            this.service.setWatchlistData(data)
          }
          data.forEach(jsonData => {
            this.service.getQuoteData(jsonData.stockProfileTicker).subscribe(quoteData => {
              jsonData['c'] = quoteData.c
              jsonData['d'] = quoteData.d
              jsonData['dp'] = quoteData.dp
            })
            this.watchlist.push(jsonData)
          })
    
          this.isLoading = false;
        })
      } else {
        this.service.localWatchlistData.forEach(jsonData => {
          this.service.getQuoteData(jsonData.stockProfileTicker).subscribe(quoteData => {
            jsonData['c'] = quoteData.c
            jsonData['d'] = quoteData.d
            jsonData['dp'] = quoteData.dp
          })
          this.watchlist.push(jsonData)
        })
        this.isLoading = false;
      }
  }

  onClose(ticker: string) {
    this.watchlist = this.watchlist.filter(item => item.stockProfileTicker !== ticker)
    this.service.deleteFromWatchlist(ticker).subscribe(data => {
    })
    if(this.watchlist.length === 0) {
      this.empty = true;
    }
  }

  cardOnClick(ticker: string) {
    this.router.navigate(['/search', ticker])
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  // ngOnDestroy() {
  //   this.watchListSubscription.unsubscribe();
  // }
}
