import { db } from "./firebase";
import { ref, get, set, push, update, remove, onValue, off } from "firebase/database";

const PATH = "settings";

export const getAll = async (): Promise<any> => {
  const snapshot = await get(ref(db, PATH));
  return snapshot.exists() ? snapshot.val() : {};
};

export const getById = async (id: string): Promise<any | null> => {
  const snapshot = await get(ref(db, `${PATH}/${id}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const create = async (data: any): Promise<string> => {
  await set(ref(db, PATH), data);
  return PATH;
};

export const updateItem = async (id: string, data: any): Promise<void> => {
  if (id) {
    await set(ref(db, `${PATH}/${id}`), data);
  } else {
    await update(ref(db, PATH), data);
  }
};

const deleteItem = async (id: string): Promise<void> => {
  await remove(ref(db, `${PATH}/${id}`));
};

export const subscribe = (callback: (data: any) => void): (() => void) => {
  const dbRef = ref(db, PATH);
  const listener = onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  });
  return () => off(dbRef, "value", listener);
};

export { deleteItem as delete, updateItem as update };
