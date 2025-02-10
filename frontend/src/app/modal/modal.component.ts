import { Component, Input, inject, TemplateRef } from '@angular/core';
import { newsData } from '../news.interface';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faSquareFacebook } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgbDatepickerModule, CommonModule, FontAwesomeModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  	@Input() public news!: newsData;
	@Input() public newsHeadline!: string;
	@Input() public newsUrl!: string;

  	private modalService = inject(NgbModal);
	closeResult = '';
  	dateFormatted!: string;
  	faXTwitter = faXTwitter
	faSquareFacebook = faSquareFacebook
  
	shareOnTwitter($event: Event) {
		$event.preventDefault()
		if(this.newsUrl && this.newsHeadline) {
			let xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.newsHeadline)}&url=${encodeURIComponent(this.newsUrl)}`;
			window.open(xUrl, '_blank')
		}
	}
	// Strong Buy: #195f32
// Buy: #23af50
// Hold: #af7d28
// Sell: #f05050
// StrongSell: #732828
	shareOnFacebook($event: Event) {
		$event.preventDefault()
		if(this.newsHeadline && this.newsUrl) {
			let facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.newsUrl)}`;
			window.open(facebookUrl, '_blank')
		}
	}

	open(content: TemplateRef<any>) {
    let date = new Date(this.news.datetime * 1000);
  
    let month = date.toLocaleString('default', { month: 'long' });
    let day = date.getDate();
    let year = date.getFullYear();
  

    let formattedDate = `${month} ${day}, ${year}`;
    this.dateFormatted = formattedDate
    // console.log(this.formattedDate)  
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
}
