import { forwardRef, useMemo } from 'react';
import { FormattedColor, IconName, TwBaseProps } from '../../types';
import { extractCSSColor } from '../../utils';
import { $spritePath } from './spriteFilePathStore';

export interface IconProps extends TwBaseProps {
  name: IconName;
  height?: number;
  width?: number;
  size?: number;
  color?: FormattedColor | 'inherit';
  disabled?: boolean;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size, width = 16, height = 16, color, disabled = false }, ref) => {
    const [spriteFilePath] = $spritePath.useStore();

    const hexCode = useMemo(() => {
      if (color === 'inherit') return 'currentColor';
      const clr = color ?? (disabled ? 'gray.5' : 'named.8');
      return extractCSSColor(clr);
    }, [color, disabled]);

    return (
      <svg
        ref={ref}
        style={{
          fill: hexCode,
          color: hexCode,
          width: size || width,
          height: size || height,
        }}
      >
        <use xlinkHref={`${spriteFilePath}#${name}`} />
      </svg>
    );
  }
);
