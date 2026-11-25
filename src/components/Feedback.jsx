import { errorMessage } from '../utils/messages.js';

export const Loading = () => <div className="loading" role="status">Loading...</div>;

export const ErrorBox = ({ error }) => <div className="alert error">{errorMessage(error)}</div>;

export function Empty({ title, children, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
