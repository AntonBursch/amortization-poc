import { Component } from '@angular/core';
import { Loan } from '../models/loan';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { AmortizationScheduler } from '../utilities/amortization-scheduler';
import { Payment } from '../models/payment';

@Component({
  selector: 'app-loan',
  templateUrl: './loan.component.html'
})
export class LoanComponent implements OnInit {
  public loan: Loan;
  public currentPayment: Payment;
  public currentPaymentIndex: number;
  public currentMonth: Date;
  public paymentAmount: number;
  public disabled: boolean;

  // TODO: fix this CHEAP HACK!!! :)
  public starting_balance: number;
  private nada: number;
  public get NADA(): number {
    return this.nada;
  }
  public set NADA(value: number) {
    if (this.nada !== +value) {
      this.nada = +value;
      this.loan.starting_balance = +this.nada;
      this.loan.down_payment = +this.loan.down_payment_percentage * +this.loan.starting_balance;
      this.starting_balance = +this.loan.starting_balance - +this.loan.down_payment;
    }
  }
  public get down_payment_percentage(): number {
    return this.loan.down_payment_percentage;
  }
  public set down_payment_percentage(value: number) {
    if (this.loan.down_payment_percentage !== +value) {
      this.loan.down_payment_percentage = +value;
      this.loan.down_payment = +this.loan.down_payment_percentage * +this.loan.starting_balance;
      this.starting_balance = +this.loan.starting_balance - +this.loan.down_payment;
    }
  }

  constructor() {
  }

  ngOnInit(): void {
    this.loan = new Loan().from({
      starting_balance: 50000,
      down_payment: 0,
      down_payment_percentage: 0,
      annual_depreciation_value: 10000,
      annual_interest_rate: 0.1649,
      term: 60,
      over_payment_fee: 35,
      partial_payment_fee: 75,
      missed_payment_fee: 100,
      payments: []
    });
    this.down_payment_percentage = 0.2;
    this.NADA = this.loan.starting_balance;
  }

  processMonth() {
    AmortizationScheduler.makeLoanPayment(this.loan, this.currentPayment);
    this.currentPaymentIndex++;
    this.currentPayment = this.loan.payments[this.currentPaymentIndex];
    this.currentMonth = this.currentPayment.payment_due_date;
    this.paymentAmount = this.currentPayment.payment_owed;
    this.loan.payments = [...this.loan.payments];
  }

  enterPayment() {
    this.currentPayment.payment_paid = +this.currentPayment.payment_paid + +this.paymentAmount;
    this.paymentAmount = 0;
    this.loan.payments = [...this.loan.payments];
  }

  createPaymentSchedule() {
    AmortizationScheduler.getPaymentSchedule(this.loan);
    if (this.loan.payments.length > 0) {
      this.currentPaymentIndex = 0;
      this.currentPayment = this.loan.payments[this.currentPaymentIndex];
      this.currentMonth = this.currentPayment.payment_due_date;
      this.paymentAmount = this.currentPayment.payment_owed;
    }
    this.disabled = true;
  }
  reset() {
    location.reload();
  }
}
