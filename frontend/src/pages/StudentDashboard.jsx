import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, formatINR } from '../api/client';
import {
  Ticket,
  Calendar,
  CreditCard,
  ShoppingBag,
  CheckSquare,
  Sparkles,
  ArrowRight,
  QrCode,
  ShieldAlert,
  Bell
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const StudentDashboard = () => {
  const { user, isMember } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ticketsRes, tasksRes, annRes] = await Promise.all([
          api.get('/api/tickets/my-tickets').catch(() => []),
          api.get(`/api/tasks?assignee_id=${user?.id}`).catch(() => []),
          api.get('/api/announcements').catch(() => [])
        ]);
        setTickets(ticketsRes || []);
        setTasks(tasksRes || []);
        setAnnouncements((annRes || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome back to ClubPulse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hi, {user?.full_name || 'Student Member'}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1.5 leading-relaxed">
            Your active pass for chapter workshops, hackathons, official merchandise, and volunteer milestones.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/events"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/my-tickets"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>My Ticket QR Codes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Membership Status"
          value={isMember ? 'Active Member' : 'Standard User'}
          subtitle={isMember ? '50% Ticket Discounts Active' : 'Upgrade for exclusive discounts'}
          icon={CreditCard}
          color={isMember ? 'teal' : 'slate'}
          badge={<Badge variant={isMember ? 'active' : 'neutral'}>{isMember ? 'Verified' : 'Unpaid'}</Badge>}
        />
        <StatCard
          title="My Booked Tickets"
          value={tickets.length}
          subtitle="Passes with QR check-in codes"
          icon={Ticket}
          color="indigo"
        />
        <StatCard
          title="Assigned Tasks"
          value={tasks.filter((t) => t.status !== 'done').length}
          subtitle="Volunteer checklist items"
          icon={CheckSquare}
          color="amber"
        />
        <StatCard
          title="Official Announcements"
          value={announcements.length}
          subtitle="Active community updates"
          icon={Bell}
          color="slate"
        />
      </div>

      {/* Grid: Tickets & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Tickets */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">My Active Passes</h2>
            </div>
            <Link to="/my-tickets" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All ({tickets.length}) →
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500 mb-3">No active event tickets yet.</p>
              <Link
                to="/events"
                className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100"
              >
                Browse Upcoming Events
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 3).map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50 flex items-center justify-between transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-slate-900">{tkt.event_title}</h3>
                    <div className="text-xs text-slate-500">
                      📅 {tkt.event_date} • 📍 {tkt.venue}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Token: {tkt.qr_token}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant={tkt.checked_in ? 'active' : 'primary'}>
                      {tkt.checked_in ? 'Checked In' : 'Valid Pass'}
                    </Badge>
                    <div className="text-xs font-bold text-slate-700">
                      {formatINR(tkt.total_amount_paise)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Announcements Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Latest Bulletins</h2>
            </div>
            <Link to="/announcements" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View Feed →
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    {ann.author_name}
                  </span>
                  <Badge variant={ann.priority === 'urgent' ? 'critical' : ann.priority === 'high' ? 'warning' : 'neutral'}>
                    {ann.priority}
                  </Badge>
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{ann.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
