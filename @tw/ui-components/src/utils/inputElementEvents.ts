import type { ChangeEvent } from 'react';
import type { TWOnChange } from '../types';

// this will work for any input where event.target.value holds the interesting value
export const wrapInputOnChange =
  (propsOnChange?: TWOnChange<string>) => (event: ChangeEvent<HTMLInputElement>) => {
    if (!propsOnChange) return;
    propsOnChange(event.target.value, event);
  };

export const wrapCheckboxOnChange =
  (propsOnChange?: TWOnChange<boolean>) => (event: ChangeEvent<HTMLInputElement>) => {
    if (!propsOnChange) return;
    propsOnChange(event.target.checked, event);
  };

export const wrapImageInputOnChange =
  (propsOnChange?: TWOnChange<string>) => (event: ChangeEvent<HTMLInputElement>) => {
    if (!propsOnChange) return;
    propsOnChange(event.target.src, event);
  };

export const wrapRadioOnChange = () => {}; // TODO: Implement

// TODO: add more?
