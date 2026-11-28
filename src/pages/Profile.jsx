import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { updateProfile } from '../services/authService.js';
import { Field, TagInput } from '../components/Field.jsx';
import { errorMessage } from '../utils/messages.js';
import { resizeImage } from '../utils/image.js';
import Avatar from '../components/Avatar.jsx';
import Btn from '../components/ui/Btn.jsx';

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
    <div className="mx-auto w-full max-w-[1080px] px-4 py-7 sm:px-6 sm:py-10">
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Account settings</p>
        <h1 className="mb-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-[#19233b] sm:text-4xl">Your profile</h1>
        <p className="mb-0 text-sm text-[#667085] sm:text-base">Keep your information up to date so the community knows who you are.</p>
      </div>

      <form className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-7" onSubmit={save} noValidate>
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl bg-[#f7f9f8] p-4 sm:p-5">
          <Avatar user={{ name: form.name || user.name, avatar: form.avatar }} size={80} />
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-semibold text-[#25324a]">{form.name || user.name}</p>
            <p className="mb-3 text-sm text-[#7b8494]">{user.email}</p>
            <div className="flex flex-wrap gap-2">
              <Btn type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => fileRef.current.click()}>
                {form.avatar ? 'Change photo' : 'Upload photo'}
              </Btn>
              {form.avatar && (
                <Btn type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => setForm({ ...form, avatar: null })}>
                  Remove photo
                </Btn>
              )}
            </div>
            <p className="mb-0 mt-2 text-xs leading-5 text-[#7b8494]">JPG, PNG or WebP, up to 5 MB. Save your profile to keep the change.</p>
            {errors.avatar && <span className="mt-1 block text-sm text-[#b8402c]" role="alert">{errors.avatar}</span>}
            <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} hidden />
          </div>
        </div>

        <div className="mb-6 border-b border-[#edf1f2] pb-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Personal details</p>
          <h2 className="mb-0 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Tell the community about yourself</h2>
        </div>

        <Field label="Full name" id="name" error={errors.name}>
          <input
            id="name"
            className={`w-full rounded-xl border bg-[#fbfcfc] px-3.5 py-2.5 text-sm text-[#25324a] outline-none transition focus:ring-4 ${errors.name ? 'border-[#c8442b] focus:border-[#c8442b] focus:ring-[#c8442b]/10' : 'border-[#dce5e7] focus:border-[#0e8a7d] focus:ring-[#0e8a7d]/10'}`}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        {user.role === 'user' && (
          <>
            <Field label="About you" id="bio" hint="A short intro helps requesters get to know and trust you.">
              <textarea
                id="bio"
                className="min-h-28 w-full resize-y rounded-xl border border-[#dce5e7] bg-[#fbfcfc] px-3.5 py-2.5 text-sm leading-6 text-[#25324a] outline-none transition focus:border-[#0e8a7d] focus:ring-4 focus:ring-[#0e8a7d]/10"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </Field>
            <Field label="Skills" id="skills" hint="Add skills you can offer to other members.">
              <TagInput id="skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
            </Field>
          </>
        )}
        <div className="flex flex-wrap gap-3 border-t border-[#edf1f2] pt-5">
          <Btn type="submit" disabled={busy} className="rounded-xl px-5">{busy ? 'Saving...' : 'Save profile'}</Btn>
          {user.role === 'user' && (
            <Link className="inline-flex items-center rounded-xl border border-[#dce5e7] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] no-underline transition hover:border-[#0e8a7d] hover:bg-[#f1f8f6] hover:text-[#0a6b61]" to={`/users/${user.id}`}>
              View public profile
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}