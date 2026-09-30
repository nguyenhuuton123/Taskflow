import { useState } from 'react';
import { api } from '../api';

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onAuth(await api(`/auth/${mode}`, { method: 'POST', body: f }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <h2>🟠 Taskflow</h2>
        <p className="muted">{mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}</p>
        {mode === 'register' && <input placeholder="Họ tên" value={f.name} onChange={set('name')} required />}
        <input type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
        <input type="password" placeholder="Mật khẩu" value={f.password} onChange={set('password')} required />
        {mode === 'register' && (
          <input type="password" placeholder="Nhập lại mật khẩu" value={f.password_confirmation} onChange={set('password_confirmation')} required />
        )}
        {error && <div className="error">{error}</div>}
        <button className="btn primary" disabled={busy}>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</button>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
        {mode === 'login' && <p className="muted small">Demo: demo@taskflow.test / password123</p>}
      </form>
    </div>
  );
}
