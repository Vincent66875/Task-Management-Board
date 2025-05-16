import { useDroppable } from '@dnd-kit/core';
import DraggableCard from './DraggableCard';
import { Task } from '../pages/BoardPage';
import { TaskStatus } from '../pages/BoardPage';

const DroppableColumn = ({
  id,
  title,
  tasks,
  handleDeleteTask,
  handleUpdateTask,
  onAddTaskClick,
}: {
  id: string;
  title: string;
  tasks: Task[];
  handleDeleteTask: (taskId: string) => void;
  handleUpdateTask: (task: Task) => void;
  onAddTaskClick: () => void;
}) => {
  const { setNodeRef } = useDroppable({
    id,
    data: { columnId: id },
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 w-80 flex-shrink-0 shadow-md"
    >
      <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
        {title}
      </h3>
      {tasks.map((task) => (
        <DraggableCard key={task.id} task={task} onDelete={handleDeleteTask} onEdit={handleUpdateTask}/>
      ))}
      <button onClick={onAddTaskClick} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        + Add a card
      </button>
    </div>
  );
};

export default DroppableColumn;
