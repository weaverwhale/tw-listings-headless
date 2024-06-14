import { HierarchicalListItem } from '../../classes/HierarchicalList';

export const HL: HierarchicalListItem<number>[] = [
  {
    id: '1',
    value: 1,
    children: [],
  },
  {
    id: '2',
    value: 2,
    children: [
      {
        id: '4',
        value: 4,
        children: [],
      },
      {
        id: '5',
        value: 5,
        children: [
          {
            id: '6',
            value: 6,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    value: 3,
    children: [],
  },
];
