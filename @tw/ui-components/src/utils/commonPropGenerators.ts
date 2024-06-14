/**
 * @description Very important function, which should be used in all components.  Automatically generates
 * required props for marketing for any component like the `data-marketing-target` attribute, which
 * marketing can use for product tours to know how to select any element.
 */
export function getMarketingProps(name: string) {
  return {
    'data-marketing-target': 'market-target-' + name,
  };
}
