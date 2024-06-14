import {
  FeatureFlagCombinationMethod,
  FeatureFlagCombinationConfig,
  FeatureFlagConfigValue,
  FeatureFlagRankedControlListValue,
} from '../types';
import { isFeatureFlagRankedControlListValue } from '../utils';

const isString = (s: unknown): s is string => typeof s === 'string';
const isNumber = (s: unknown): s is number => typeof s === 'number';
const extract2dArray = <T>(args: unknown[], filter: (i: unknown) => i is T): T[][] => {
  return args.filter((a): a is any[] => Array.isArray(a)).map((a) => a.filter(filter));
};

export const comboMethodConfig: Record<FeatureFlagCombinationMethod, FeatureFlagCombinationConfig> =
  {
    [FeatureFlagCombinationMethod.OR]: {
      combinationFunction: (args: FeatureFlagConfigValue[]) => {
        return args.reduce((acc, x) => acc || x, false);
      },
      defaultValue: false,
    },
    [FeatureFlagCombinationMethod.AND]: {
      combinationFunction: (args: FeatureFlagConfigValue[]) => {
        return args.reduce((acc, x) => acc && x, true);
      },
      defaultValue: false,
    },
    [FeatureFlagCombinationMethod.ARRAY_CONCAT]: {
      combinationFunction: (args: FeatureFlagConfigValue[]) => {
        const arrs = extract2dArray(args, isString);
        return [...new Set(arrs.flat())];
      },
      defaultValue: [],
    },
    [FeatureFlagCombinationMethod.ARRAY_INTERSECT]: {
      combinationFunction: (args: FeatureFlagConfigValue[]) => {
        const arrs = extract2dArray(args, isString);
        const numArrs = arrs.length;
        if (numArrs === 1) return arrs[0];

        const flatArr = arrs.flat();
        const tracker = new Map<string, number>();
        const intersection: string[] = [];

        // get number of each item in array
        for (const el of flatArr) {
          const val = tracker.get(el);
          tracker.set(el, !val ? 1 : val + 1);
        }

        // val can be part of intersection if num of times it appears is equal to numArrs
        for (const [key, val] of tracker) {
          if (val === numArrs) intersection.push(key);
        }

        return intersection;
      },
      defaultValue: [],
    },
    [FeatureFlagCombinationMethod.ARRAY_COMBINE_BY_RANK]: {
      combinationFunction: (args: FeatureFlagConfigValue[]) => {
        const arr = extract2dArray(args, isFeatureFlagRankedControlListValue).flat();
        const tracker = new Map<string, FeatureFlagRankedControlListValue>(); // string is val.id

        for (const val of arr) {
          const current = tracker.get(val.id);
          if (!current || current.rank < val.rank) tracker.set(val.id, val);
        }

        return [...tracker.values()];
      },
      defaultValue: [],
    },
    [FeatureFlagCombinationMethod.MAX]: {
      combinationFunction: (args: FeatureFlagConfigValue[]) => {
        const numbers = args.filter(isNumber);
        return numbers.reduce((a, b) => Math.max(a, b));
      },
      defaultValue: 0,
    },
    [FeatureFlagCombinationMethod.MIN]: {
      combinationFunction: (args: FeatureFlagConfigValue[]) => {
        const numbers = args.filter(isNumber);
        return numbers.reduce((a, b) => Math.min(a, b));
      },
      defaultValue: 0,
    },
    [FeatureFlagCombinationMethod.SUM]: {
      combinationFunction: (args: FeatureFlagConfigValue[]) => {
        const numbers = args.filter(isNumber);
        return numbers.reduce((a, b) => a + b);
      },
      defaultValue: 0,
    },
  };
