import { db } from "./firebase";
import { ref, get, set, push, update, remove, onValue, off } from "firebase/database";

const PATH = "plans";

export const getAll = async (): Promise<any[]> => {
  const snapshot = await get(ref(db, PATH));
  if (!snapshot.exists()) return [];
  const val = snapshot.val();
  if (Array.isArray(val)) return val.filter(Boolean);
  return Object.entries(val).map(([id, data]: [string, any]) => ({ id, ...data }));
};

export const getById = async (id: string): Promise<any | null> => {
  const snapshot = await get(ref(db, `${PATH}/${id}`));
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
};

export const create = async (data: any): Promise<string> => {
  const newRef = push(ref(db, PATH));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
  return id;
};

export const updateItem = async (id: string, data: any): Promise<void> => {
  await update(ref(db, `${PATH}/${id}`), data);
};

const deleteItem = async (id: string): Promise<void> => {
  await remove(ref(db, `${PATH}/${id}`));
};

export const subscribe = (callback: (data: any[]) => void): (() => void) => {
  const dbRef = ref(db, PATH);
  const listener = onValue(dbRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const val = snapshot.val();
    let list: any[] = [];
    if (Array.isArray(val)) {
      list = val.filter(Boolean);
    } else {
      list = Object.entries(val).map(([id, data]: [string, any]) => ({ id, ...data }));
    }
    callback(list);
  });
  return () => off(dbRef, "value", listener);
};

export { deleteItem as delete, updateItem as update };
