import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ServService } from '../serv.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, NgbAlertModule ,FontAwesomeModule, NgbTypeahead, ReactiveFormsModule, MatInputModule, MatAutocompleteModule, MatFormFieldModule, MatProgressSpinnerModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})

export class SearchBarComponent {
  faSearch = faSearch
  faTimes = faTimes
  faSpinner = faSpinner

  @Input() public ticker: string = '';

  searchControl = new FormControl();

  public autocompleteOptions!: string[];
  public empty: boolean = false;

  constructor (private http: HttpClient, private apiService: ServService, private router: Router) {}

  checkInputValue() {
    if(this.searchControl.value.trim() === '') {
      this.empty = true;
      setTimeout(() => {
        this.empty = false;
      }, 5000)
    } else {
      this.empty = false;
    }
  }

  isLoading = false;

  
  ngOnInit() {
    this.searchControl.setValue(this.ticker);
    this.searchControl.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe({
      next: inputText => {
        this.apiService.setTickerValue(inputText)
        this.getAutoCompleteOptions(inputText)
      },
      error: err => {
      }
    })
  }

	close() {
    this.empty = false;
	}

  getAutoCompleteOptions(inputText: string) {
    this.isLoading = true;
    this.autocompleteOptions = [];
    if(!inputText) {
      this.isLoading = false;
      // this.empty = true;
      return;
    }
    this.apiService.getData(inputText).subscribe({
      next: response => {
        this.empty = false;
        // if(response.result.length === 0) {
        //   this.empty = true;
        //   // this.apiService.setErrorToTrue();
        // }
        this.autocompleteOptions = response.result
        .filter(item => item.type === "Common Stock" && !item.symbol.includes('.'))
        .map(item => item.symbol + " | " + item.description);
        if(response.result
        .filter(item => item.type === "Common Stock" && !item.symbol.includes('.'))
        .map(item => item.symbol + " | " + item.description).length === 0) {
          this.empty = true;
          setTimeout(() => {
            this.empty = false;
          }, 5000)
        }
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
      }
    }
  )
  }

  onOptionSelect(selectedVal: string) {
    this.empty = false;
    const tickerSymbol = selectedVal.split('|')[0].trim().toUpperCase();
    this.ticker = tickerSymbol;
    this.searchControl.setValue(tickerSymbol);
    this.router.navigate(['/search', tickerSymbol])
    this.apiService.setTickerValue(tickerSymbol)
  }

  onSearch() {
    if(this.searchControl.value === undefined || this.searchControl.value === null || this.searchControl.value === '') {
      this.empty = true;

      setTimeout(() => {
        this.empty = false;
      }, 5000)
      return
    } else {
      this.empty = false;
    }
    const stock_ticker_symbol = this.searchControl.value.split('|')[0].trim().toUpperCase();
    this.router.navigate(['/search', stock_ticker_symbol])
    this.apiService.setTickerValue(stock_ticker_symbol)
  }

  onClear() {
    this.router.navigate(['/search/home'])
    this.searchControl.reset(); 
    this.apiService.setTickerValue('')
    this.apiService.clearCompanyDetails()
  }
}
