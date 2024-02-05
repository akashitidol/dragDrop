// App.tsx

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop, useDrag, DragPreviewImage, DropTargetMonitor } from 'react-dnd';
import './DraggableColumn.css'; // Import the CSS file

interface Columns {
  [key: string]: (string | { [key: string]: string[] })[];
}
interface DraggableColumnProps {
  columns:Columns
  id: string;
  title: string;
  items: (string | { [key: string]: string[] })[];
  moveRow: (columnId: string, dragIndex: number, hoverIndex: number) => void;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  columnIndex: number;
  setColumns: React.Dispatch<React.SetStateAction<Columns>>
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

const DraggableColumn: React.FC<DraggableColumnProps> = ({ columns,id, title, items, moveRow, moveColumn, columnIndex, setColumns}) => {
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
                columns={columns}
                key={columnId}
                id={columnId}
                title={columnId}
                items={item[columnId]}
                moveRow={(dragValue, dragIndex,hoverIndex) => moveRowTemp(columnId, dragIndex, hoverIndex,columns,setColumns)}
                moveColumn={(dragIndex, hoverIndex) => moveColumnTemp(columns,dragIndex, hoverIndex,setColumns)}
                columnIndex={index}
                setColumns={setColumns}
              />
            ))
            :
            <DraggableItem key={item.toString()} id={item.toString()} index={index} text={item.toString()} moveRow={moveRow} />
        ))}
      </div>
    </div>
  );
};



const moveColumnTemp = (
  columns: Columns,
  dragIndex: number,
  hoverIndex: number,
  setColumns: React.Dispatch<React.SetStateAction<Columns>>
) => {
  console.log("hellow");
  const columnOrder = Object.keys(columns);
  const updatedColumns: Columns = { ...columns };

  const [draggedColumn] = columnOrder.splice(dragIndex, 1);
  columnOrder.splice(hoverIndex, 0, draggedColumn);

  const newColumns: Columns = {};
  columnOrder.forEach((columnId) => {
    newColumns[columnId] = updatedColumns[columnId];
  });

  setColumns(newColumns);
};

const moveRowTemp = (
  columnId: string,
  dragIndex: number,
  hoverIndex: number,
  columns: Columns,
  setColumns: React.Dispatch<React.SetStateAction<Columns>>
) => {
  const updatedColumns: Columns = { ...columns };
  let parentKey:any = getParentByKey(columns,columnId)==undefined?"":getParentByKey(columns,columnId);
  if(parentKey !==""){
    var tempArray = getElementByKey(columns, parentKey,columnId);
    if(tempArray){
      const [removed] = tempArray.splice(dragIndex, 1);
      tempArray.splice(hoverIndex, 0, removed);
      setColumns(updateElementByKey(updatedColumns,parentKey,columnId,tempArray));
    }
  }else{
    if(updatedColumns[columnId] !== undefined){
      const [removed] = updatedColumns[columnId].splice(dragIndex, 1);
      updatedColumns[columnId].splice(hoverIndex, 0, removed);
    
      setColumns(updatedColumns);
    }
  }
};

const getParentByKey = (
  columns: Columns,
  itemKey: string
): string | undefined => {
  for (const [columnKey, column] of Object.entries(columns)) {
    const parentItem = column.find((element) => {
      if (typeof element === 'object') {
        return itemKey in element;
      }
      return false;
    });

    if (parentItem) {
      return columnKey;
    }
  }

  return '';
};
const getElementByKey = (
  columns: Columns,
  columnKey: string,
  itemKey: string
): string[] | undefined => {
  const column = columns[columnKey];

  if (column) {
    const item = column.find((element) => {
      if (typeof element === 'object') {
        return itemKey in element;
      }
      return false;
    });

    if (item && typeof item === 'object') {
      return item[itemKey];
    }
  }

  return undefined;
};

const updateElementByKey = (
  columns: Columns,
  columnKey: string,
  itemKey: string,
  updatedValue: string[]
): Columns => {
  const updatedColumns = { ...columns };
  const column = updatedColumns[columnKey];

  if (column) {
    const updatedColumn = column.map((element) => {
      if (typeof element === 'object' && itemKey in element) {
        return { [itemKey]: updatedValue };
      }
      return element;
    });

    updatedColumns[columnKey] = updatedColumn;
  }

  return updatedColumns;
};

const App: React.FC = () => {
  const initialColumns: Columns = {
    column1: [
      {column11: ['child 11','child 12','child 13',]},
      {column12: ['Row 11','Row 12','Row 13']},
    ],
    column2: ['Item A','Item B','Item C',]
  };

  const [columns, setColumns] = React.useState<Columns>(initialColumns);

  // const moveRowMain = (columnId: string, dragIndex: number, hoverIndex: number) => {
  //   console.log("ROW",columnId,dragIndex,hoverIndex)
  //   const updatedColumns = { ...columns };
  //   const [removed] = updatedColumns[columnId].splice(dragIndex, 1);
  //   updatedColumns[columnId].splice(hoverIndex, 0, removed);
  //   setColumns(updatedColumns);
  // };

  // const moveColumnMain = (dragIndex: number, hoverIndex: number) => {
  //   console.log("Column",dragIndex,hoverIndex)
  //   const columnOrder = Object.keys(columns);
  //   const updatedColumns = { ...columns };
  //   const [draggedColumn] = columnOrder.splice(dragIndex, 1);
  //   columnOrder.splice(hoverIndex, 0, draggedColumn);
  //   const newColumns: Columns = {};
  //   columnOrder.forEach((columnId) => {
  //     newColumns[columnId] = updatedColumns[columnId];
  //   });

  //   setColumns(newColumns);
  // };
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex' }}>
        {Object.keys(columns).map((columnId, index) => (
          <DraggableColumn
            columns = {columns}
            key={columnId}
            id={columnId}
            title={columnId}
            items={columns[columnId]}
            moveRow={(dragValue, dragIndex,hoverIndex) => moveRowTemp(columnId, dragIndex, hoverIndex,columns,setColumns)}
            moveColumn={(dragIndex, hoverIndex) => moveColumnTemp(columns,dragIndex, hoverIndex,setColumns)}
            columnIndex={index}
            setColumns={setColumns}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default App;