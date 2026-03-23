const BASE = '/albums';

export async function fetchAlbums() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

export async function createAlbum(album) {
  const res = await fetch(BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(album),
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

export async function updateAlbum(album) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(album),
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

export async function deleteAlbum(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(res.status);
}
