import { FilterComparator, FilterPropertyType } from '@tw/types/module/services/insights';

export function buildCollectionCondition({
  collectionName,
  subCollectionName,
  propertyFieldName,
  propertyType,
  comparator,
  values,
}: {
  collectionName: string;
  subCollectionName?: string;
  propertyFieldName: string;
  propertyType: FilterPropertyType;
  comparator: FilterComparator;
  values;
}): string {
  if (propertyFieldName === 'count') {
    return buildCondition({
      propertyFieldName: `ARRAY_LENGTH(${collectionName})`,
      propertyType,
      comparator,
      values,
    });
  }

  const valueCondition = buildCondition({ propertyFieldName, propertyType, comparator, values });
  const unnestExpression = `UNNEST(${collectionName}) ${
    subCollectionName ? `, UNNEST(${subCollectionName})` : ''
  } ${subCollectionName || collectionName}`;
  const countExpression = `SELECT COUNT(${propertyFieldName}) FROM ${unnestExpression} where ${valueCondition}`;

  if (isNegativeComparator(comparator)) {
    return `(${countExpression}) = ARRAY_LENGTH(${collectionName})`;
  } else {
    return `(${countExpression}) > 0`;
  }
}

export function buildCondition({
  propertyFieldName,
  propertyType,
  comparator,
  values,
}: {
  propertyFieldName: string;
  propertyType: FilterPropertyType;
  comparator: FilterComparator;
  values;
}): string {
  let value = handleValueSpecialChars(values.value, comparator);

  switch (comparator) {
    case FilterComparator.EQUAL:
      if (propertyType === FilterPropertyType.STRING) value = `'${value}'`;
      return `${propertyFieldName} = ${value}`;
    case FilterComparator.NOT_EQUAL:
      if (propertyType === FilterPropertyType.STRING) value = `'${value}'`;
      return `${propertyFieldName} <> ${value}`;
    case FilterComparator.GREATER_THAN:
      return `${propertyFieldName} > ${value}`;
    case FilterComparator.LESS_THAN:
      return `${propertyFieldName} < ${value}`;
    case FilterComparator.CONTAIN:
      return `lower(${propertyFieldName}) LIKE '%${value.toLocaleLowerCase()}%'`;
    case FilterComparator.NOT_CONTAIN:
      return `lower(${propertyFieldName}) NOT LIKE '%${value.toLocaleLowerCase()}%'`;
    case FilterComparator.START_WITH:
      return `lower(${propertyFieldName}) LIKE '${value.toLocaleLowerCase()}%'`;
    case FilterComparator.NOT_START_WITH:
      return `lower(${propertyFieldName}) NOT LIKE '${value.toLocaleLowerCase()}%'`;
    case FilterComparator.END_WITH:
      return `lower(${propertyFieldName}) LIKE '%${value.toLocaleLowerCase()}'`;
    case FilterComparator.NOT_END_WITH:
      return `lower(${propertyFieldName}) NOT LIKE '%${value.toLocaleLowerCase()}'`;
    case FilterComparator.IS_IN:
      return `${propertyFieldName} IN ('${value.join("','")}')`;
    case FilterComparator.IS_NOT_IN:
      return `${propertyFieldName} NOT IN ('${value.join("','")}')`;
    case FilterComparator.IS_SET:
      return `${propertyFieldName} IS NOT NULL`;
    case FilterComparator.IS_NOT_SET:
      return `${propertyFieldName} IS NULL`;
    case FilterComparator.IS:
      return `${propertyFieldName} = true`;
    case FilterComparator.IS_NOT:
      return `${propertyFieldName} = false`;

    // array fields (repeated_string)
    case FilterComparator.ARRAY_CONTAINS:
      return `'${value}' IN UNNEST(${propertyFieldName})`;
    case FilterComparator.ARRAY_NOT_CONTAINS:
      return `'${value}' NOT IN UNNEST(${propertyFieldName})`;

    // Date
    case FilterComparator.OVER_ALL_TIME:
      return 'true';
    case FilterComparator.BETWEEN:
      return `DATE(${propertyFieldName}, shop_timezone) BETWEEN '${values.value1}' AND '${values.value2}'`;
    case FilterComparator.BEFORE:
      return `DATE(${propertyFieldName}, shop_timezone) < '${value}'`;
    case FilterComparator.AFTER:
      return `DATE(${propertyFieldName}, shop_timezone) > '${value}'`;
    case FilterComparator.WITHIN:
      const largerValue = values.value1 > values.value2 ? values.value1 : values.value2;
      const smallerValue = values.value1 < values.value2 ? values.value1 : values.value2;
      return `DATE(${propertyFieldName}, shop_timezone) BETWEEN DATE(DATE_ADD(CURRENT_DATETIME(shop_timezone), INTERVAL -${smallerValue} ${values.unit})) AND DATE(DATE_ADD(CURRENT_DATETIME(shop_timezone), INTERVAL -${largerValue} ${values.unit}))`;
    case FilterComparator.UNDER:
      return `DATE(${propertyFieldName}, shop_timezone) > DATE_ADD(CURRENT_DATETIME(), INTERVAL -${value} ${values.unit})`;
    case FilterComparator.OVER:
      return `DATE(${propertyFieldName}, shop_timezone) < DATE_ADD(CURRENT_DATETIME(), INTERVAL -${value} ${values.unit})`;
  }
}

export function handleValueSpecialChars(value, comparator?: FilterComparator) {
  const replace = (val) => {
    const newVal = val.replace(/\'/g, "\\'");
    if (comparator === FilterComparator.CONTAIN || comparator === FilterComparator.NOT_CONTAIN) {
      return newVal.replace(/_/g, '\\_');
    }
    return newVal;
  };

  if (typeof value === 'string') {
    return replace(value);
  }

  if (Array.isArray(value)) {
    return value.map((val) => {
      if (typeof val === 'string') {
        return replace(val);
      }

      return val;
    });
  }

  return value;
}

function isNegativeComparator(comparator: FilterComparator): boolean {
  return [
    FilterComparator.NOT_EQUAL,
    FilterComparator.NOT_CONTAIN,
    FilterComparator.NOT_START_WITH,
    FilterComparator.NOT_END_WITH,
    FilterComparator.IS_NOT_IN,
    FilterComparator.IS_NOT_SET,
    FilterComparator.IS_NOT,
  ].includes(comparator);
}
