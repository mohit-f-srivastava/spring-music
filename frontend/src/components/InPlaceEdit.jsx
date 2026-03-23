import { useState } from 'react';

const YEAR_RE = /^[1-2]\d{3}$/;

export default function InPlaceEdit({ value, fieldName, onSave }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState(false);

  const validate = (val) => {
    if (!val || val.trim() === '') return false;
    if (fieldName === 'releaseYear' && !YEAR_RE.test(val.trim())) return false;
    return true;
  };

  const startEdit = () => {
    setInputVal(String(value ?? ''));
    setError(false);
    setEditing(true);
  };

  const handleSave = () => {
    const trimmed = inputVal.trim();
    if (!validate(trimmed)) {
      setError(true);
      return;
    }
    onSave(trimmed);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setError(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (!editing) {
    return (
      <span className="ipe-value" onClick={startEdit} title="Click to edit">
        {value}
      </span>
    );
  }

  return (
    <div className="ipe-input-group">
      <input
        type="text"
        className={`form-control form-control-sm${error ? ' is-invalid' : ''}`}
        value={inputVal}
        onChange={e => { setInputVal(e.target.value); setError(false); }}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <button className="btn btn-sm btn-outline-success" onClick={handleSave} title="Save">
        <i className="bi bi-check" />
      </button>
      <button className="btn btn-sm btn-outline-secondary" onClick={handleCancel} title="Cancel">
        <i className="bi bi-x" />
      </button>
    </div>
  );
}
