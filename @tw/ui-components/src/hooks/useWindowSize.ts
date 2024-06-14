import { BreakpointMap } from '../types';
import { useSelectByWindowResize } from './useSelectByWindowResize';

type Dimension = 'width' | 'height'; // so hook can determine which dimensions to look for

/**
 * @description
 * this hook takes in a map of custom dimensions and returns the name of the
 * dimension that currently matches the size of the window.
 * @param dimension Either 'width'  or 'height'. Determines what dimension the dimensionConstraints are being used on.
 * @param dimensionConstraints Map of dimension name to min size for that dimension.
 * @returns Name of the first object in the dimensions map that matches the current window width.
 */
export function useWindowSize<T extends BreakpointMap>(
  dimension: Dimension,
  map: T
): keyof T | 'unmapped' {
  return useSelectByWindowResize<keyof T | 'unmapped'>((dimensions) => {
    const size = dimensions[dimension];

    for (const key in map) {
      const [min, max] = map[key];
      if (size >= min && (typeof max !== 'number' || size < max)) return key;
    }

    return 'unmapped';
  });
}
