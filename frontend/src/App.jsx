import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AlbumGrid from './components/AlbumGrid';
import AlbumList from './components/AlbumList';
import AlbumModal from './components/AlbumModal';
import StatusAlert from './components/StatusAlert';
import { fetchAlbums, createAlbum, updateAlbum, deleteAlbum } from './api/albums';

const SORT_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'artist', label: 'Artist' },
  { key: 'releaseYear', label: 'Year' },
  { key: 'genre', label: 'Genre' },
];

export default function App() {
  const [albums, setAlbums] = useState([]);
  const [view, setView] = useState('grid');
  const [sortField, setSortField] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [status, setStatus] = useState(null);
  const [modal, setModal] = useState({ open: false, action: 'add', album: {} });

  const loadAlbums = useCallback(async () => {
    try {
      setAlbums(await fetchAlbums());
    } catch (e) {
      setStatus({ isError: true, message: 'Error loading albums: ' + e.message });
    }
  }, []);

  useEffect(() => { loadAlbums(); }, [loadAlbums]);

  const sortedAlbums = [...albums].sort((a, b) => {
    const va = String(a[sortField] ?? '').toLowerCase();
    const vb = String(b[sortField] ?? '').toLowerCase();
    return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortAsc(prev => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSaveAlbum = async (album) => {
    try {
      if (modal.action === 'add') {
        await createAlbum(album);
      } else {
        await updateAlbum(album);
      }
      setStatus({ isError: false, message: 'Album saved' });
      await loadAlbums();
    } catch (e) {
      setStatus({ isError: true, message: 'Error saving album: ' + e.message });
    }
    setModal(m => ({ ...m, open: false }));
  };

  const handleDeleteAlbum = async (album) => {
    try {
      await deleteAlbum(album.id);
      setStatus({ isError: false, message: 'Album deleted' });
      await loadAlbums();
    } catch (e) {
      setStatus({ isError: true, message: 'Error deleting album: ' + e.message });
    }
  };

  const handleInlineSave = async (album, field, value) => {
    try {
      await updateAlbum({ ...album, [field]: value });
      setStatus({ isError: false, message: 'Album saved' });
      await loadAlbums();
    } catch (e) {
      setStatus({ isError: true, message: 'Error saving album: ' + e.message });
    }
  };

  const openAddModal = () => setModal({ open: true, action: 'add', album: {} });
  const openEditModal = (album) => setModal({ open: true, action: 'update', album: { ...album } });
  const closeModal = () => setModal(m => ({ ...m, open: false }));

  return (
    <>
      <Navbar />

      <div className="container" style={{ paddingTop: '76px' }}>
        <div className="page-header">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h1 className="h3 mb-0">Albums</h1>

            <div className="d-flex align-items-center flex-wrap gap-3">
              {/* View toggle */}
              <div className="d-flex align-items-center gap-1">
                <span className="text-muted small me-1">View:</span>
                <button
                  className={`btn btn-sm ${view === 'grid' ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => setView('grid')}
                  title="Grid view"
                >
                  <i className="bi bi-grid-3x3-gap-fill" />
                </button>
                <button
                  className={`btn btn-sm ${view === 'list' ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => setView('list')}
                  title="List view"
                >
                  <i className="bi bi-list-ul" />
                </button>
              </div>

              {/* Sort controls */}
              <div className="d-flex align-items-center gap-1">
                <span className="text-muted small me-1">Sort:</span>
                {SORT_FIELDS.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`btn btn-sm ${sortField === key ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => handleSortClick(key)}
                  >
                    {label}
                    {sortField === key && (
                      <i className={`bi ms-1 ${sortAsc ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                    )}
                  </button>
                ))}
              </div>

              {/* Add album */}
              <button className="btn btn-sm btn-success" onClick={openAddModal}>
                <i className="bi bi-plus-circle me-1" />Add Album
              </button>
            </div>
          </div>
        </div>

        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        {view === 'grid' ? (
          <AlbumGrid
            albums={sortedAlbums}
            onEdit={openEditModal}
            onDelete={handleDeleteAlbum}
            onInlineSave={handleInlineSave}
          />
        ) : (
          <AlbumList
            albums={sortedAlbums}
            onEdit={openEditModal}
            onDelete={handleDeleteAlbum}
            onInlineSave={handleInlineSave}
          />
        )}
      </div>

      {modal.open && (
        <AlbumModal
          action={modal.action}
          album={modal.album}
          onSave={handleSaveAlbum}
          onCancel={closeModal}
        />
      )}
    </>
  );
}
