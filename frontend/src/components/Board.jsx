import { useEffect, useState } from 'react';
import { api, STATUSES } from '../api';

const fmt = (d) => (d ? new Date(d + 'T00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' }) : 'Không hạn');

export default function Board({ rev, onOpen }) {
  const [tasks, setTasks] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [over, setOver] = useState(null);

  const load = () =>
    api('/tasks?per_page=100&sort=position&direction=asc').then((r) => setTasks(r.data));
  useEffect(() => { load(); }, [rev]);

  const column = (status) => tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  // Thả vào cột (cuối cột) hoặc thả lên một thẻ (chèn trước thẻ đó)
  const drop = async (status, before) => {
    setOver(null);
    const id = dragId;
    setDragId(null);
    if (!id || id === before?.id) return;
    const col = column(status).filter((t) => t.id !== id);
    const position = before ? before.position : (col.length ? col[col.length - 1].position + 1 : 0);
    // Cập nhật lạc quan cho mượt, sau đó đồng bộ lại với server
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status, position: position - 0.5 } : t)));
    await api(`/tasks/${id}/move`, { method: 'PATCH', body: { status, position } }).catch(() => {});
    load();
  };

  return (
    <div className="board">
      {STATUSES.map(([status, label]) => (
        <section
          key={status}
          className={'column' + (over === status ? ' over' : '')}
          onDragOver={(e) => { e.preventDefault(); setOver(status); }}
          onDragLeave={() => setOver(null)}
          onDrop={() => drop(status)}
        >
          <h3>{label} <span className="count">{column(status).length}</span></h3>
          {column(status).map((t) => (
            <article
              key={t.id}
              className={'card task' + (dragId === t.id ? ' dragging' : '')}
              draggable
              onDragStart={() => setDragId(t.id)}
              onDragEnd={() => { setDragId(null); setOver(null); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.stopPropagation(); drop(status, t); }}
              onClick={() => onOpen({ task: t })}
            >
              <div className="row between">
                <span className={'due' + (t.is_overdue ? ' late' : '')}>📅 {fmt(t.due_date)}</span>
                <span className={'badge ' + t.priority}>{t.priority}</span>
              </div>
              <h4>{t.title}</h4>
              <div className="tags">{t.tags?.map((g) => <span key={g} className="tag"># {g}</span>)}</div>
            </article>
          ))}
          <button className="add" onClick={() => onOpen({ status })}>＋ Add task</button>
        </section>
      ))}
    </div>
  );
}
