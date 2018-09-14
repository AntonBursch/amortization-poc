import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../models/loan';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import 'rxjs/add/operator/takeWhile';

@Component({
  selector: 'app-nada-balance-bar-chart',
  templateUrl: './nada-balance-bar-chart.component.html'
})
export class NadaBalanceBarChartComponent implements OnInit {
  @Input() loan: Loan;

  chartSeries: any[];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Loan Payment';
  showYAxisLabel = true;
  yAxisLabel = 'Dollars';

  colorScheme = {
    domain: ['#7aa3e5', '#339966']
  };

  alive = true;
  interval = 1000;

  constructor() {}

  ngOnInit() {
    this.loanDataToChartData(this.loan);
    TimerObservable.create(this.interval, this.interval)
      .takeWhile(() => this.alive)
      .subscribe(() => {
        this.loanDataToChartData(this.loan);
      });
  }

  loanDataToChartData(loan: Loan): void {
    this.chartSeries = [];
    for (let i = 0; i < loan.payments.length; i++) {
      const chartObject = {
        name: loan.payments[i].id,
        series: [
          {
            name: 'Remaining Balance',
            value: loan.payments[i].remaining_balance
          },
          {
            name: 'NADA Value',
            value: loan.payments[i].nada_value
          }
        ]
      };
      this.chartSeries.push(chartObject);
    }
  }

  yAxisFormat(val) {
    return '$' + val.toLocaleString();
  }
}
