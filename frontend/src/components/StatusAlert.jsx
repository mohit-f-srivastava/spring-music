export default function StatusAlert({ status, onDismiss }) {
  if (!status) return null;

  return (
    <div
      className={`alert ${status.isError ? 'alert-danger' : 'alert-success'} alert-dismissible`}
      role="alert"
    >
      {status.message}
      <button type="button" className="btn-close" onClick={onDismiss} aria-label="Close" />
    </div>
  );
}
