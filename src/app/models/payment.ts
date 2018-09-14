import { ModelBase } from './model-base';

export class Payment extends ModelBase {
  id: number;
  payment_owed: number;
  payment_paid: number;
  principal_owed: number;
  principal_paid: number;
  interest_owed: number;
  interest_paid: number;
  penalty_owed: number;
  penalty_paid: number;
  remaining_balance: number;
  payment_due_date: Date;
  nada_value: number;
  nada_value_difference: number;
  ltv: number;
  payment_status: string;
}
