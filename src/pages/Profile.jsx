import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { updateProfile } from '../services/authService.js';
import { Field, TagInput } from '../components/Field.jsx';
import { errorMessage } from '../utils/messages.js';
import { resizeImage } from '../utils/image.js';
import Avatar from '../components/Avatar.jsx';

export default function Profile() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, bio: user.bio, skills: user.skills, avatar: user.avatar });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  async function pickPhoto(e) {
    const file = e.target.files[0];
    e.target.value = ''; // lets the same file be picked again later
    if (!file) return;
    try {
      setErrors({ ...errors, avatar: '' });
      setForm({ ...form, avatar: await resizeImage(file) });
    } catch (err) {
      setErrors({ ...errors, avatar: err.fields?.avatar || errorMessage(err) });
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await updateProfile(user.id, form);
      await refresh();
      toast('Profile saved.', 'success');
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      else toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page">
      <form className="card form-card" onSubmit={save} noValidate>
        <h2>Your profile</h2>
        <p className="muted">Signed in as {user.email}</p>

        <div className="row" style={{ marginBottom: '1.25rem' }}>
          <Avatar user={{ name: form.name || user.name, avatar: form.avatar }} size={88} />
          <div>
            <div className="row">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>{form.avatar ? 'Change photo' : 'Upload photo'}</button>
              {form.avatar && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, avatar: null })}>Remove photo</button>}
            </div>
            <p className="hint-text" style={{ margin: '.4rem 0 0' }}>JPG, PNG or WebP, up to 5 MB. Click "Save profile" to keep the change.</p>
            {errors.avatar && <span className="error-text" role="alert">{errors.avatar}</span>}
            <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} hidden />
          </div>
        </div>

        <Field label="Full name" id="name" error={errors.name}>
          <input id="name" className={`input${errors.name ? ' invalid' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        {user.role === 'user' && (
          <>
            <Field label="About you" id="bio" hint="A short intro helps requesters trust you.">
              <textarea id="bio" className="input" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </Field>
            <Field label="Skills" id="skills">
              <TagInput id="skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
            </Field>
          </>
        )}
        <div className="row">
          <button className="btn btn-primary" disabled={busy}>Save profile</button>
          {user.role === 'user' && <Link className="btn btn-ghost" to={`/users/${user.id}`}>View public profile</Link>}
        </div>
      </form>
    </div>
  );
}