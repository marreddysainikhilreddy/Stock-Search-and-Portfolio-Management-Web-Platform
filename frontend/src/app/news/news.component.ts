import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServService } from '../serv.service';
import { newsData } from '../news.interface';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [RouterModule, CommonModule, ModalComponent],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent {

  constructor(private apiService: ServService) {}

  @Input() public ticker!: string;

  newsDate!: newsData[];

  formatTimestamp(timestamp: number) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hrs = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hrs}:${min}:${sec}`;
  }


  ngOnInit() {
    this.apiService.getNewsData(this.ticker).subscribe({
      next: data => {
        let filterData = data.filter(item => item.image && item.headline)
        this.newsDate = filterData.slice(0, 20);
      },
      error: err => {
        // console.log("Error while fetching news data ", err);
      }
    })
  }
}
