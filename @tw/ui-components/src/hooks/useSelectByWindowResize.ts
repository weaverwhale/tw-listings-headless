import { useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';

type WindowResizeSelectorCallback<T> = (args: { width: number; height: number }) => T;

/**
 * @description
 * Meant to be used like redux-toolkit useSelector, just for window resize events. Here's a simple example:
 *
 * `const isMobile = useSelectByWindowResize<boolean>(({ width }) => width < 600)`
 *
 * In the callback, you get access to width, height, prevWidth, and prevHeight. There are a lot of possibilities,
 * but the main benefit in using this hook is that it doesn't cause a rerender everytime the window is resized.
 * Just like useSelector, it only causes a rerender when what's being returned from the selector changes.
 */
export function useSelectByWindowResize<T>(cb: WindowResizeSelectorCallback<T>): T {
  const [state, setState] = useState<T>(() =>
    cb({ width: window.innerWidth, height: window.innerHeight })
  );

  useEffect(() => {
    const handleResize = () => {
      const res = cb({ width: window.innerWidth, height: window.innerHeight });
      if (!isEqual(state, res)) setState(res);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [state, cb]);

  return state;
}
