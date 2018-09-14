import {Payment} from './payment';
import { ModelBase } from './model-base';

export class Loan extends ModelBase {
  nada: number;
  starting_balance: number;
  down_payment: number;
  down_payment_percentage: number;
  annual_depreciation_value: number;
  annual_interest_rate: number;
  term: number;
  over_payment_fee: number;
  partial_payment_fee: number;
  missed_payment_fee: number;
  payments: Payment[];

  public from(obj: object = {}) {
    return super.from(obj, {
      payments: Payment
    });
  }
}
