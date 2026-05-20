import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { api } from '../lib/api.js'
import Toggle from '../components/Toggle.jsx'

// Card section wrapper with a pixel heading.
function Section({ title, children }) {
  return (
    <div className="ss-card p-5">
      <h3 className="font-pixel text-sw-pink text-sm mb-3">{title}</h3>
      {children}
    </div>
  )
}

// Settings screen. Audio + accessibility are device-local (SettingsContext);
// notifications are saved to the server; the account section handles
// password change, account deletion and sign-out.
export default function Settings() {
  const { user, token, setUser, logout } = useAuth()
  const { settings, toggle } = useSettings()
  const navigate = useNavigate()

  const notifications = user?.settings?.notifications || {}
  const [savingNotif, setSavingNotif] = useState(false)

  // Notification prefs persist to the server.
  async function setNotif(key, value) {
    setSavingNotif(true)
    try {
      const data = await api.updateMe(token, { notifications: { [key]: value } })
      setUser(data.user)
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingNotif(false)
    }
  }

  // --- change password ---
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState(null)
  const [pwdBusy, setPwdBusy] = useState(false)

  async function changePassword(event) {
    event.preventDefault()
    setPwdMsg(null)
    if (pwd.next.length < 8) {
      setPwdMsg({ ok: false, text: 'New password must be at least 8 characters.' })
      return
    }
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ ok: false, text: 'New passwords do not match.' })
      return
    }
    setPwdBusy(true)
    try {
      await api.updateMe(token, {
        currentPassword: pwd.current,
        newPassword: pwd.next,
      })
      setPwd({ current: '', next: '', confirm: '' })
      setPwdMsg({ ok: true, text: 'Password updated.' })
    } catch (err) {
      setPwdMsg({ ok: false, text: err.message })
    } finally {
      setPwdBusy(false)
    }
  }

  // --- delete account ---
  async function deleteAccount() {
    if (
      !window.confirm(
        'Delete your account permanently? This cannot be undone.',
      )
    ) {
      return
    }
    try {
      await api.deleteMe(token)
      await logout()
      navigate('/register')
    } catch (err) {
      alert(err.message)
    }
  }

  async function signOut() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <Section title="AUDIO">
        <Toggle
          label="Music"
          checked={settings.music}
          onChange={() => toggle('music')}
        />
        <Toggle
          label="Sound effects"
          checked={settings.sfx}
          onChange={() => toggle('sfx')}
        />
      </Section>

      <Section title="ACCESSIBILITY">
        <Toggle
          label="Reduce motion"
          checked={settings.reduceMotion}
          onChange={() => toggle('reduceMotion')}
        />
        <Toggle
          label="High contrast"
          checked={settings.highContrast}
          onChange={() => toggle('highContrast')}
        />
        <Toggle
          label="Larger text"
          checked={settings.largerText}
          onChange={() => toggle('largerText')}
        />
      </Section>

      <Section title="NOTIFICATIONS">
        <Toggle
          label="Life regenerated"
          checked={notifications.lifeRegen !== false}
          onChange={(v) => setNotif('lifeRegen', v)}
        />
        <Toggle
          label="Squad invites"
          checked={notifications.squadInvites !== false}
          onChange={(v) => setNotif('squadInvites', v)}
        />
        <Toggle
          label="Daily quiz reminder"
          checked={notifications.dailyQuiz !== false}
          onChange={(v) => setNotif('dailyQuiz', v)}
        />
        {savingNotif && (
          <p className="text-sw-text3 text-sm mt-1">Saving…</p>
        )}
      </Section>

      <Section title="ACCOUNT">
        <form onSubmit={changePassword} className="flex flex-col gap-3">
          <p className="text-sw-text3">Change password</p>
          <input
            className="ss-input"
            type="password"
            placeholder="Current password"
            autoComplete="current-password"
            value={pwd.current}
            onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            required
          />
          <input
            className="ss-input"
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            value={pwd.next}
            onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
            required
          />
          <input
            className="ss-input"
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={pwd.confirm}
            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            required
          />
          {pwdMsg && (
            <p className={pwdMsg.ok ? 'text-sw-green' : 'text-sw-red'}>
              {pwdMsg.text}
            </p>
          )}
          <button
            type="submit"
            className="ss-btn ss-btn-cyan self-start"
            disabled={pwdBusy}
          >
            {pwdBusy ? 'Saving…' : 'Update password'}
          </button>
        </form>

        <hr className="my-4" style={{ borderColor: 'var(--line)' }} />

        <p className="text-sw-text3 mb-3">
          Deleting your account removes all progress permanently.
        </p>
        <button
          type="button"
          onClick={deleteAccount}
          className="ss-btn ss-btn-red self-start"
        >
          Delete account
        </button>
      </Section>

      <button
        type="button"
        onClick={signOut}
        className="ss-btn ss-btn-cyan self-center"
      >
        Sign out
      </button>
    </div>
  )
}
