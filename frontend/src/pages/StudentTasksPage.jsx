import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';

export const StudentTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const data = await api.get(`/api/tasks?assignee_id=${user?.id}`);
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load student tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const toggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await api.patch(`/api/tasks/${task.id}`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      alert(`Could not update task: ${err.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Volunteer Milestones</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Assigned Volunteer Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Check off your operational duties for chapter hackathons, logistics setups, and lab equipment.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">All clear! No pending tasks</h3>
            <p className="text-xs text-slate-500 mt-1">
              You currently have no volunteer responsibilities assigned.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-2xs flex items-center justify-between gap-4 ${
                    isDone ? 'border-teal-200 bg-teal-50/20' : 'border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task)}
                      className={`w-6 h-6 rounded-lg border-2 mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-300 hover:border-indigo-600 bg-white'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </h3>
                        {task.is_critical_path && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                            Critical Path
                          </span>
                        )}
                        <Badge variant={task.priority === 'critical' ? 'critical' : task.priority === 'high' ? 'warning' : 'neutral'}>
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 max-w-xl">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {task.due_date}
                        </span>
                        {task.event_title && (
                          <span>Event: <strong>{task.event_title}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Badge variant={isDone ? 'active' : 'neutral'}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
