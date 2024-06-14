export class FilterExpression<D, R> {
  operand: D;
  operator: R;
  value: string | number;
}

export class FilterExpressions<D, R> {
  expressionList: FilterExpression<D, R>[]; // with OR between the expressions
  enabled: boolean;
  id: string;
  segmentDescription: string;
  segmentTitle: string;
}
