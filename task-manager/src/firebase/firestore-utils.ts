import {getFirestore,
        collection, 
        getDocs, 
        setDoc,
        doc, 
        getDoc, 
        deleteDoc, 
        addDoc, 
        updateDoc,
        query,
        where, 
        QuerySnapshot} from 'firebase/firestore';
import app from '../firebase-config';
import { getAuth } from 'firebase/auth';
import { Board } from '../pages/DashboardPage';

export const db = getFirestore(app);
export const auth = getAuth();
const user = auth.currentUser;
type TaskStatus = 'To Do' | 'In Progress' | 'Done';


export const getUserId = async (): Promise<string> => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    return currentUser.uid;
  } else {
    return "";
  }
};
export const getUserName = async (id: string): Promise<string | null> => {
  try{
    const userDocRef = doc(db, 'users', id);
    const userDocSnap = await getDoc(userDocRef);
    if(userDocSnap.exists()){
      return String(userDocSnap.data()) || null;
    }
    return null;
  }catch(err){
    console.error(err);
    return null;
  }
};
//Managing Boards
export const fetchUserBoards = async (userId: string): Promise<any[]> => {  
  const boardsRef = collection(db, 'boards');
  const ownerRef = doc(db, 'users', userId);
  const ownedBoardsQuery = query(boardsRef, where('ownerRef', '==', ownerRef));
  const ownedSnapshot = await getDocs(ownedBoardsQuery);
  const sharedBoardQuery = query(boardsRef, where('sharedWith', 'array-contains', ownerRef));
  const sharedSnapshot = await getDocs(sharedBoardQuery);
  // console.log('ownerRef:', ownerRef.path);

  const boardsMap = new Map<string, any>();

  ownedSnapshot.docs.forEach(docSnap => {
    boardsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
  });
  sharedSnapshot.docs.forEach(docSnap => {
    if (!boardsMap.has(docSnap.id)){
      boardsMap.set(docSnap.id, {id: docSnap.id, ...docSnap.data() });
    }
  })
  const boards = Array.from(boardsMap.values());
  if(boards.length === 0){
    console.log("!0 board")
    const newBoard = await createBoard({
      userId: userId,
      title: 'Welcome Board',
      description: 'This is a default board.',
    })
    boards.push(newBoard);
  }
  return boards;
};

export const createBoard = async ({
  userId,
  title,
  description,
}: {
  userId: string;
  title: string;
  description: string;
}) => {
  const boardsRef = collection(db, 'boards');
  const ownerRef = doc(db, 'users', userId);

  const newBoard = {
    title,
    description,
    createdAt: new Date(),
    ownerRef,
    accessCode: '',
    sharedWith: [],
  };

  const docRef = await addDoc(boardsRef, newBoard);
  return { id: docRef.id, ...newBoard };
};

export const fetchBoardById = async (id: string) => {
    const docRef = doc(db, 'boards', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ?{ id: docSnap.id, ...docSnap.data() } : null;
};

export const deleteBoardById = async (boardId: string, userId: string) => {
  const boardRef = doc(db, 'boards', boardId);
  const boardSnap = await getDoc(boardRef);

  if (!boardSnap.exists()) {
    throw new Error('Board does not exist.');
  }

  const boardData = boardSnap.data();
  const ownerRef = boardData.ownerRef;

  if (!ownerRef || ownerRef.id !== userId) {
    throw new Error('You are not the owner of this board.');
  }

  await deleteDoc(boardRef);
};

export const deleteAllBoards = async () => {
    const querySnapshot = await getDocs(collection(db, 'boards'));
    
    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'boards', docSnap.id))
    );
    await Promise.all(deletePromises);
};

export const updateBoard = async (
  id: string,
  update: Partial<{title: string, description: string, accessCode: string}>,
) => {
  const boardRef = doc(db, 'boards', id);
  await updateDoc(boardRef, update);
}
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
      assignedTo: data.assignedTo?.id || null,
      createdAt: data.createdAt?.toDate?.() || null,
    };
  });
};

export const addTask = async (
  boardId: string,
  title: string,
  description: string,
  status: TaskStatus = 'To Do',
  assignedToUserId?: string
) => {
  const taskData: any = {
    title,
    description,
    status,
    createdAt: new Date(),
  };
  if(assignedToUserId){
    taskData.assignedTo = doc(db, 'users', assignedToUserId);
  }
  const taskRef = await addDoc(collection(db, 'boards', boardId, 'tasks'), taskData);
  return{
    id: taskRef.id,
    ...taskData,
    assignedTo: assignedToUserId || null,
  };
}


export const deleteTask = async (boardId: string, taskId: string) => {
    await deleteDoc(doc(db, 'boards', boardId, 'tasks', taskId));
};

export const updateTask = async (
  boardId: string,
  taskId: string,
  updates: Partial<{ title: string; description: string; status: TaskStatus; assignedTo: any; }>
) => {
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
  await updateDoc(taskRef, updates);
};

export const fetchBoardByAccessCode = async (accessCode: string ): Promise<Board | null> => {
  const boardsRef = collection(db, 'boards');
  const q = query(boardsRef, where('accessCode', '==', accessCode)); 
  const querySnapshot = await getDocs(q);

  if(querySnapshot.empty) return null;

  const docSnap = querySnapshot.docs[0];
  return {id: docSnap.id, ...docSnap.data()} as Board;
}
export const generateUniqueAccessCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const generate = () =>
    Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  let code = generate();
  let exists = true;

  while (exists) {
    const q = query(collection(db, 'boards'), where('accessCode', '==', code));
    const snapshot = await getDocs(q);
    exists = !snapshot.empty;
    if (exists) code = generate();
  }

  return code;
};

export const joinBoard = async (accessCode: string, userId: string): Promise<any | null> => {
  const userRef = doc(db, 'users', userId);
  const board = await fetchBoardByAccessCode(accessCode);

  if(!board) return null;
  if (board.ownerRef.id === userId) {
    console.warn("You already own this board.");
    return null;
  }
  const currentSharedWith: any[] = board.sharedWith || [];
  const alreadyShared = currentSharedWith.some((ref: any) => ref.id === userId);
  if(alreadyShared){
    console.warn("You already own this board.");
    return null;
  }

  const boardRef = doc(db, 'boards', board.id);
  await updateDoc(boardRef, {
    sharedWith: [...currentSharedWith, userRef],
  });

  return { ...board };
}