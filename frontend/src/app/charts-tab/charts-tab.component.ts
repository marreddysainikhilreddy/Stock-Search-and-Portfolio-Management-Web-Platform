import { Component, Input, SimpleChanges } from '@angular/core';
// import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts/highstock';
import { ServService } from '../serv.service';
import HC_indicators from 'highcharts/indicators/indicators';
import HC_vba from 'highcharts/indicators/volume-by-price';
HC_indicators(Highcharts);
HC_vba(Highcharts);


@Component({
  selector: 'app-charts-tab',
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: './charts-tab.component.html',
  styleUrl: './charts-tab.component.scss'
})
export class ChartsTabComponent {
  @Input() public chartsOhlcData: number[][] = [];
  @Input() public volumeData: number[][] = []
  @Input() public ticker!: string;

  constructor(private service: ServService) {}


  public chartoptions!: Highcharts.Options;
  ngOnInit() {
    // this.chartsOhlcData = changes['chartsOhlcData'].currentValue
    this.chartsOhlcData = this.chartsOhlcData
    this.volumeData = this.volumeData
    // this.volumeData = changes['volumeData'].currentValue
    this.chartoptions = {
      rangeSelector: {
        selected: 2
      },
      title: {
        text: this.ticker + ' Historical'
      },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
      },
      chart: {
        backgroundColor: '#f5f5f5'
      },
      yAxis: [{
        startOnTick: false,
        endOnTick: false,
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
        resize: {
            enabled: true
        }
    }, {
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'Volume'
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
    }],
      tooltip: {
        split: true
      },
      plotOptions: {
        series: {
            dataGrouping: {
              units: [
                ['week', [1]],
                ['month', [1, 2, 3, 4, 6]]
              ]
            }
        }
      },
      series: [{
        type: 'candlestick',
        name: this.ticker,
        id: this.ticker.toLowerCase(),
        data: this.chartsOhlcData,
        zIndex: 2
      }, {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: this.volumeData,
        yAxis: 1
      },
      {
        type: 'vbp',
        linkedTo: this.ticker.toLowerCase(),
        params: {
            volumeSeriesID: 'volume'
        },
        dataLabels: {
            enabled: false
        },
        zoneLines: {
            enabled: false
        }
      }, {
        type: 'sma',
        linkedTo: this.ticker.toLowerCase(),
        zIndex: 1,
        marker: {
            enabled: false
        }
    }
    ]
    }
  }
  // ngOnChanges(changes: SimpleChanges) {
    
  
  // }

  // ngOnDestroy() {
  //   this.chartsOhlcSubscription.unsubscribe()
  //   this.volumeSubscription.unsubscribe()
  // }

  Highcharts: typeof Highcharts = Highcharts;
  
}



