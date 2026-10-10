import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../api/client';
import {
  Users,
  Calendar,
  QrCode,
  Box,
  Kanban,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Camera
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { QRScannerModal } from '../components/QRScannerModal';

export const OrganizerOverview = () => {
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, memRes, tskRes, rskRes] = await Promise.all([
          api.get('/api/events').catch(() => []),
          api.get('/api/members').catch(() => []),
          api.get('/api/tasks').catch(() => []),
          api.get('/api/risk/evaluate').catch(() => null)
        ]);
        setEvents(evRes || []);
        setMembers(memRes || []);
        setTasks(tskRes || []);
        setRiskData(rskRes);
      } catch (err) {
        console.error('Failed to load organizer overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBooked = events.reduce((acc, e) => acc + (e.booked_count || 0), 0);
  const totalCheckedIn = events.reduce((acc, e) => acc + (e.checked_in_count || 0), 0);
  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const criticalOverdueTasks = tasks.filter((t) => t.is_overdue && t.is_critical_path);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top Operational Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Organizer Flight Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Operational Command Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Live attendance verification, member registries, volunteer velocity, and real-time risk checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setScannerOpen(true)}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Open Fast QR Scanner Lane</span>
            </button>
            <Link
              to="/risk"
              className="px-4 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Risk Matrix ({riskData?.total_critical ?? 0} Critical)</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered Members"
            value={members.length}
            subtitle={`${members.filter((m) => m.status === 'active').length} Active annual passes`}
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Event Tickets Issued"
            value={totalBooked}
            subtitle={`${totalCheckedIn} Attendances verified`}
            icon={Calendar}
            color="teal"
          />
          <StatCard
            title="Pending Operations Tasks"
            value={pendingTasks.length}
            subtitle={`${criticalOverdueTasks.length} Critical overdue`}
            icon={Kanban}
            color={criticalOverdueTasks.length > 0 ? 'rose' : 'amber'}
          />
          <StatCard
            title="Readiness Health Score"
            value={`${riskData?.readiness_score ?? '--'} / 100`}
            subtitle="Derived from deterministic rules"
            icon={ShieldAlert}
            color="teal"
          />
        </div>

        {/* Quick Operational Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/organizer/members"
            className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Member Roster
              </span>
              <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Search, filter departments, verify dues, and renew passes.</p>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
              Manage Members →
            </span>
          </Link>

          <Link
            to="/organizer/events"
            className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Events & Capacity
              </span>
              <Calendar className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Create hackathons, lock seat capacity, and monitor bookings.</p>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
              Manage Events →
            </span>
          </Link>

          <Link
            to="/organizer/merch"
            className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Apparel & Inventory
              </span>
              <Box className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Track SKU stocks, size variants (XS-XL), and orders.</p>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
              Manage Stock →
            </span>
          </Link>

          <Link
            to="/organizer/tasks"
            className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Volunteer Task Board
              </span>
              <Kanban className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Kanban sprint board with critical path detection.</p>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
              Open Board →
            </span>
          </Link>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCheckInComplete={() => {
          // Re-fetch counts
          api.get('/api/events').then((res) => setEvents(res || []));
        }}
      />
    </DashboardLayout>
  );
};
