import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../pages/BoardPage';
import { MoreVertical } from 'lucide-react';

type DraggableCardProps = {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
};

const DraggableCard = ({ task, onDelete, onEdit }: DraggableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const [menuOpen, setMenuOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white dark:bg-gray-700 rounded p-3 mb-3 shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Delete button outside drag listeners */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((open) => !open);
        }}
        className="absolute top-2 right-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
      >
        <MoreVertical size={18}></MoreVertical>
      </button>
      {menuOpen && (
        <div
          className="absolute top-8 right-2 w-28 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-md z-50"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              onEdit(task);
            }}
            className="block w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              onDelete(task.id);
            }}
            className="block w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
          >
            Delete
          </button>
        </div>
      )}
      {/* Drag area*/}
      <div {...attributes} {...listeners} className="cursor-grab select-none">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          {task.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-300">{task.description}</p>
      </div>
    </div>
  );
};


export default DraggableCard;
