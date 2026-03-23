import InPlaceEdit from './InPlaceEdit';

export default function AlbumList({ albums, onEdit, onDelete, onInlineSave }) {
  if (albums.length === 0) {
    return <p className="text-muted">No albums found.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead className="table-dark">
          <tr>
            <th>Album Title</th>
            <th>Artist</th>
            <th>Year</th>
            <th>Genre</th>
            <th style={{ width: '60px' }}></th>
          </tr>
        </thead>
        <tbody>
          {albums.map(album => (
            <tr key={album.id}>
              <td>
                <InPlaceEdit
                  value={album.title}
                  fieldName="title"
                  onSave={v => onInlineSave(album, 'title', v)}
                />
              </td>
              <td>
                <InPlaceEdit
                  value={album.artist}
                  fieldName="artist"
                  onSave={v => onInlineSave(album, 'artist', v)}
                />
              </td>
              <td>
                <InPlaceEdit
                  value={album.releaseYear}
                  fieldName="releaseYear"
                  onSave={v => onInlineSave(album, 'releaseYear', v)}
                />
              </td>
              <td>
                <InPlaceEdit
                  value={album.genre}
                  fieldName="genre"
                  onSave={v => onInlineSave(album, 'genre', v)}
                />
              </td>
              <td className="text-end">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
