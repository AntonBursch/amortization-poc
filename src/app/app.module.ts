import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppComponent } from './app.component';
import { LoanComponent } from './components/loan.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PrincipleInterestBarChartComponent } from './components/principle-interest-bar-chart.component';
import { NadaBalanceBarChartComponent } from './components/nada-balance-bar-chart.component';


@NgModule({
  declarations: [
    AppComponent,
    LoanComponent,
    PrincipleInterestBarChartComponent,
    NadaBalanceBarChartComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbModule.forRoot(),
    NgxChartsModule,
    NgxDatatableModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
