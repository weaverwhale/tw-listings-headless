import { useCallback, useMemo } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { HierarchicalListItem } from '../../classes/HierarchicalList';
import { Text } from '../Text/Text';
import { NavLink } from '@mantine/core';
import { useHierarchicalList } from '../..';

type DraggableAccordionProps = {
  data: HierarchicalListItem<string>[];
  /** Tells component max depth of recursion.  Starts from 0, and 0 would mean no nesting */
  maxDepth: number;
  emptyText?: React.ReactNode;
};

export function DraggableAccordion({ data, maxDepth }: DraggableAccordionProps) {
  const [state, handler] = useHierarchicalList(data);

  const renderListItem = useCallback(
    (item: HierarchicalListItem<string>, index: number) => (
      <Draggable key={item.id} draggableId={item.id} index={index}>
        {(provided, snapshot) => {
          const itemDepth = item.depth || 0;

          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{
                ...provided.draggableProps.style,
                cursor: snapshot.isDragging ? 'grabbing' : 'pointer',
              }}
            >
              <Droppable direction="vertical" droppableId={item.id} type={`depth-${itemDepth}`}>
                {(provided) => {
                  return (
                    <>
                      <NavLink
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        label={item.value}
                        children={
                          itemDepth >= maxDepth ? undefined : item.children.length > 0 ? (
                            item.children.map((nestedItem, nestedIndex) =>
                              renderListItem(nestedItem, nestedIndex)
                            )
                          ) : (
                            <Text fz="sm">No items added</Text>
                          )
                        }
                      />
                      {provided.placeholder}
                    </>
                  );
                }}
              </Droppable>
            </div>
          );
        }}
      </Draggable>
    ),
    [maxDepth]
  );

  const items = useMemo(
    () => state.map((item, index) => renderListItem(item, index)),
    [state, renderListItem]
  );

  return (
    <DragDropContext
      onDragEnd={({ destination, source, type }) => {
        // if depth is greater than 1, we need to make sure children can't be accepted
        const depth = +(type.split('-')[1] || 0);
        if (!destination || depth > maxDepth) return;

        handler.reorder({
          from: {
            key: source.droppableId,
            position: source.index,
          },
          to: {
            key: destination.droppableId,
            position: destination.index,
          },
        });
      }}
    >
      <Droppable droppableId="rootDroppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {items}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
