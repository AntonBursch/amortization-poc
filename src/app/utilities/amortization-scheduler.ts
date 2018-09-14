import { Payment } from '../models/payment';
import { Loan } from '../models/loan';

export class AmortizationScheduler {
  static getPaymentSchedule(loan: Loan, type: number = 0): void {
    let balance: number = loan.starting_balance - loan.down_payment;
    let NADA_balance: number = loan.starting_balance;
    const depreciation_per_month: number = loan.annual_depreciation_value / 12;
    let paymentDate: Date = new Date();
    paymentDate.setDate(1);
    const remainingMonths: number = loan.term;
    const payments: Payment[] = [];
    const pmtAmt = this.round(
      this.PMT(loan.annual_interest_rate / 12, loan.term, balance, 0, type),
      2
    );

    for (let i = 0; i < remainingMonths; i++) {
      paymentDate = new Date(
        paymentDate.getFullYear(),
        paymentDate.getMonth(),
        paymentDate.getDate()
      );
      paymentDate.setMonth(paymentDate.getMonth() + 1);
      const payment = new Payment().from({
        id: i + 1,
        payment_paid: 0,
        principal_paid: 0,
        interest_owed: 0,
        interest_paid: 0,
        penalty_owed: 0,
        penalty_paid: 0,
        payment_due_date: paymentDate,
        payment_status: ''
      });
      payment.payment_owed = pmtAmt;
      payment.interest_owed = this.round(
        balance * (loan.annual_interest_rate / 12),
        2
      );
      payment.principal_owed = this.round(pmtAmt - payment.interest_owed, 2);
      payment.remaining_balance = this.round(
        +balance + payment.interest_owed - payment.payment_owed,
        2
      );
      payment.nada_value =
        payment.id % 12 === 0
          ? loan.starting_balance -
            payment.id / 12 * loan.annual_depreciation_value
          : this.round(NADA_balance - depreciation_per_month, 2);
      payment.nada_value_difference = this.round(
        payment.nada_value - payment.remaining_balance,
        2
      );
      payment.ltv = payment.remaining_balance / payment.nada_value;
      balance = payment.remaining_balance;
      NADA_balance = payment.nada_value;
      payments.push(payment);
    }
    loan.payments = payments;
  }

  static makeLoanPayment(loan: Loan, payment: Payment): void {
    if (payment) {
      // If Payment Paid is zero change payment status to "missed payment" Recalculate remaining balance for loan
      // including missed payment fee. Re-amortize loan
      if (+payment.payment_paid === 0) {
        payment.penalty_owed = +loan.missed_payment_fee;
        payment.remaining_balance =
          +payment.remaining_balance +
          payment.payment_owed +
          payment.penalty_owed;
        payment.nada_value_difference =
          payment.nada_value - payment.remaining_balance;
        payment.ltv = payment.remaining_balance / payment.nada_value;
        payment.payment_status = 'Missed';

        // Re-Amortize
        this.reAmortizeList(loan, payment);
      } else if (+payment.payment_paid < payment.payment_owed) {
        // If Payment is partial payment change status to "partial payment" Recalculate remaining balance for loan
        // including partial payment fee. Re-amortize loan.
        // Pay Interest
        const remaining_payment = +payment.payment_paid - payment.interest_owed;
        payment.interest_paid =
          +payment.payment_paid >= payment.interest_owed
            ? payment.interest_owed
            : +payment.payment_paid;

        // Pay Principal
        if (remaining_payment > 0) {
          payment.principal_paid = remaining_payment;
        }

        // Recalculate remaining balance
        payment.penalty_owed = +loan.partial_payment_fee;
        payment.remaining_balance =
          +payment.remaining_balance +
          payment.payment_owed -
          payment.interest_paid -
          payment.principal_paid +
          payment.penalty_owed;
        payment.nada_value_difference =
          payment.nada_value - payment.remaining_balance;
        payment.ltv = payment.remaining_balance / payment.nada_value;
        payment.payment_status = 'Partial';

        // Re-Amortize
        this.reAmortizeList(loan, payment);
      } else if (+payment.payment_paid > payment.payment_owed) {
        // If Payment is over payment change status to "over payment". Recalculate remaining balance for loan
        // including over payment fee. Re-amortize loan.
        const remaining_payment =
          +payment.payment_paid -
          payment.interest_owed -
          payment.principal_owed;
        payment.interest_paid = payment.interest_owed;
        payment.penalty_owed = +loan.over_payment_fee;

        if (remaining_payment < payment.penalty_owed) {
          payment.penalty_paid = remaining_payment;
          payment.principal_paid = payment.principal_owed;
        } else {
          payment.penalty_paid = payment.penalty_owed;
          payment.principal_paid =
            payment.principal_owed + remaining_payment - payment.penalty_owed;
        }

        // Recalculate Remaining Balance
        payment.remaining_balance =
          +payment.remaining_balance +
          payment.payment_owed +
          payment.penalty_owed -
          payment.payment_paid;
        payment.nada_value_difference =
          payment.nada_value - payment.remaining_balance;
        payment.ltv = payment.remaining_balance / payment.nada_value;
        payment.payment_status = 'Over';

        // Re-Amortize
        this.reAmortizeList(loan, payment);
      } else {
        payment.interest_paid = payment.interest_owed;
        payment.principal_paid = payment.principal_owed;
        payment.payment_status = 'Paid';
      }
    }
  }

  private static reAmortizeList(loan: Loan, startingPayment: Payment): void {
    const startingPaymentIndex: number = loan.payments.findIndex(function(
      element
    ) {
      return element.id === startingPayment.id;
    });
    let balance: number = startingPayment.remaining_balance;
    const depreciation_per_month = loan.annual_depreciation_value / 12;
    const pmtAmt = this.round(
      this.PMT(
        loan.annual_interest_rate / 12,
        loan.term,
        loan.starting_balance - loan.down_payment,
        0,
        0
      ),
      2
    );

    // add 1 to index and subtract from loan terms to get remaining terms.
    const remainingTerms: number = loan.term - (startingPaymentIndex + 1);
    for (let i = startingPaymentIndex + 1; i < loan.payments.length; i++) {
      loan.payments[i].payment_owed = pmtAmt;
      loan.payments[i].interest_owed = this.round(
        balance * (loan.annual_interest_rate / 12),
        2
      );
      if (
        balance + loan.payments[i].interest_owed <
        loan.payments[i].payment_owed
      ) {
        loan.payments[i].payment_owed =
          balance + loan.payments[i].interest_owed;
      }
      loan.payments[i].principal_owed = this.round(
        loan.payments[i].payment_owed - loan.payments[i].interest_owed,
        2
      );
      loan.payments[i].remaining_balance = this.round(
        +balance +
          loan.payments[i].interest_owed -
          loan.payments[i].payment_owed,
        2
      );
      loan.payments[i].nada_value_difference =
        loan.payments[i].nada_value - loan.payments[i].remaining_balance;
      loan.payments[i].ltv =
        loan.payments[i].remaining_balance / loan.payments[i].nada_value;
      balance = loan.payments[i].remaining_balance;
    }

    // add payments if balance is still not zero
    if (balance > 0) {
      while (balance > 0) {
        const payment = new Payment().from({
          payment_paid: 0,
          principal_paid: 0,
          interest_owed: 0,
          interest_paid: 0,
          penalty_owed: 0,
          penalty_paid: 0,
          payment_status: ''
        });
        const lastPayment = loan.payments[loan.payments.length - 1];
        payment.id = lastPayment.id + 1;
        payment.payment_owed = lastPayment.payment_owed;
        payment.payment_due_date = new Date(
          lastPayment.payment_due_date.getFullYear(),
          lastPayment.payment_due_date.getMonth() + 1,
          lastPayment.payment_due_date.getDate()
        );
        payment.interest_owed = this.round(
          balance * (loan.annual_interest_rate / 12),
          2
        );
        if (balance + payment.interest_owed < payment.payment_owed) {
          payment.payment_owed = balance + payment.interest_owed;
        }
        payment.principal_owed = this.round(
          payment.payment_owed - payment.interest_owed,
          2
        );
        payment.remaining_balance = this.round(
          +balance + payment.interest_owed - payment.payment_owed,
          2
        );
        payment.nada_value =
          payment.id % 12 === 0
            ? loan.starting_balance -
              payment.id / 12 * loan.annual_depreciation_value
            : this.round(lastPayment.nada_value - depreciation_per_month, 2);
        payment.nada_value_difference =
          payment.nada_value - payment.remaining_balance;
        payment.ltv = payment.remaining_balance / payment.nada_value;
        loan.payments.push(payment);
        balance = payment.remaining_balance;
      }
    }

    // remove any payments from the list that have zero payment owed
    this.trimPayments(loan.payments);
  }

  private static trimPayments(payments: Payment[]): void {
    let done = false;

    while (!done) {
      if (payments[payments.length - 1].payment_owed === 0) {
        payments.pop();
      } else {
        done = true;
      }
    }
  }

  private static PMT(
    ir: number,
    np: number,
    pv: number,
    fv: number = 0,
    type: number = 0
  ): number {
    /*
     * ir   - interest rate per month
     * np   - number of periods (months)
     * pv   - present value
     * fv   - future value
     * type - when the payments are due:
     *        0: end of the period, e.g. end of month (default)
     *        1: beginning of period
     */
    let pmt: number;
    let pvif: number;

    if (ir === 0) {
      return (pv + fv) / np;
    }

    pvif = Math.pow(1 + ir, np);
    pmt = ir * pv * (pvif + fv) / (pvif - 1);

    if (type === 1) {
      pmt /= 1 + ir;
    }
    return pmt;
  }

  static round(value: number, decimals: number) {
    return Number(Math.round(+(value + 'e' + decimals)) + 'e-' + decimals);
  }
}
