import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ErrorComponent } from './error/error.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'search/home', pathMatch: 'full'
    },
    {
        path: 'search/home', component: SearchBarComponent
    },
    {
        path: 'search/:ticker', component: SearchResultsComponent, pathMatch: 'full'
    },
    {
        path: 'watchlist', component: WatchlistComponent
    },
    {
        path: 'portfolio', component: PortfolioComponent
    },
    {
        path: '**', component: ErrorComponent
    }
];
