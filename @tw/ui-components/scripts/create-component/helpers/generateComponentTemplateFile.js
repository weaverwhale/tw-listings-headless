module.exports.generateComponentTemplateFile = (componentName) => {
  return `import { PropsWithChildren, forwardRef } from 'react';
import {
  ${componentName} as Mantine${componentName},
  GetStylesApiOptions,
  MantineStyleProps
} from '@mantine/core';
import { TwBaseProps, FormattedColor } from '../../types';
import { PropsFrom } from '../../utility-types';

// NOTE: Some common functions that are used to generate common custom props
import { getMarketingProps } from '../../utils/commonPropGenerators';

export interface ${componentName}Props
  extends TwBaseProps,
    PropsWithChildren,
    // NOTE: Picking the props to limit/allow from Mantine is done here
    Omit<PropsFrom<typeof Mantine${componentName}>, keyof GetStylesApiOptions | keyof MantineStyleProps> {
  color?: FormattedColor; // NOTE: "color" is here by default because most components need a color, but it isn't required or anything.
}

// NOTE: MAKE SURE TO CHANGE HTMLElement TO THE TYPE OF WHATEVER THE ACTUAL ELEMENT WILL BE
//  You can see what type to use by hovering over Mantine${componentName} in the line above.
export const ${componentName} = forwardRef<HTMLElement, ${componentName}Props>((props, ref) => {
  return (
    <Mantine${componentName}
      {...props}
      ref={ref}
      data-tw-ui-component="${componentName}"
      {...getMarketingProps("Insert something unique here")}
    />;
  )
});
`;
};
