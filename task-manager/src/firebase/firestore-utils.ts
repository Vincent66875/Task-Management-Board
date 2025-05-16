import {getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import app from '../firebase-config';

const db = getFirestore(app);
type TaskStatus = 'To Do' | 'In Progress' | 'Done';

//Managing Boards
export const fetchAllBoards = async () => {
    const querySnapshot = await getDocs(collection(db, 'boards'));
  
    const boards = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
      };
    });
    if (boards.length === 0) {
        console.log("!0 board")
        boards.push({
          id: 'default',
          title: 'Welcome Board',
          description: 'This is a default board.',
        });
    }
  
    return boards;
};

export const fetchBoardById = async (id: string) => {
    const docRef = doc(db, 'boards', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ?{ id: docSnap.id, ...docSnap.data() } : null;
};

export const deleteBoardById = async (id:string) => {
    const docRef = doc(db, 'boards', id);
    await deleteDoc(docRef);
}

export const deleteAllBoards = async () => {
    const querySnapshot = await getDocs(collection(db, 'boards'));
    
    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'boards', docSnap.id))
    );
    await Promise.all(deletePromises);
};

export const createBoard = async (title: string, description: string) => {
    const boardsRef = collection(db, 'boards');
    const newBoard = {
      title,
      description,
      createdAt: new Date(),
    };
    const docRef = await addDoc(boardsRef, newBoard);
    return { id: docRef.id, ...newBoard };
};

//Managin Tasks
export const fetchTasks = async (boardId: string) => {
  const querySnapshot = await getDocs(collection(db, 'boards', boardId, 'tasks'));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
    };
  });
};

export const addTask = async (
  boardId: string,
  title: string,
  description: string,
  status: TaskStatus = 'To Do'
) => {
  const taskRef = await addDoc(collection(db, 'boards', boardId, 'tasks'), {
    title,
    description,
    status,
  });

  return {
    id: taskRef.id,
    title,
    description,
    status,
  };
};


export const deleteTask = async (boardId: string, taskId: string) => {
    await deleteDoc(doc(db, 'boards', boardId, 'tasks', taskId));
};

export const updateTask = async (
  boardId: string,
  taskId: string,
  updates: Partial<{ title: string; description: string; status: TaskStatus }>
) => {
  const db = getFirestore(app);
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
  await updateDoc(taskRef, updates);
};