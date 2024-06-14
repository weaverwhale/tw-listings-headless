import { NavLink as MantineNavLink } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../Icon/Icon';
import { TwStyleSystemProps } from '../../types';
import { getMarketingProps } from '../../utils/commonPropGenerators';
import { PropsFrom } from '../../utility-types';
import { cx } from '../../utils/cx';
import * as classes from './NavSection.css';

// TODO: See a way to make these less smart
export type NavSectionLinkProps = {
  label: React.ReactNode;
  id?: string;
  isActive?: boolean;
  onClick?: (...args: any[]) => any;
  as?: PropsFrom<typeof MantineNavLink>['component'];
  leftSection?: PropsFrom<typeof MantineNavLink>['leftSection'];
  style?: TwStyleSystemProps;
};
export const NavSectionLink: React.FC<NavSectionLinkProps> = ({
  id,
  label,
  style,
  isActive,
  onClick,
  as,
  leftSection,
}) => {
  return (
    <MantineNavLink
      variant="light"
      component={as}
      className={cx(classes.link, classes.childLink, !!isActive && classes.activeLink)}
      onClick={onClick}
      label={label}
      pl={42}
      leftSection={leftSection}
      {...style}
      {...getMarketingProps(id ?? (typeof label === 'string' ? label : 'no-label'))}
    />
  );
};

export type NavSectionProps = {
  title?: string;
  icon?: React.FC<{ width?: number; height?: number }>;
  routes: NavSectionLinkProps[];
  isOpen?: boolean;
  onClick?: () => void;
};
export const NavSection: React.FC<NavSectionProps> = ({
  title,
  routes,
  icon,
  isOpen: _isOpen = false,
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(_isOpen);

  const hasChildren = !!routes.length;

  const LeftIcon = useMemo(() => (typeof icon === 'function' ? icon({}) : icon), [icon]);
  const RightSection = useMemo(
    () => (hasChildren ? <Icon width={10} name={`arrow-${isOpen ? 'up' : 'down'}-3`} /> : null),
    [hasChildren, isOpen]
  );

  const toggleOpen = () => {
    setIsOpen((x) => !x);
    onClick?.();
  };

  const childLinks = useMemo(() => {
    if (!hasChildren) return;

    if (routes.length === 1) {
      const { onClick, label } = routes[0];
      return (
        <MantineNavLink
          variant="light"
          className={cx(classes.link, classes.sectionLink)}
          leftSection={LeftIcon}
          label={label}
          onClick={onClick}
        />
      );
    }

    return routes.map((props, i) => {
      const key = `nav-link-${i}-${props.label}`;
      return <NavSectionLink {...props} id={title + '-' + props.label} key={key} />;
    });
  }, [hasChildren, routes, LeftIcon, title]);

  useEffect(() => {
    setIsOpen(_isOpen);
  }, [_isOpen]);

  if (childLinks && !Array.isArray(childLinks)) {
    return childLinks;
  }

  return (
    <MantineNavLink
      opened={isOpen}
      key={(title || 'link-title') + icon}
      variant="light"
      pr={20}
      className={cx(classes.link, classes.sectionLink)}
      leftSection={LeftIcon}
      label={title}
      onClick={toggleOpen}
      childrenOffset={0}
      rightSection={RightSection}
      disableRightSectionRotation
      {...getMarketingProps(title || '')}
    >
      {childLinks}
    </MantineNavLink>
  );
};
