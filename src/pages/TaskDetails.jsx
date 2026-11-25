import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { getTask, applyToTask } from '../services/taskService.js';
import * as escrow from '../services/escrowService.js';
import { addReview, getReviewForTask } from '../services/reviewService.js';
import { STATUS } from '../domain/taskStatus.js';
import { MAX_REVISIONS } from '../domain/constants.js';
import { formatDate, timeAgo, formatBytes } from '../utils/format.js';
import { validateFiles } from '../utils/validators.js';
import { errorMessage } from '../utils/messages.js';
import { Loading, ErrorBox } from '../components/Feedback.jsx';
import { Token, StatusBadge, StarInput, StarDisplay } from '../components/Badges.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';
import { Field } from '../components/Field.jsx';
import { ConfirmModal, TextModal } from '../components/Modal.jsx';
import SubmissionFiles from '../components/SubmissionFiles.jsx';

export default function TaskDetails() {
  const { id } = useParams();
  const { user, refresh } = useAuth();
  const toast = useToast();
  const { data: task, loading, error, reload } = useLoad(() => getTask(id), [id]);
  const { data: review, reload: reloadReview } = useLoad(() => getReviewForTask(id), [id]);

  const [modal, setModal] = useState(null); // which popup is open
  const [busy, setBusy] = useState(false);
  const [apply, setApply] = useState({ message: '', error: '' });
  const [work, setWork] = useState({ text: '', link: '', files: [], errors: {} });
  const fileInput = useRef(null);
  const [rev, setRev] = useState({ rating: 0, comment: '', error: '' });

  if (loading && !task) return <Loading />;
  if (error) return <div className="container page"><ErrorBox error={error} /></div>;

  const isRequester = task.requesterId === user.id;
  const isProvider = task.providerId === user.id;
  const isAdmin = user.role === 'admin';
  const canApply = user.role === 'user' && !isRequester && task.status === STATUS.OPEN;
  const myApplication = task.applications.find((a) => a.providerId === user.id);

  async function afterChange(message) {
    toast(message, 'success');
    await refresh(); // update balance + alerts in the navbar
    reload();
    reloadReview();
  }

  // Runs an action, shows a toast, and shows errors in a friendly way.
  async function run(action, message) {
    setBusy(true);
    try {
      await action();
      await afterChange(message);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function submitApplication(e) {
    e.preventDefault();
    setApply({ ...apply, error: '' });
    try {
      await applyToTask(task.id, user.id, apply.message);
      setApply({ message: '', error: '' });
      await afterChange('Application sent.');
    } catch (err) {
      setApply({ ...apply, error: err.fields?.message || errorMessage(err) });
    }
  }

  async function submitWork(e) {
    e.preventDefault();
    setBusy(true);
    setWork((current) => ({ ...current, errors: {} }));
    try {
      await escrow.submitWork(task.id, user.id, { text: work.text, link: work.link, files: work.files });
      setWork({ text: '', link: '', files: [], errors: {} });
      await afterChange('Work submitted.');
    } catch (err) {
      if (err.fields) setWork((current) => ({ ...current, errors: err.fields }));
      else toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  }
  // Add picked files and reject a selection that exceeds the combined limits.
  function addFiles(e) {
    const input = e.currentTarget;
    const picked = [...input.files];
    input.value = '';
    if (!picked.length) return;

    setWork((current) => {
      const files = [...current.files, ...picked];
      const errors = validateFiles(files);
      if (errors.files) return { ...current, errors: { ...current.errors, ...errors } };
      return { ...current, files, errors: { ...current.errors, files: '' } };
    });
  }

  const removeFile = (index) => setWork((current) => ({
    ...current,
    files: current.files.filter((_, i) => i !== index),
    errors: { ...current.errors, files: '' },
  }));

  async function submitReview(e) {
    e.preventDefault();
    setRev({ ...rev, error: '' });
    try {
      await addReview(task.id, user.id, { rating: rev.rating, comment: rev.comment });
      await afterChange('Review posted.');
    } catch (err) {
      setRev({ ...rev, error: err.fields?.rating || errorMessage(err) });
    }
  }

  const pending = task.applications.filter((a) => a.status === 'pending');
  const notEnough = user.wallet.available < task.reward;

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <div className="row"><span className="tag">{task.category}</span><StatusBadge status={task.status} /></div>
          <h1 style={{ fontSize: '2rem', marginTop: '.5rem' }}>{task.title}</h1>
        </div>
        <Link to={isAdmin ? '/admin' : '/my-tasks'} className="btn btn-ghost">Back</Link>
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="card">
            <StatusTimeline status={task.status} />
            <h3>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{task.description}</p>
            <h3>What you will receive</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{task.deliverables}</p>
          </div>

          {/* ---------- Provider actions ---------- */}
          {isProvider && task.status === STATUS.ASSIGNED && (
            <div className="card">
              <h3>You were selected</h3>
              <p>{task.reward} tokens are locked in escrow and will be yours when {task.requesterName} approves your work.</p>
              <button className="btn btn-primary" disabled={busy} onClick={() => run(() => escrow.startWork(task.id, user.id), 'Work started.')}>Start working</button>
            </div>
          )}
          {isProvider && task.status === STATUS.IN_PROGRESS && (
            <form className="card" onSubmit={submitWork} noValidate>
              <h3>Submit your work</h3>
              {task.revisionCount > 0 && task.revisionNote && <div className="alert warn"><strong>Requested changes:</strong> {task.revisionNote}</div>}
              <Field label="What are you delivering?" id="text" error={work.errors.text}>
                <textarea id="text" className={`input${work.errors.text ? ' invalid' : ''}`} value={work.text} disabled={busy} onChange={(e) => setWork({ ...work, text: e.target.value })} />
              </Field>
              <Field label="Link to the files (optional)" id="link" hint="Google Drive, GitHub, Figma and similar.">
                <input id="link" className="input" value={work.link} disabled={busy} onChange={(e) => setWork({ ...work, link: e.target.value })} />
              </Field>
              <Field label="Attach files (optional)" error={work.errors.files} hint="Any file type. Up to 30 files, 25 MB each, and 100 MB total.">
                <div className="row">
                  <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => fileInput.current.click()}>Add files</button>
                </div>
                <input ref={fileInput} type="file" multiple onChange={addFiles} disabled={busy} hidden />
                {work.files.length > 0 && (
                  <ul className="file-list">
                    {work.files.map((f, i) => (
                      <li key={`${f.webkitRelativePath || f.name}-${f.size}-${f.lastModified}-${i}`}>
                        <span className="file-name">{f.webkitRelativePath || f.name}</span>
                        <span className="muted small">{formatBytes(f.size)}</span>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>
              <div className="row">
                <button className="btn btn-primary" disabled={busy}>Submit work</button>
                <button type="button" className="btn btn-ghost" onClick={() => setModal('dispute')}>Raise a dispute</button>
              </div>
            </form>
          )}
          {isProvider && task.status === STATUS.SUBMITTED && <div className="alert info">Your work was submitted. Waiting for {task.requesterName} to review it.</div>}

          {/* ---------- Submitted work ---------- */}
          {task.submission && [STATUS.SUBMITTED, STATUS.COMPLETED, STATUS.DISPUTED].includes(task.status) && (isRequester || isProvider || isAdmin) && (
            <div className="card">
              <h3>Submitted work</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{task.submission.text}</p>
              {task.submission.link && <p><a href={task.submission.link} target="_blank" rel="noreferrer">Open the link</a></p>}
              <SubmissionFiles files={task.submission.files || []} />
              <p className="muted small">Submitted {timeAgo(task.submission.submittedAt)}</p>
              {isRequester && task.status === STATUS.SUBMITTED && (
                <div className="row">
                  <button className="btn btn-primary" disabled={busy} onClick={() => setModal('approve')}>Approve and pay {task.reward} tokens</button>
                  <button className="btn btn-ghost" onClick={() => setModal('revision')}>Request changes ({MAX_REVISIONS - task.revisionCount} left)</button>
                  <button className="btn btn-ghost" onClick={() => setModal('dispute')}>Raise a dispute</button>
                </div>
              )}
            </div>
          )}

          {/* ---------- Disputed ---------- */}
          {task.status === STATUS.DISPUTED && (
            <div className="card">
              <h3>Dispute details</h3>
              <p>{task.disputeReason}</p>
              {isAdmin && (
                <div className="row">
                  <button className="btn btn-primary" onClick={() => setModal('release')}>Release tokens to {task.providerName}</button>
                  <button className="btn btn-danger" onClick={() => setModal('refund')}>Refund {task.requesterName}</button>
                </div>
              )}
            </div>
          )}

          {/* ---------- Requester: applicants ---------- */}
          {isRequester && task.status === STATUS.OPEN && (
            <div className="card flat">
              <div className="card-head"><h3 style={{ margin: 0 }}>Applicants ({pending.length})</h3></div>
              {notEnough && pending.length > 0 && (
                <div className="alert warn" style={{ margin: '1rem' }}>You have {user.wallet.available} tokens but this task pays {task.reward}. Earn more tokens before accepting someone.</div>
              )}
              {pending.length === 0 && <p className="muted" style={{ padding: '1rem 1.25rem', margin: 0 }}>No applications yet. You will get an alert when someone applies.</p>}
              {pending.map((a) => (
                <div key={a.id} style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--line)' }}>
                  <div className="row between">
                    <Link to={`/users/${a.providerId}`}><strong>{a.providerName}</strong></Link>
                    <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => setModal({ accept: a })}>Accept</button>
                  </div>
                  <p className="muted" style={{ margin: '.4rem 0 0' }}>{a.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* ---------- Review ---------- */}
          {task.status === STATUS.COMPLETED && review && (
            <div className="card"><h3>Review</h3><StarDisplay value={review.rating} /><p>{review.comment || 'No written comment.'}</p><p className="muted small">By {review.reviewerName}</p></div>
          )}
          {task.status === STATUS.COMPLETED && isRequester && !task.reviewed && (
            <form className="card" onSubmit={submitReview} noValidate>
              <h3>Rate {task.providerName}</h3>
              <Field label="Your rating" error={rev.error}><StarInput value={rev.rating} onChange={(rating) => setRev({ ...rev, rating })} /></Field>
              <Field label="Comment (optional)" id="comment"><textarea id="comment" className="input" value={rev.comment} onChange={(e) => setRev({ ...rev, comment: e.target.value })} /></Field>
              <button className="btn btn-primary">Post review</button>
            </form>
          )}

          {/* ---------- Apply ---------- */}
          {canApply && !myApplication && (
            <form className="card" onSubmit={submitApplication} noValidate>
              <h3>Apply to this task</h3>
              <Field label="Why are you a good fit?" id="message" error={apply.error}>
                <textarea id="message" className={`input${apply.error ? ' invalid' : ''}`} value={apply.message} onChange={(e) => setApply({ ...apply, message: e.target.value })} />
              </Field>
              <button className="btn btn-primary">Send application</button>
            </form>
          )}
          {myApplication && task.status === STATUS.OPEN && <div className="alert success">You applied. The requester will review your message.</div>}
          {myApplication && myApplication.status === 'rejected' && <div className="alert info">Another applicant was chosen for this task.</div>}

          {/* ---------- History ---------- */}
          <div className="card">
            <h3>History</h3>
            <ul className="history">
              {[...task.history].reverse().map((h, i) => (
                <li key={i}><span><strong>{h.status}</strong>: {h.note}</span><span className="muted">{timeAgo(h.at)}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Sidebar ---------- */}
        <aside className="stack">
          <div className="card">
            <div className="muted small">Reward</div>
            <Token amount={task.reward} big />
            <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '1rem 0' }} />
            <p className="small"><span className="muted">Posted by</span><br /><Link to={`/users/${task.requesterId}`}>{task.requesterName}</Link></p>
            {task.providerName && <p className="small"><span className="muted">Provider</span><br /><Link to={`/users/${task.providerId}`}>{task.providerName}</Link></p>}
            <p className="small"><span className="muted">Deadline</span><br />{formatDate(task.deadline)}</p>
            <p className="small" style={{ margin: 0 }}><span className="muted">Posted</span><br />{timeAgo(task.createdAt)}</p>
          </div>
          {isRequester && [STATUS.OPEN, STATUS.ASSIGNED].includes(task.status) && (
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setModal('cancel')}>
              {task.status === STATUS.ASSIGNED ? 'Cancel task and refund tokens' : 'Cancel task'}
            </button>
          )}
        </aside>
      </div>

      {/* ---------- Popups ---------- */}
      {modal?.accept && (
        <ConfirmModal
          title={`Accept ${modal.accept.providerName}?`}
          message={`${task.reward} tokens will move from your available balance into escrow. They go to ${modal.accept.providerName} only after you approve the work.`}
          confirmLabel="Accept and lock tokens"
          onConfirm={() => run(() => escrow.acceptApplication(task.id, modal.accept.id, user.id), 'Applicant accepted. Tokens are locked.')}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'approve' && (
        <ConfirmModal title="Approve this work?" message={`${task.reward} tokens will be released to ${task.providerName}. This cannot be undone.`} confirmLabel="Approve and pay"
          onConfirm={() => run(() => escrow.approveWork(task.id, user.id), 'Work approved. Tokens released.')} onClose={() => setModal(null)} />
      )}
      {modal === 'cancel' && (
        <ConfirmModal danger title="Cancel this task?" message={task.status === STATUS.ASSIGNED ? 'Your locked tokens will be refunded and the provider will be told.' : 'The task will be closed and no longer appear in the task list.'} confirmLabel="Cancel task"
          onConfirm={() => run(() => escrow.cancelTask(task.id, user.id), 'Task cancelled.')} onClose={() => setModal(null)} />
      )}
      {modal === 'release' && (
        <ConfirmModal title="Release tokens?" message={`${task.reward} tokens go to ${task.providerName} and the task is marked completed.`} confirmLabel="Release tokens"
          onConfirm={() => run(() => escrow.resolveDispute(task.id, user.id, 'release'), 'Dispute resolved.')} onClose={() => setModal(null)} />
      )}
      {modal === 'refund' && (
        <ConfirmModal danger title="Refund the requester?" message={`${task.reward} tokens return to ${task.requesterName} and the task is cancelled.`} confirmLabel="Refund tokens"
          onConfirm={() => run(() => escrow.resolveDispute(task.id, user.id, 'refund'), 'Dispute resolved.')} onClose={() => setModal(null)} />
      )}
      {modal === 'revision' && (
        <TextModal title="Request changes" label="What should be changed?" confirmLabel="Send request"
          onSubmit={async (text) => { await escrow.requestRevision(task.id, user.id, text); await afterChange('Changes requested.'); }} onClose={() => setModal(null)}>
          <p className="muted small">You can ask for changes {MAX_REVISIONS - task.revisionCount} more time(s).</p>
        </TextModal>
      )}
      {modal === 'dispute' && (
        <TextModal danger title="Raise a dispute" label="What is the problem?" confirmLabel="Raise dispute"
          onSubmit={async (text) => { await escrow.raiseDispute(task.id, user.id, text); await afterChange('Dispute raised. An administrator will review it.'); }} onClose={() => setModal(null)}>
          <p className="muted small">The tokens stay locked until an administrator decides.</p>
        </TextModal>
      )}
    </div>
  );
}
