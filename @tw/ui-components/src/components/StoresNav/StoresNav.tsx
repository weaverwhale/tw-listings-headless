import { Flex, Image } from '@mantine/core';
import { Tooltip } from '../Tooltip/Tooltip';
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import * as classes from './StoresNav.css';
import { MutableRefObject } from 'react';

export type StoresNavProps = {
  shops: {
    shopId: string;
    shopName: string;
    shopImage: string;
    [key: string]: any;
  }[];
  onStoreClicked: (shopId: string) => void;
  onDragEnd: OnDragEndResponder;
  activeShopImageRef: MutableRefObject<HTMLImageElement>;
};

export const StoresNav: React.FC<StoresNavProps> = ({
  activeShopImageRef,
  shops,
  onDragEnd,
  onStoreClicked,
}) => {
  if (!shops.length) return null;

  return (
    <Flex
      direction="column"
      justify="flex-start"
      align="center"
      classNames={{ root: classes.wrapper }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable direction="vertical" droppableId="stores-nav-drop-zone">
          {(provided) => (
            <div className={classes.dropZone} ref={provided.innerRef} {...provided.droppableProps}>
              {shops.map(({ shopId, shopName, shopImage }, index) => (
                <Draggable
                  key={`store-icon-${shopId}`}
                  draggableId={`store-icon-${shopId}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Tooltip label={shopName}>
                        <Image
                          radius="sm"
                          w={30}
                          h={30}
                          src={shopImage}
                          onClick={() => onStoreClicked(shopId)}
                          classNames={index !== 0 ? undefined : { root: classes.shopImage }}
                          {...(index === 0 && { ref: activeShopImageRef })}
                        />
                      </Tooltip>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Flex>
  );
};
