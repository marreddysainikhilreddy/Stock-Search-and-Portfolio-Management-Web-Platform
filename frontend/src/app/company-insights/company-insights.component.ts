import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { companyData } from '../company-insights.interface';
import { ServService } from '../serv.service';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { recommdationTrends } from '../recommendation-trends.interface';
import { companyEarnings } from '../company-earnings.interface';


@Component({
  selector: 'app-company-insights',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './company-insights.component.html',
  styleUrl: './company-insights.component.scss'
})
export class CompanyInsightsComponent {
  @Input() public ticker!: string;

  companyInsights!: companyData[];
  public recommendationChartoptions!: Highcharts.Options;
  public companyEarningsChartOptions!: Highcharts.Options;
  constructor(private service: ServService) {}

  totalMspr: number = 0;
  positiveMspr: number = 0;
  negativeMspr: number = 0;
  totalChange: number = 0;
  positiveChange: number = 0;
  negativeChange: number = 0;

  Highcharts: typeof Highcharts = Highcharts;
  recommendationTrendsData!: recommdationTrends[];
  companyEarningsData!: companyEarnings[];

  ngOnInit() {
    this.service.getCompanyInsightsData(this.ticker)
    .subscribe(val => {
      this.companyInsights = val.data
      this.calculateInsights(val.data)
    })

    this.service.getCompanyEarnings(this.ticker).subscribe(data => {
      this.companyEarningsData = data
      this.companyEarningsChartOptions = {
        title: {
          text: 'Historical EPS Surprises',
        },
        yAxis: {
          title: {
            text: 'Quarterly EPS'
          }
        },
        xAxis: {
          categories: this.companyEarningsData.map(data => data.period + "<br />Surprise: " + data.surprise)
        },
        chart: {
          backgroundColor: '#f5f5f5'
        },
        plotOptions: {
          series: {
            label: {
              connectorAllowed: false
            },
          }
        },
        series: [
          {
          type: 'spline',
          name: 'Actual',
          data: this.companyEarningsData.map(data => data.actual)
          },
          {
            type: 'spline',
            name: 'Estimate',
            data: this.companyEarningsData.map(data => data.estimate)
          }
        ]
      }
    })

    this.service.getRecommendationTrendsData(this.ticker).subscribe(data => {
      this.recommendationTrendsData = data
      this.recommendationChartoptions = {
        chart: {
          type: 'column',
          backgroundColor: '#f5f5f5'
        },
        title: {
          text: 'Recommendation trends',
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            year: '%Y',
            month: '%m',
          },
          categories: this.recommendationTrendsData.map(data => data.period)
        },
        yAxis: {
          allowDecimals: false,
          min: 0,
          title: {
            text: '#Analysis'
          }
        },
        tooltip: {
          format: '<b>{key}</b><br/>{series.name}: {y}<br />Total: {point.stackTotal}'
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,
            }
          },
          
        },
        series: [
          {
          name: 'Strong Buy',
          data: this.recommendationTrendsData.map(data =>  data.strongBuy),
          type: 'column',
          color: '#195f32'
          },
          {
            name: 'Buy',
            data: this.recommendationTrendsData.map(data => data.buy),
            type: 'column',
            color: '#23af50'
          },
          {
            name: 'Hold',
            data: this.recommendationTrendsData.map(data => data.hold),
            type: 'column',
            color: '#af7d28'
          },
          {
            name: 'Sell',
            data: this.recommendationTrendsData.map(data => data.sell),
            type: 'column',
            color: '#f05050'
          },
          {
            name: 'Strong Sell',
            data: this.recommendationTrendsData.map(data => data.strongSell),
            type: 'column',
            color: '#732828'
          },
        ]
      }
    })
  }


  calculateInsights(companyInsights: companyData[]) {
    for(let x of companyInsights) {
      this.totalMspr += x.mspr;
      this.positiveMspr += x.mspr > 0 ? x.mspr : 0;
      this.negativeMspr += x.mspr < 0 ? x.mspr : 0;
      this.totalChange += x.change;
      this.positiveChange += x.change > 0 ? x.change : 0;
      this.negativeChange += x.change < 0 ? x.change : 0;
    }
    this.totalMspr = (Number.isInteger(this.totalMspr))?this.totalMspr:+this.totalMspr.toFixed(2)
    this.positiveMspr = (Number.isInteger(this.positiveMspr))?this.positiveMspr:+this.positiveMspr.toFixed(2)
    this.negativeMspr = (Number.isInteger(this.negativeMspr))?this.negativeMspr:+this.negativeMspr.toFixed(2)
    this.totalChange = (Number.isInteger(this.totalChange))?this.totalChange:+this.totalChange.toFixed(2)
    this.positiveChange = (Number.isInteger(this.positiveChange))?this.positiveChange:+this.positiveChange.toFixed(2)
    this.negativeChange = (Number.isInteger(this.negativeChange))?this.negativeChange:+this.negativeChange.toFixed(2)
  }
} 