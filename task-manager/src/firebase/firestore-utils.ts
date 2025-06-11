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

export const db = getFirestore(app);
export const auth = getAuth();
const user = auth.currentUser;
type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export const getUserId = async (): Promise<string> => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    return currentUser.uid;
  } else {
    //console.log("Error: user is not logged in");
    return "";
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

export const fetchBoardByAccessCode = async (accessCode: string ) => {
  const boardsRef = collection(db, 'boards');
  const q = query(boardsRef, where('accessCode', '==', accessCode)); 
  const querySnapshot = await getDocs(q);

  if(querySnapshot.empty) return null;

  const docSnap = querySnapshot.docs[0];
  return {id: docSnap.id, ...docSnap.data()};
}
// export const updateUser = async (userId: string, update: Partial<{email: string, password: string, name: string}>) => {
//   const userRef = doc(db, 'users', userId);
//   await updateDoc(userRef, update)
// };