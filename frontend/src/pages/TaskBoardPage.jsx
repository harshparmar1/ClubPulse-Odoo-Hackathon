import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Kanban, Plus, Calendar, AlertTriangle, CheckCircle2, User, X, Clock } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';

export const TaskBoardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventId, setEventId] = useState('');
  const [assigneeName, setAssigneeName] = useState('Ananya Roy');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isCriticalPath, setIsCriticalPath] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTasksAndEvents = async () => {
    try {
      const [tskRes, evRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/events')
      ]);
      setTasks(tskRes || []);
      setEvents(evRes || []);
    } catch (err) {
      console.error('Failed to load task board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndEvents();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, { status: newStatus });
      fetchTasksAndEvents();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await api.post('/api/tasks', {
        title,
        description,
        event_id: eventId || null,
        assignee_name: assigneeName || null,
        assignee_id: 'usr_student01',
        due_date: dueDate || new Date().toISOString().slice(0, 10),
        priority,
        is_critical_path: isCriticalPath,
        status: 'todo'
      });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      fetchTasksAndEvents();
    } catch (err) {
      alert(`Task creation failed: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
              <Kanban className="w-3.5 h-3.5" />
              <span>Sprint Coordination Board</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Volunteer & Fundraiser Task Board
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live status tracking with critical path dependency flags feeding the Operational Risk Engine.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sprint Task</span>
          </button>
        </div>

        {/* 3-Column Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Todo */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 flex flex-col space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider px-1">
              <span>Backlog & Todo</span>
              <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 leading-snug">
                      {task.title}
                    </span>
                    <Badge variant={task.priority === 'critical' ? 'critical' : task.priority === 'high' ? 'warning' : 'neutral'}>
                      {task.priority}
                    </Badge>
                  </div>

                  {task.is_critical_path && (
                    <div className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                      Critical Path
                    </div>
                  )}

                  {task.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>👤 {task.assignee_name || 'Unassigned'}</span>
                    <span className={task.is_overdue ? 'text-rose-600 font-bold' : ''}>
                      📅 {task.due_date}
                    </span>
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                    className="w-full mt-1 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Start Working →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 flex flex-col space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider px-1">
              <span>In Progress</span>
              <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 leading-snug">
                      {task.title}
                    </span>
                    <Badge variant={task.priority === 'critical' ? 'critical' : 'warning'}>
                      {task.priority}
                    </Badge>
                  </div>

                  {task.is_critical_path && (
                    <div className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                      Critical Path
                    </div>
                  )}

                  {task.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>👤 {task.assignee_name || 'Unassigned'}</span>
                    <span className={task.is_overdue ? 'text-rose-600 font-bold' : ''}>
                      📅 {task.due_date}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'todo')}
                      className="flex-1 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-medium"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'done')}
                      className="flex-1 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      Done ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Done */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 flex flex-col space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider px-1">
              <span>Completed</span>
              <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2 opacity-90"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-500 line-through">
                      {task.title}
                    </span>
                    <Badge variant="active">Done</Badge>
                  </div>
                  <div className="text-[10px] text-slate-400">Owner: {task.assignee_name}</div>
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                    className="w-full mt-1 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-[10px] font-medium"
                  >
                    Reopen Task
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Add Sprint Task</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Set up stage audio microphones"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Related Event (Optional)
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">General Club Task</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assignee Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ananya Roy"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCriticalPath}
                        onChange={(e) => setIsCriticalPath(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Critical Path Task</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Details & Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific delivery checklist..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                  >
                    {createLoading ? 'Saving...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
