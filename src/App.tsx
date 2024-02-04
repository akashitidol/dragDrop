// App.tsx

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop, useDrag, DragPreviewImage, DropTargetMonitor } from 'react-dnd';
import './DraggableColumn.css'; // Import the CSS file


interface DraggableColumnProps {
  id: string;
  title: string;
  items: (string | { [key: string]: string[] })[];
  moveRow: (columnId: string, dragIndex: number, hoverIndex: number) => void;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  columnIndex: number;
}

interface DraggableItemProps {
  id: string;
  index: number;
  text: string;
  moveRow: (columnId: string, dragIndex: number, hoverIndex: number) => void;
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

      moveRow(id, dragIndex, hoverIndex);
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
      <div>
        {items.map((item, index) => (
          typeof item == "object" ?
            Object.keys(item).map((columnId, index) => (
              <DraggableColumn
                key={columnId}
                id={columnId}
                title={columnId}
                items={item[columnId]}
                //moveRow={(dragIndex, hoverIndex) => moveRow(columnId, dragIndex, hoverIndex)}
                moveRow={(dragValue, dragIndex,hoverIndex) => moveRow(columnId, dragIndex, hoverIndex)}
                //moveRow={(dragIndex, hoverIndex) => { }}
                moveColumn={(dragIndex, hoverIndex) => moveColumn(dragIndex, hoverIndex)}
                columnIndex={index}
              />
            ))
            :
            <DraggableItem key={item.toString()} id={item.toString()} index={index} text={item.toString()} moveRow={moveRow} />
        ))}
      </div>
    </div>
  );
};

interface Columns {
  [key: string]: (string | { [key: string]: string[] })[];
}

const App: React.FC = () => {
  const initialColumns: Columns = {
    column1: [
      {column11: ['Row 11','Row 12']},
      {column12: ['Row 11','Row 12']},
      {column13: ['Row 3']}
    ],
    column2: [
      'Item A',
      'Item B',
      'Item C',
      {column22: ['Row 21','Row 22']}
    ],
    // column3: [
    //   'Item A',
    //   'Item B'
    // ],

  };

  const [columns, setColumns] = React.useState<Columns>(initialColumns);

  const moveRowMain = (columnId: string, dragIndex: number, hoverIndex: number) => {
    console.log(columnId,dragIndex,hoverIndex)
    const updatedColumns = { ...columns };
    const [removed] = updatedColumns[columnId].splice(dragIndex, 1);
    updatedColumns[columnId].splice(hoverIndex, 0, removed);
    setColumns(updatedColumns);
  };

  const moveColumnMain = (dragIndex: number, hoverIndex: number) => {
    console.log(dragIndex,hoverIndex)
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
            moveRow={(dragValue, dragIndex,hoverIndex) => moveRowMain(columnId, dragIndex, hoverIndex)}
            moveColumn={(dragIndex, hoverIndex) => moveColumnMain(dragIndex, hoverIndex)}
            columnIndex={index}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default App;