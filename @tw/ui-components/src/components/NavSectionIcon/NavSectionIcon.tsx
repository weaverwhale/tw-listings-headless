import React from 'react';
import { Image } from '../Image/Image';
import { Flex } from '@mantine/core';
import { images } from './navSectionIcons';
import * as classes from './NavSectionIcon.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { navIconH, navIconW } from './dynamic-vars.css';

export interface INavSectionIcon {
  src: keyof typeof images;
  width?: number;
  height?: number;
}

export const NavSectionIcon: React.FC<INavSectionIcon> = ({ src, width = 24, height = 24 }) => {
  // image size always 2/3s of the surrounding box
  const imageWidth = Math.floor((width * 2) / 3);
  const imageHeight = Math.floor((height * 2) / 3);

  return (
    <Flex
      justify="center"
      align="center"
      className={classes.navSectionIcon}
      style={assignInlineVars({
        [navIconW]: `${width}px`,
        [navIconH]: `${height}px`,
      })}
    >
      <Image src={images[src]} w={imageWidth} h={imageHeight} fit="contain" />
    </Flex>
  );
};
