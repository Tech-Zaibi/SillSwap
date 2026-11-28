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
import { Token, StatusBadge, StarInput, StarDisplay } from '../components/Badges.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';
import { Field } from '../components/Field.jsx';
import { ConfirmModal, TextModal } from '../components/Modal.jsx';
import SubmissionFiles from '../components/SubmissionFiles.jsx';
import Btn from '../components/ui/Btn.jsx';
import { LoadingState, ErrorState } from '../components/ui/StateMessage.jsx';

const CARD_CLASS = 'rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-6';
const INPUT_CLASS = 'w-full rounded-xl border border-[#dce5e7] bg-[#fbfcfc] px-3.5 py-2.5 text-sm text-[#25324a] outline-none transition focus:border-[#0e8a7d] focus:ring-4 focus:ring-[#0e8a7d]/10';

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

  if (loading && !task) return <LoadingState />;
  if (error) return <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8"><ErrorState error={error} /></div>;

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
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#eef5f3] px-3 py-1 text-xs font-semibold text-[#0a6b61]">{task.category}</span>
            <StatusBadge status={task.status} />
          </div>
          <h1 className="mb-0 font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-[#19233b] sm:text-4xl">{task.title}</h1>
        </div>
        <Link to={isAdmin ? '/admin' : '/my-tasks'} className="inline-flex cursor-pointer items-center rounded-xl border border-[#dce5e7] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] no-underline shadow-sm transition hover:border-[#0e8a7d] hover:bg-[#f1f8f6] hover:text-[#0a6b61]">
          Back
        </Link>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-5">
          <section className={CARD_CLASS}>
            <StatusTimeline status={task.status} />
            <h2 className="mb-2 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Description</h2>
            <p className="mb-6 whitespace-pre-wrap leading-7 text-[#475467]">{task.description}</p>
            <h2 className="mb-2 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">{isProvider ? 'What you will deliver' : 'What you will receive'}</h2>
            <p className="mb-0 whitespace-pre-wrap leading-7 text-[#475467]">{task.deliverables}</p>
          </section>

          {/* ---------- Provider actions ---------- */}
          {isProvider && task.status === STATUS.ASSIGNED && (
            <section className={CARD_CLASS}>
              <h2 className="mb-2 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">You were selected</h2>
              <p className="mb-5 leading-6 text-[#667085]">{task.reward} tokens are locked in escrow and will be yours when {task.requesterName} approves your work.</p>
              <Btn onClick={() => run(() => escrow.startWork(task.id, user.id), 'Work started.')}>Start working</Btn>
            </section>
          )}
          {isProvider && task.status === STATUS.IN_PROGRESS && (
            <form className={CARD_CLASS} onSubmit={submitWork} noValidate>
              <h2 className="mb-4 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Submit your work</h2>
              {task.revisionCount > 0 && task.revisionNote && <div className="mb-4 rounded-xl border border-[#f1dfb6] bg-[#fff9e9] px-4 py-3 text-sm text-[#755a1b]"><strong>Requested changes:</strong> {task.revisionNote}</div>}
              <Field label="What are you delivering?" id="text" error={work.errors.text}>
                <textarea id="text" className={`${INPUT_CLASS} min-h-32 resize-y leading-6 ${work.errors.text ? 'border-[#c8442b] focus:border-[#c8442b] focus:ring-[#c8442b]/10' : ''}`} value={work.text} disabled={busy} onChange={(e) => setWork({ ...work, text: e.target.value })} aria-invalid={Boolean(work.errors.text)} />
              </Field>
              <Field label="Link to the files (optional)" id="link" hint="Google Drive, GitHub, Figma and similar.">
                <input id="link" className={INPUT_CLASS} value={work.link} disabled={busy} onChange={(e) => setWork({ ...work, link: e.target.value })} />
              </Field>
              <Field label="Attach files (optional)" error={work.errors.files} hint="Any file type. Up to 30 files, 25 MB each, and 100 MB total.">
                <div className="flex flex-wrap gap-3">
                  <Btn type="button" variant="ghost" size="sm" disabled={busy} onClick={() => fileInput.current.click()}>Add files</Btn>
                </div>
                <input ref={fileInput} type="file" multiple onChange={addFiles} disabled={busy} hidden />
                {work.files.length > 0 && (
                  <ul className="m-0 list-none divide-y divide-[#edf1f2] rounded-xl border border-[#e1e8e9] p-0">
                    {work.files.map((f, i) => (
                      <li key={`${f.webkitRelativePath || f.name}-${f.size}-${f.lastModified}-${i}`} className="flex flex-wrap items-center gap-3 p-3">
                        <span className="min-w-0 flex-1 break-all text-sm font-medium text-[#344054]">{f.webkitRelativePath || f.name}</span>
                        <span className="text-xs text-[#7b8494]">{formatBytes(f.size)}</span>
                        <Btn type="button" variant="ghost" size="sm" disabled={busy} onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>Remove</Btn>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>
              <div className="flex flex-wrap gap-3">
                <Btn type="submit" disabled={busy}>Submit work</Btn>
                <Btn type="button" variant="ghost" onClick={() => setModal('dispute')}>Raise a dispute</Btn>
              </div>
            </form>
          )}
          {isProvider && task.status === STATUS.SUBMITTED && <div className="rounded-xl border border-[#d7e3fb] bg-[#eff4ff] px-4 py-3 text-sm leading-6 text-[#405487]">Your work was submitted. Waiting for {task.requesterName} to review it.</div>}

          {/* ---------- Submitted work ---------- */}
          {task.submission && [STATUS.SUBMITTED, STATUS.COMPLETED, STATUS.DISPUTED].includes(task.status) && (isRequester || isProvider || isAdmin) && (
            <section className={CARD_CLASS}>
              <h2 className="mb-3 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Submitted work</h2>
              <p className="whitespace-pre-wrap leading-7 text-[#475467]">{task.submission.text}</p>
              {task.submission.link && <p><a className="font-semibold text-[#0a6b61] underline decoration-[#b4d9d3] underline-offset-2 hover:decoration-[#0a6b61]" href={task.submission.link} target="_blank" rel="noreferrer">Open the link</a></p>}
              <SubmissionFiles files={task.submission.files || []} />
              <p className="mb-4 text-xs text-[#7b8494]">Submitted {timeAgo(task.submission.submittedAt)}</p>
              {isRequester && task.status === STATUS.SUBMITTED && (
                <div className="flex flex-wrap gap-3">
                  <Btn disabled={busy} onClick={() => setModal('approve')}>Approve and pay {task.reward} tokens</Btn>
                  <Btn variant="ghost" onClick={() => setModal('revision')}>Request changes ({MAX_REVISIONS - task.revisionCount} left)</Btn>
                  <Btn variant="ghost" onClick={() => setModal('dispute')}>Raise a dispute</Btn>
                </div>
              )}
            </section>
          )}

          {/* ---------- Disputed ---------- */}
          {task.status === STATUS.DISPUTED && (
            <section className={CARD_CLASS}>
              <h2 className="mb-3 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Dispute details</h2>
              <p className="mb-5 whitespace-pre-wrap leading-6 text-[#475467]">{task.disputeReason}</p>
              {isAdmin && (
                <div className="flex flex-wrap gap-3">
                  <Btn onClick={() => setModal('release')}>Release tokens to {task.providerName}</Btn>
                  <Btn variant="danger" onClick={() => setModal('refund')}>Refund {task.requesterName}</Btn>
                </div>
              )}
            </section>
          )}

          {/* ---------- Requester: applicants ---------- */}
          {isRequester && task.status === STATUS.OPEN && (
            <section className="overflow-hidden rounded-2xl border border-[#e1e8e9] bg-white shadow-[0_8px_30px_rgba(25,35,59,0.04)]">
              <div className="border-b border-[#edf1f2] px-5 py-4 sm:px-6">
                <h2 className="mb-0 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Applicants ({pending.length})</h2>
              </div>
              {notEnough && pending.length > 0 && (
                <div className="m-4 rounded-xl border border-[#f1dfb6] bg-[#fff9e9] px-4 py-3 text-sm leading-6 text-[#755a1b]">You have {user.wallet.available} tokens but this task pays {task.reward}. Earn more tokens before accepting someone.</div>
              )}
              {pending.length === 0 && <p className="mb-0 px-5 py-4 text-sm text-[#7b8494] sm:px-6">No applications yet. You will get an alert when someone applies.</p>}
              {pending.map((a) => (
                <div key={a.id} className="border-t border-[#edf1f2] px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link className="font-semibold text-[#0a6b61] no-underline hover:underline" to={`/users/${a.providerId}`}>{a.providerName}</Link>
                    <Btn size="sm" disabled={busy} onClick={() => setModal({ accept: a })}>Accept</Btn>
                  </div>
                  <p className="mb-0 mt-2 whitespace-pre-wrap text-sm leading-6 text-[#667085]">{a.message}</p>
                </div>
              ))}
            </section>
          )}

          {/* ---------- Review ---------- */}
          {task.status === STATUS.COMPLETED && review && (
            <section className={CARD_CLASS}>
              <h2 className="mb-3 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Review</h2>
              <StarDisplay value={review.rating} />
              <p className="mb-3 mt-3 whitespace-pre-wrap leading-6 text-[#475467]">{review.comment || 'No written comment.'}</p>
              <p className="mb-0 text-xs text-[#7b8494]">By {review.reviewerName}</p>
            </section>
          )}
          {task.status === STATUS.COMPLETED && isRequester && !task.reviewed && (
            <form className={CARD_CLASS} onSubmit={submitReview} noValidate>
              <h2 className="mb-4 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Rate {task.providerName}</h2>
              <Field label="Your rating" error={rev.error}><StarInput value={rev.rating} onChange={(rating) => setRev({ ...rev, rating })} /></Field>
              <Field label="Comment (optional)" id="comment"><textarea id="comment" className={`${INPUT_CLASS} min-h-28 resize-y leading-6`} value={rev.comment} onChange={(e) => setRev({ ...rev, comment: e.target.value })} /></Field>
              <Btn type="submit">Post review</Btn>
            </form>
          )}

          {/* ---------- Apply ---------- */}
          {canApply && !myApplication && (
            <form className={CARD_CLASS} onSubmit={submitApplication} noValidate>
              <h2 className="mb-4 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Apply to this task</h2>
              <Field label="Why are you a good fit?" id="message" error={apply.error}>
                <textarea id="message" className={`${INPUT_CLASS} min-h-32 resize-y leading-6 ${apply.error ? 'border-[#c8442b] focus:border-[#c8442b] focus:ring-[#c8442b]/10' : ''}`} value={apply.message} onChange={(e) => setApply({ ...apply, message: e.target.value })} aria-invalid={Boolean(apply.error)} />
              </Field>
              <Btn type="submit">Send application</Btn>
            </form>
          )}
          {myApplication && task.status === STATUS.OPEN && <div className="rounded-xl border border-[#cce7e0] bg-[#eff8f5] px-4 py-3 text-sm text-[#0a6b61]">You applied. The requester will review your message.</div>}
          {myApplication && myApplication.status === 'rejected' && <div className="rounded-xl border border-[#d7e3fb] bg-[#eff4ff] px-4 py-3 text-sm text-[#405487]">Another applicant was chosen for this task.</div>}

          {/* ---------- History ---------- */}
          <section className={CARD_CLASS}>
            <h2 className="mb-4 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">History</h2>
            <ul className="m-0 list-none divide-y divide-[#edf1f2] p-0">
              {[...task.history].reverse().map((h, i) => (
                <li key={i} className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm">
                  <span className="leading-6 text-[#475467]"><strong className="text-[#25324a]">{h.status}</strong>: {h.note}</span>
                  <span className="whitespace-nowrap text-xs text-[#7b8494]">{timeAgo(h.at)}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>

        {/* ---------- Sidebar ---------- */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className={CARD_CLASS}>
            <p className="mb-2 text-sm font-semibold text-[#667085]">Task reward</p>
            <Token amount={task.reward} big />
            <hr className="my-5 border-0 border-t border-[#e1e8e9]" />
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#8a94a6]">Posted by</dt>
                <dd className="mb-0 mt-1 font-medium text-[#344054]"><Link className="text-[#0a6b61] underline decoration-[#b4d9d3] underline-offset-2 hover:decoration-[#0a6b61]" to={`/users/${task.requesterId}`}>{task.requesterName}</Link></dd>
              </div>
              {task.providerName && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#8a94a6]">Provider</dt>
                  <dd className="mb-0 mt-1 font-medium text-[#344054]"><Link className="text-[#0a6b61] underline decoration-[#b4d9d3] underline-offset-2 hover:decoration-[#0a6b61]" to={`/users/${task.providerId}`}>{task.providerName}</Link></dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#8a94a6]">Deadline</dt>
                <dd className="mb-0 mt-1 text-[#344054]">{formatDate(task.deadline)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#8a94a6]">Posted</dt>
                <dd className="mb-0 mt-1 text-[#344054]">{timeAgo(task.createdAt)}</dd>
              </div>
            </dl>
          </section>
          {isRequester && [STATUS.OPEN, STATUS.ASSIGNED].includes(task.status) && (
            <Btn variant="ghost" className="w-full rounded-xl" onClick={() => setModal('cancel')}>
              {task.status === STATUS.ASSIGNED ? 'Cancel task and refund tokens' : 'Cancel task'}
            </Btn>
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
          <p className="mb-4 text-sm text-[#667085]">You can ask for changes {MAX_REVISIONS - task.revisionCount} more time(s).</p>
        </TextModal>
      )}
      {modal === 'dispute' && (
        <TextModal danger title="Raise a dispute" label="What is the problem?" confirmLabel="Raise dispute"
          onSubmit={async (text) => { await escrow.raiseDispute(task.id, user.id, text); await afterChange('Dispute raised. An administrator will review it.'); }} onClose={() => setModal(null)}>
          <p className="mb-4 text-sm text-[#667085]">The tokens stay locked until an administrator decides.</p>
        </TextModal>
      )}
    </div>
  );
}
