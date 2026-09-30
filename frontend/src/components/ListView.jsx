import { useEffect, useState } from 'react';
import { api, PRIORITIES, STATUSES } from '../api';

export default function ListView({ rev, onOpen }) {
  const [f, setF] = useState({ search: '', status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [res, setRes] = useState({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } });

  // Debounce ô tìm kiếm 300ms; đổi bộ lọc thì về trang 1
  useEffect(() => {
    const t = setTimeout(() => {
      const q = new URLSearchParams({ page, per_page: 8, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) });
      api('/tasks?' + q).then(setRes);
    }, 300);
    return () => clearTimeout(t);
  }, [f, page, rev]);

  const change = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  const remove = async (id) => {
    if (!confirm('Xóa công việc này?')) return;
    await api(`/tasks/${id}`, { method: 'DELETE' });
    setF({ ...f });
  };

  return (
    <div>
      <div className="filters">
        <input placeholder="Tìm theo tiêu đề…" value={f.search} onChange={change('search')} />
        <select value={f.status} onChange={change('status')}>
          <option value="">Mọi trạng thái</option>
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={f.priority} onChange={change('priority')}>
          <option value="">Mọi mức ưu tiên</option>
          {PRIORITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <table className="table">
        <thead><tr><th>Tiêu đề</th><th>Trạng thái</th><th>Ưu tiên</th><th>Hạn</th><th></th></tr></thead>
        <tbody>
          {res.data.map((t) => (
            <tr key={t.id} onClick={() => onOpen({ task: t })}>
              <td>{t.title}</td>
              <td>{STATUSES.find(([v]) => v === t.status)[1]}</td>
              <td><span className={'badge ' + t.priority}>{t.priority}</span></td>
              <td className={t.is_overdue ? 'late' : ''}>{t.due_date || '—'}</td>
              <td><button className="link danger" onClick={(e) => { e.stopPropagation(); remove(t.id); }}>Xóa</button></td>
            </tr>
          ))}
          {!res.data.length && <tr><td colSpan="5" className="muted center">Không có công việc nào</td></tr>}
        </tbody>
      </table>

      <div className="pager">
        <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Trước</button>
        <span className="muted">Trang {res.meta.current_page}/{res.meta.last_page} · {res.meta.total} task</span>
        <button className="btn" disabled={page >= res.meta.last_page} onClick={() => setPage(page + 1)}>Sau ›</button>
      </div>
    </div>
  );
}
