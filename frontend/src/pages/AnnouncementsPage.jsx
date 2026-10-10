import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, Sparkles, X, Megaphone, Clock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/Badge';

export const AnnouncementsPage = () => {
  const { user, role } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [targetAudience, setTargetAudience] = useState('all');
  const [createLoading, setCreateLoading] = useState(false);

  const isOrganizer = ['organizer', 'admin'].includes(role);

  const fetchAnnouncements = async () => {
    try {
      const data = await api.get('/api/announcements');
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setCreateLoading(true);

    try {
      await api.post('/api/announcements', {
        title,
        content,
        priority,
        target_audience: targetAudience,
        is_published: true
      });
      setModalOpen(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err) {
      alert(`Failed to publish: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Official Chapter Bulletins</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Announcements & Notices
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Important alerts, hackathon schedule updates, and exclusive member perks from executive leadership.
            </p>
          </div>

          {isOrganizer && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Announcement</span>
            </button>
          )}
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-36 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No announcements posted yet</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const isUrgent = ann.priority === 'urgent';
              const isHigh = ann.priority === 'high';

              return (
                <div
                  key={ann.id}
                  className={`bg-white rounded-2xl p-6 border transition-all shadow-2xs space-y-3 ${
                    isUrgent
                      ? 'border-rose-300 bg-rose-50/20'
                      : isHigh
                      ? 'border-amber-300 bg-amber-50/10'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={isUrgent ? 'critical' : isHigh ? 'warning' : 'primary'}>
                        {ann.priority.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Audience: {ann.target_audience.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ann.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Published by <strong>{ann.author_name}</strong></span>
                    <span className="font-mono text-[10px]">#{ann.id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Publish Chapter Bulletin</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Announcement Headline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🚨 HackPulse 2026 Venue Change to Hall A"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">Everyone</option>
                      <option value="members_only">Members Only</option>
                      <option value="organizers">Organizers</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Content
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide full context, instructions, and next steps..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
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
                    {createLoading ? 'Publishing...' : 'Broadcast'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
