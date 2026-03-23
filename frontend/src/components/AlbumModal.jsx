import { useState, useEffect } from 'react';

const YEAR_RE = /^[1-2]\d{3}$/;

const EMPTY_FORM = { title: '', artist: '', releaseYear: '', genre: '' };

export default function AlbumModal({ action, album, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...album });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ ...EMPTY_FORM, ...album });
    setErrors({});
  }, [album]);

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = 'Required';
    if (!form.artist?.trim()) errs.artist = 'Required';
    if (!form.releaseYear || !YEAR_RE.test(String(form.releaseYear).trim()))
      errs.releaseYear = 'Enter a valid year (1000–2999)';
    if (!form.genre?.trim()) errs.genre = 'Required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  const fieldState = (name, extraCheck) => {
    if (errors[name]) return 'is-invalid';
    const val = form[name];
    if (val && (extraCheck ? extraCheck(val) : true)) return 'is-valid';
    return '';
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {action === 'add' ? 'Add an Album' : 'Edit Album'}
            </h5>
            <button type="button" className="btn-close" onClick={onCancel} />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">
                  Album Title <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${fieldState('title')}`}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Artist <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${fieldState('artist')}`}
                  name="artist"
                  value={form.artist}
                  onChange={handleChange}
                />
                {errors.artist && <div className="invalid-feedback">{errors.artist}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Release Year <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${fieldState('releaseYear', v => YEAR_RE.test(String(v).trim()))}`}
                  name="releaseYear"
                  value={form.releaseYear}
                  onChange={handleChange}
                  placeholder="e.g. 1991"
                />
                {errors.releaseYear && (
                  <div className="invalid-feedback">{errors.releaseYear}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Genre <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${fieldState('genre')}`}
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                />
                {errors.genre && <div className="invalid-feedback">{errors.genre}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                {action === 'add' ? 'Add Album' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
