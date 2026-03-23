import InPlaceEdit from './InPlaceEdit';

export default function AlbumGrid({ albums, onEdit, onDelete, onInlineSave }) {
  if (albums.length === 0) {
    return <p className="text-muted">No albums found.</p>;
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
      {albums.map(album => (
        <div key={album.id} className="col">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-1">
                <InPlaceEdit
                  value={album.title}
                  fieldName="title"
                  onSave={v => onInlineSave(album, 'title', v)}
                />
              </h5>
              <h6 className="card-subtitle mb-2 text-muted">
                <InPlaceEdit
                  value={album.artist}
                  fieldName="artist"
                  onSave={v => onInlineSave(album, 'artist', v)}
                />
              </h6>
              <p className="card-text small mb-1">
                <span className="text-muted me-1">Year:</span>
                <InPlaceEdit
                  value={album.releaseYear}
                  fieldName="releaseYear"
                  onSave={v => onInlineSave(album, 'releaseYear', v)}
                />
              </p>
              <p className="card-text small">
                <span className="text-muted me-1">Genre:</span>
                <InPlaceEdit
                  value={album.genre}
                  fieldName="genre"
                  onSave={v => onInlineSave(album, 'genre', v)}
                />
              </p>
            </div>
            <div className="card-footer d-flex justify-content-end bg-transparent border-top-0">
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  title="Actions"
                >
                  <i className="bi bi-gear-fill" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button className="dropdown-item" onClick={() => onEdit(album)}>
                      <i className="bi bi-pencil me-2" />Edit
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => onDelete(album)}
                    >
                      <i className="bi bi-trash me-2" />Delete
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
