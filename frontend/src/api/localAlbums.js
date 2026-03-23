import seedData from '../data/seedAlbums.json';

const STORAGE_KEY = 'spring-music-albums';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function persist(albums) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
}

function getAll() {
  const stored = load();
  if (stored) return stored;
  // First run: seed from bundled JSON
  persist(seedData);
  return [...seedData];
}

// Simulate async behaviour to match the remote API interface
export async function fetchAlbums() {
  return getAll();
}

export async function createAlbum(album) {
  const albums = getAll();
  const created = { ...album, id: generateId() };
  albums.push(created);
  persist(albums);
  return created;
}

export async function updateAlbum(album) {
  const albums = getAll();
  const idx = albums.findIndex(a => a.id === album.id);
  if (idx === -1) throw new Error('Album not found: ' + album.id);
  albums[idx] = { ...albums[idx], ...album };
  persist(albums);
  return albums[idx];
}

export async function deleteAlbum(id) {
  const albums = getAll();
  const idx = albums.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Album not found: ' + id);
  albums.splice(idx, 1);
  persist(albums);
}
