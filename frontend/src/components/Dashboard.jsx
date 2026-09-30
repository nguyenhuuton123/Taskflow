import { useEffect, useState } from 'react';
import { api } from '../api';

const ago = (iso) => {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return `${Math.floor(s / 86400)} ngày trước`;
};
const list = (x) => (Array.isArray(x) ? x : x?.data ?? []);
const ACTION = { TODO: 'đã lên kế hoạch cho', IN_PROGRESS: 'đang thực hiện', DONE: 'đã hoàn thành' };
const initials = (name) => name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();

export default function Dashboard({ rev, onOpen, user, goto }) {
  const [d, setD] = useState(null);
  useEffect(() => { api('/dashboard?days=7').then(setD); }, [rev]);
  if (!d) return <p className="muted">Đang tải…</p>;
  const projects = list(d.projects);
  const upcoming = list(d.upcoming);
  const recent = list(d.recent);

  const stats = [
    ['Tổng số task', d.total, 'g1', `${d.todo} chưa bắt đầu`],
    ['Đến hạn hôm nay', d.due_today, 'g2', `${d.overdue} quá hạn`],
    ['Đã hoàn thành', d.done, 'g3', `${d.total ? Math.round((d.done / d.total) * 100) : 0}% tổng số`],
    ['Đang thực hiện', d.in_progress, 'g4', 'task đang mở'],
  ];

  return (
    <div>
      <div className="stats">
        {stats.map(([label, n, cls, note]) => (
          <div key={label} className={`card stat ${cls}`}>
            <span className="muted">{label}</span>
            <strong>{n}</strong>
            <span className="small muted">{note}</span>
          </div>
        ))}
      </div>

      <div className="sec-head"><h3>Tiến độ theo tag</h3><button className="link" onClick={() => goto('board')}>Xem board</button></div>
      <div className="projects">
        {projects.length === 0 && <p className="muted">Chưa có tag nào. Thêm tag khi tạo task để xem tiến độ tại đây.</p>}
        {projects.map((p) => {
          const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
          return (
            <div key={p.name} className="card proj">
              <h4># {p.name}</h4>
              <p className="muted small">{p.done}/{p.total} task đã hoàn thành</p>
              <div className="bar"><i style={{ width: pct + '%' }} /></div>
              <span className="small muted">{pct}%</span>
            </div>
          );
        })}
      </div>

      <div className="sec-head"><h3>Sắp đến hạn (7 ngày tới)</h3><button className="link" onClick={() => goto('list')}>Xem tất cả</button></div>
      <div className="card">
        {upcoming.length === 0 && <p className="muted">Không có công việc nào sắp đến hạn 🎉</p>}
        {upcoming.map((t) => (
          <div key={t.id} className="upcoming" onClick={() => onOpen({ task: t })}>
            <span>{t.title}</span>
            <span className="row"><span className={'badge ' + t.priority}>{t.priority}</span><span className="muted">{t.due_date}</span></span>
          </div>
        ))}
      </div>

      <div className="sec-head"><h3>Hoạt động gần đây</h3></div>
      <table className="table">
        <thead><tr><th>Người dùng</th><th>Hành động</th><th>Task</th><th>Tag</th><th>Ưu tiên</th><th>Thời gian</th></tr></thead>
        <tbody>
          {recent.map((t) => (
            <tr key={t.id} onClick={() => onOpen({ task: t })}>
              <td><span className="row"><span className="avatar">{initials(user.name)}</span>{user.name}</span></td>
              <td>{ACTION[t.status]}</td>
              <td>{t.title}</td>
              <td>{t.tags?.[0] ? `# ${t.tags[0]}` : '—'}</td>
              <td><span className={'badge ' + t.priority}>{t.priority}</span></td>
              <td className="muted">{ago(t.updated_at)}</td>
            </tr>
          ))}
          {!recent.length && <tr><td colSpan="6" className="muted center">Chưa có hoạt động nào</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
