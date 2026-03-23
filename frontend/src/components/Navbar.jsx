import { useState, useEffect } from 'react';

export default function Navbar() {
  const [info, setInfo] = useState({ profiles: [], services: [] });

  useEffect(() => {
    fetch('/appinfo')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setInfo(data); })
      .catch(() => {});
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-spring navbar-dark fixed-top">
      <div className="container">
        <a className="navbar-brand fw-semibold" href="#">
          Spring Music <i className="bi bi-music-note-beamed ms-1" />
        </a>
        <div className="ms-auto">
          <div className="dropdown">
            <button
              className="btn btn-link text-white p-0"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="App info"
            >
              <i className="bi bi-info-circle fs-5" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item-text">
                  <strong>Profiles:</strong>{' '}
                  {info.profiles?.length ? info.profiles.join(', ') : 'default'}
                </span>
              </li>
              <li>
                <span className="dropdown-item-text">
                  <strong>Services:</strong>{' '}
                  {info.services?.length ? info.services.join(', ') : 'none'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
