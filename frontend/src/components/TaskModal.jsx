import { useState } from 'react';
import { api, PRIORITIES, STATUSES } from '../api';

export default function TaskModal({ task, status = 'TODO', onClose, onSaved }) {
  const [f, setF] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? status,
    priority: task?.priority ?? 'MEDIUM',
    due_date: task?.due_date ?? '',
    tags: task?.tags?.join(', ') ?? '',
  });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const body = {
      ...f,
      due_date: f.due_date || null,
      tags: f.tags.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      await api(task ? `/tasks/${task.id}` : '/tasks', { method: task ? 'PUT' : 'POST', body });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async () => {
    if (!confirm('Xóa công việc này?')) return;
    await api(`/tasks/${task.id}`, { method: 'DELETE' });
    onSaved();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{task ? 'Sửa công việc' : 'Công việc mới'}</h3>
        <input placeholder="Tiêu đề" value={f.title} onChange={set('title')} required autoFocus />
        <textarea rows="3" placeholder="Mô tả" value={f.description} onChange={set('description')} />
        <div className="grid3">
          <label>Trạng thái
            <select value={f.status} onChange={set('status')}>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </label>
          <label>Ưu tiên
            <select value={f.priority} onChange={set('priority')}>{PRIORITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </label>
          <label>Hạn hoàn thành
            <input type="date" value={f.due_date} onChange={set('due_date')} />
          </label>
        </div>
        <input placeholder="Tags, cách nhau bằng dấu phẩy (Ui, Design)" value={f.tags} onChange={set('tags')} />
        {error && <div className="error">{error}</div>}
        <div className="row between">
          {task ? <button type="button" className="link danger" onClick={remove}>Xóa</button> : <span />}
          <span className="row">
            <button type="button" className="btn" onClick={onClose}>Hủy</button>
            <button className="btn primary">Lưu</button>
          </span>
        </div>
      </form>
    </div>
  );
}
