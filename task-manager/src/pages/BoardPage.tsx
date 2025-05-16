import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../firebase-config';
import { fetchTasks, addTask, deleteTask, updateTask } from '../firebase/firestore-utils';
import { DndContext, DragEndEvent, useSensor, useSensors, closestCenter, PointerSensor } from '@dnd-kit/core';
import DroppableColumn from '../components/DroppableColumn';
import { SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';

const db = getFirestore(app);

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
};

const BoardPage = () => {
  const { id: boardId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [board, setBoard] = useState<{ title: string } | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<'To Do' | 'In Progress' | 'Done'>('To Do');
  const [loading, setLoading] = useState(true);
  //Add Screen
  const [showModal, setShowModal] = useState(false);
  //Dark Mode
  const [isDarkMode, setDarkMode] = useState<boolean>(false);
  //Drag&Drop
  const sensors = useSensors(useSensor(PointerSensor));
  //Edit Screen
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }else {
        document.documentElement.classList.remove('dark');
      }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchBoardData = async () => {
      if (!boardId) return;
      const taskData = await fetchTasks(boardId);

      if (taskData.length === 0) {
        const defaultTask = await addTask(
          boardId,
          'Welcome Task',
          'Edit or delete this task to get started!',
          'To Do'
        );
        setTasks([defaultTask]);
      } else {
        setTasks(taskData);
      }

      // Optional: Fetch board title
      const docSnap = await getDoc(doc(db, 'boards', boardId));
      if (docSnap.exists()) {
        setBoard(docSnap.data() as { title: string });
      }

      setLoading(false);
    };

    fetchBoardData();
  }, [boardId]);

  const handleAddTask = async () => {
    if (!boardId || !newTitle.trim()) return;

    const newTask = await addTask(boardId, newTitle, newDescription, newStatus);
    setTasks(prev => [...prev, newTask]);
    setNewTitle('');
    setNewDescription('');
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!boardId) return;
    await deleteTask(boardId, taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleUpdateTask = async (task: Task) => {
    if (!boardId) return;
    await updateTask(boardId, task.id, {
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? {...t, ...task}:t))
    );
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const draggedTaskId = active.id;
    const newStatus = over.data?.current?.columnId as TaskStatus;
    if(!newStatus) return;
    console.log("Dragged", active.id, "to column", over.data?.current?.columnId);

    setTasks(prev =>
      prev.map(task =>
        task.id === draggedTaskId ? { ...task, status: newStatus } : task
      )
    );
    if (boardId) {
      await updateTask(boardId, String(draggedTaskId), {status: newStatus});
    }
  };

  const handleEditSubmit = async () => {
    if (!editingTask) return;
    await handleUpdateTask({
      ...editingTask,
      title: newTitle,
      description: newDescription,
      status: newStatus,
    });
    setShowEditModal(false);
    setEditingTask(null);
    setNewTitle('');
    setNewDescription('');
    setNewStatus('To Do');  
  };

  const handleEditClick = (task: Task) => {
  setEditingTask(task); // set the task to be edited
  setNewTitle(task.title); // populate form fields
  setNewDescription(task.description);
  setNewStatus(task.status);
  setShowEditModal(true); // show the modal
};


  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-4 border-b-green-500 animate-spin-reverse"></div>
      </div>
      <p className="text-xl font-semibold animate-pulse">Loading your workspace...</p>
    </div>
  );

  const columns = ['To Do', 'In Progress', 'Done'];
  const tasksByStatus = columns.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {} as Record<string, Task[]>);
  const toggleTheme = () => {
    setDarkMode(!isDarkMode);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-blue-50 dark:bg-gray-900 text-black dark:text-white p-8 relative">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded bg-gray-300 dark:bg-gray-600 text-black dark:text-white absolute top-4 right-4"
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Board Title */}
        <h2 className="text-2xl font-bold mb-6">
          <Link to="/dashboard" className='text-black dark:text-white hover:underline'>
            Board
          </Link>
          :{board?.title || 'Untitled'}
        </h2>

        {/* Task List */}
        <div className="flex space-x-6">
          {columns.map((status) => (
            <SortableContext
              key={status}
              items={tasksByStatus[status].map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn
                id={status}
                title={status}
                tasks={tasksByStatus[status]}
                handleDeleteTask={handleDeleteTask}
                handleUpdateTask={handleEditClick}
                onAddTaskClick={() => {
                  setNewStatus(status as TaskStatus);
                  setShowModal(true);
                }}
              />
            </SortableContext>
          ))}
        </div>
        {/* Modal for Adding a New Task */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-3 text-gray-500 dark:text-gray-200 text-xl hover:text-gray-800"
              >
                &times;
              </button>

              <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Add a New Task</h2>

              <input
                type="text"
                placeholder="Task Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <textarea
                placeholder="Task Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full h-40 mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'To Do' | 'In Progress' | 'Done')}
                className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              <button
                onClick={async () => {
                  await handleAddTask();
                  setShowModal(false);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
              >
                Create Task
              </button>
            </div>
          </div>
        )}
        {showEditModal && editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-2 right-3 text-gray-500 dark:text-gray-200 text-xl hover:text-gray-800"
              >
                &times;
              </button>

              <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Edit Task</h2>

              <input
                type="text"
                placeholder="Task Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:text-white"
              />

              <textarea
                placeholder="Task Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full h-40 mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
              />

              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'To Do' | 'In Progress' | 'Done')}
                className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>

              <button
                onClick={handleEditSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </DndContext>

  );
};

export default BoardPage;