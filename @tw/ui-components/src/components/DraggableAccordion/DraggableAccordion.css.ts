import { style } from '@vanilla-extract/css';

export const draggableItem = style({
  border: '1px solid blue',
});

export const dragging = style([
  draggableItem,
  {
    borderColor: 'green',
  },
]);

export const isDraggingOver = style({
  backgroundColor: 'green',
});
