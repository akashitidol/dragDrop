// App.tsx

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop, useDrag, DragPreviewImage, DropTargetMonitor } from 'react-dnd';
import './DraggableColumn.css'; // Import the CSS file


interface DraggableColumnProps {
  id: string;
  title: string;
  items: string[];
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  columnIndex: number;
}

interface DraggableItemProps {
  id: string;
  index: number;
  text: string;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

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
      {text}
    </div>
  );
};

const DraggableColumn: React.FC<DraggableColumnProps> = ({ id, title, items, moveRow, moveColumn, columnIndex }) => {
  const [, drop] = useDrop({
    accept: 'COLUMN',
    hover: (item: { index: number }, monitor: DropTargetMonitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = columnIndex;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [, drag] = useDrag({
    type: 'COLUMN',
    item: { index: columnIndex },
  });

  return (
    <div className="draggable-column" ref={(node) => drag(drop(node))}>
      <h3 className="column-title">{title}</h3>
      {items.map((item, index) => (
        <DraggableItem key={item} id={item} index={index} text={item} moveRow={moveRow} />
      ))}
    </div>
  );
};

interface Columns {
  [key: string]: string[];
}

const App: React.FC = () => {
  const initialColumns: Columns = {
    column1: ['Row 1', 'Row 2', 'Row 3'],
    column2: ['Item A', 'Item B', 'Item C'],
  };

  const [columns, setColumns] = React.useState<Columns>(initialColumns);

  const moveRow = (columnId: string, dragIndex: number, hoverIndex: number) => {
    const updatedColumns = { ...columns };
    const [removed] = updatedColumns[columnId].splice(dragIndex, 1);
    updatedColumns[columnId].splice(hoverIndex, 0, removed);
    setColumns(updatedColumns);
  };

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const columnOrder = Object.keys(columns);
    const updatedColumns = { ...columns };
    const [draggedColumn] = columnOrder.splice(dragIndex, 1);
    columnOrder.splice(hoverIndex, 0, draggedColumn);

    const newColumns: Columns = {};
    columnOrder.forEach((columnId) => {
      newColumns[columnId] = updatedColumns[columnId];
    });

    setColumns(newColumns);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex' }}>
        {Object.keys(columns).map((columnId, index) => (
          <DraggableColumn
            key={columnId}
            id={columnId}
            title={columnId}
            items={columns[columnId]}
            moveRow={(dragIndex, hoverIndex) => moveRow(columnId, dragIndex, hoverIndex)}
            moveColumn={(dragIndex, hoverIndex) => moveColumn(dragIndex, hoverIndex)}
            columnIndex={index}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default App;