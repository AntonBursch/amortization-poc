import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../models/loan';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import 'rxjs/add/operator/takeWhile';

@Component({
  selector: 'app-principle-interest-bar-chart',
  templateUrl: './principle-interest-bar-chart.component.html'
})
export class PrincipleInterestBarChartComponent implements OnInit {
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
            name: 'Principle Owed',
            value: loan.payments[i].principal_owed
          },
          {
            name: 'Interest Owed',
            value: loan.payments[i].interest_owed
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
