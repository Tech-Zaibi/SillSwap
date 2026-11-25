import { AppError } from '../domain/errors.js';

// Saves file contents in IndexedDB (a bigger browser database than localStorage).
// Only the file's name/size/type is saved with the task. The real bytes live here.
const DB_NAME = 'skillswap-files';
const STORE = 'files';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new AppError('File storage is not available in this browser.'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new AppError('File storage is not available in this browser.'));
  });
}

// Runs one request and waits for it to finish.
async function run(mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(request?.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(new AppError('Could not save the files. Your browser storage may be full.')); };
  });
}

export const saveFile = (id, blob) => run('readwrite', (store) => store.put(blob, id));
export const getFile = (id) => run('readonly', (store) => store.get(id));
export const deleteFiles = (ids) => (ids.length ? run('readwrite', (store) => ids.forEach((id) => store.delete(id))) : Promise.resolve());