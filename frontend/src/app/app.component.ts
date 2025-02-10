import { Component, ElementRef, QueryList, ViewChildren, AfterViewInit, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { ServService } from './serv.service';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgbModule, RouterModule, SearchBarComponent, HighchartsChartModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'web-tech-assignment-3';
  selectedLinkIndex = 0;
  navCollapsed = true;

  @ViewChildren('navLink') navLinks!: QueryList<ElementRef>;

  public tickerPresent!: boolean;
  public tickerValue!: string;
  constructor(private service: ServService, private router: Router) {}
  onSearchPage = false

  ngAfterViewInit() {
    this.navLinks.toArray()[this.selectedLinkIndex].nativeElement.classList.add("bordered")
    
  } 

  ngOnInit() {
    this.service.companyDetailsData$.subscribe(val => {
      if(val.stockProfileData.ticker) {
        this.tickerPresent = true;
        this.tickerValue = val.stockProfileData.ticker
      } else {
        this.tickerPresent = false;
      }
    })

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.onSearchPage = this.router.url.startsWith('/search');
      }
    });

    
  }


  
}
