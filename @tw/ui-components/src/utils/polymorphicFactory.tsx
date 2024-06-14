import { forwardRef } from 'react';

type PolymorphicComponentProps<T extends React.ElementType, Props> = Props & {
  as?: T;
};

/**
 * HOF used to maintain our polymorphic structure when working with Mantine
 * polymorphic components. This is why 'component' is removed from the type.
 */
export function polymorphicFactory<Props>(
  Component: React.ComponentType<Omit<Props, 'component'>>
) {
  return function <T extends React.ElementType = 'div'>({
    as,
    ...props
  }: PolymorphicComponentProps<T, Props> & React.ComponentPropsWithoutRef<T>) {
    const ComponentType: React.ElementType = as || 'div';
    return <Component {...(props as any)} component={ComponentType} />;
  };
}

// TODO: Figure this out!!!
export function polymorphicFactoryWithRef<Props>(
  Component: React.ComponentType<Omit<Props, 'component'> & { ref: React.Ref<any> }>
) {
  return forwardRef(
    <T extends React.ElementType = 'div'>({
      as,
      ...props
    }: PolymorphicComponentProps<T, Props> & React.ComponentPropsWithRef<T>) => {
      const ComponentType: React.ElementType = as || 'div';
      return <Component {...(props as any)} component={ComponentType} />;
    }
  );
}
