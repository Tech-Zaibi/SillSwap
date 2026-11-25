import { getFile } from './fileStore.js';

// Used by the UI to download or preview a submitted file.
export async function getFileBlob(id) {
  return (await getFile(id)) || null;
}