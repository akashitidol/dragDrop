// DraggableItem.tsx
import React from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';

interface DraggableItemProps {
  id: string;
  index: number;
  text: string;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const SubComponent: React.FC<{ text: string }> = ({ text }) => (
  <div className="sub-component">{text}</div>
);

const DraggableItem: React.FC<DraggableItemProps> = ({ id, index, text, moveRow }) => {
  const [, drag] = useDrag({
    type: 'ROW',
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: 'ROW',
    hover: (item: { id: string; index: number }, monitor: DropTargetMonitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <div className="draggable-item" ref={(node) => drag(drop(node))}>
      <div>{text}</div>
      <SubComponent text="SubComponent1" />
      <SubComponent text="SubComponent2" />
    </div>
  );
};

export default DraggableItem;
