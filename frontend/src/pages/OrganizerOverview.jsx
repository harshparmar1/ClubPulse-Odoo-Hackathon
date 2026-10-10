import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
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
  Camera,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Megaphone,
  Receipt,
  FileSpreadsheet,
  SlidersHorizontal,
  ChevronRight,
  X,
  ExternalLink,
  Activity,
  Layers
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { QRScannerModal } from '../components/QRScannerModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const OrganizerOverview = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [readinessSummaries, setReadinessSummaries] = useState([]);
  const [actionSummary, setActionSummary] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [scannerOpen, setScannerOpen] = useState(false);
  const [createEventModal, setCreateEventModal] = useState(false);
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [createMemberModal, setCreateMemberModal] = useState(false);
  const [createAnnouncementModal, setCreateAnnouncementModal] = useState(false);

  // Form states for quick actions
  const [eventForm, setEventForm] = useState({
    title: '',
    venue: '',
    event_date: '',
    capacity: 100,
    member_price_inr: 100,
    non_member_price_inr: 200,
    required_volunteer_count: 5,
    estimated_budget_inr: 20000,
    description: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    event_id: '',
    assignee_name: '',
    due_date: new Date().toISOString().slice(0, 10),
    priority: 'high',
    is_critical_path: true,
    description: ''
  });

  const [memberForm, setMemberForm] = useState({
    full_name: '',
    email: '',
    roll_number: '',
    department: 'Computer Science',
    membership_type: 'annual',
    dues_paid_inr: 500
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    priority: 'normal'
  });

  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [evRes, memRes, tskRes, rskRes, readyRes, actRes] = await Promise.all([
        api.get('/api/events').catch(() => []),
        api.get('/api/members').catch(() => []),
        api.get('/api/tasks').catch(() => []),
        api.get('/api/risk/evaluate').catch(() => null),
        api.get('/api/readiness/events').catch(() => []),
        api.get('/api/action-center/items').catch(() => null)
      ]);

      setEvents(evRes || []);
      setMembers(memRes || []);
      setTasks(tskRes || []);
      setRiskData(rskRes);
      setReadinessSummaries(readyRes || []);
      setActionSummary(actRes);
    } catch (err) {
      console.error('Failed to load organizer flight control data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [token]);

  // Derived real metrics
  const totalRegisteredMembers = members.length;
  const activeMemberships = members.filter((m) => m.status === 'active').length;
  const upcomingEvents = events.filter((e) => e.is_published);
  const totalTicketsIssued = events.reduce((acc, e) => acc + (e.booked_count || 0), 0);
  const totalCheckedIn = events.reduce((acc, e) => acc + (e.checked_in_count || 0), 0);
  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const criticalOverdueTasks = tasks.filter((t) => t.is_overdue && t.is_critical_path);

  // Overall readiness: average of upcoming event readiness scores or fallback from risk evaluate
  const avgReadinessScore = readinessSummaries.length > 0
    ? Math.round(readinessSummaries.reduce((acc, r) => acc + (r.overall_readiness_score || 0), 0) / readinessSummaries.length)
    : (riskData?.readiness_score ?? 85);

  // Critical unresolved issues from Action Center and Risk Engine
  const criticalIssues = actionSummary?.items?.filter(
    (item) => item.status !== 'resolved' && (item.severity === 'CRITICAL' || item.severity === 'HIGH')
  ) || [];

  // Tasks requiring immediate action: overdue or unassigned critical-path
  const urgentTasks = tasks
    .filter((t) => t.status !== 'done' && (t.is_overdue || t.is_critical_path || !t.assignee_id))
    .slice(0, 5);

  // Quick Action Submissions
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setActionSubmitting(true);
    try {
      await api.post('/api/events', {
        title: eventForm.title,
        venue: eventForm.venue,
        event_date: eventForm.event_date,
        capacity: Number(eventForm.capacity),
        member_price_paise: Math.round(Number(eventForm.member_price_inr) * 100),
        non_member_price_paise: Math.round(Number(eventForm.non_member_price_inr) * 100),
        required_volunteer_count: Number(eventForm.required_volunteer_count),
        estimated_budget_paise: Math.round(Number(eventForm.estimated_budget_inr) * 100),
        description: eventForm.description || 'Chapter event organized via Flight Control.',
        is_published: true
      });
      setCreateEventModal(false);
      fetchOverviewData();
    } catch (err) {
      alert(`Event creation failed: ${err.message}`);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setActionSubmitting(true);
    try {
      await api.post('/api/tasks', {
        title: taskForm.title,
        event_id: taskForm.event_id || null,
        assignee_name: taskForm.assignee_name || null,
        assignee_id: taskForm.assignee_name ? 'vol_auto' : null,
        due_date: taskForm.due_date,
        priority: taskForm.priority,
        is_critical_path: taskForm.is_critical_path,
        description: taskForm.description || '',
        status: 'todo'
      });
      setCreateTaskModal(false);
      fetchOverviewData();
    } catch (err) {
      alert(`Task assignment failed: ${err.message}`);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setActionSubmitting(true);
    try {
      await api.post('/api/members', {
        full_name: memberForm.full_name,
        email: memberForm.email,
        roll_number: memberForm.roll_number,
        department: memberForm.department,
        membership_type: memberForm.membership_type,
        dues_paid_paise: Math.round(Number(memberForm.dues_paid_inr) * 100)
      });
      setCreateMemberModal(false);
      fetchOverviewData();
    } catch (err) {
      alert(`Member registration failed: ${err.message}`);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setActionSubmitting(true);
    try {
      await api.post('/api/announcements', {
        title: announcementForm.title,
        content: announcementForm.content,
        target_audience: announcementForm.target_audience,
        priority: announcementForm.priority,
        is_published: true
      });
      setCreateAnnouncementModal(false);
      fetchOverviewData();
    } catch (err) {
      alert(`Bulletin publishing failed: ${err.message}`);
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Organizer Command Hub">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* ================================================================= */}
        {/* Flight Control Header Banner                                      */}
        {/* ================================================================= */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#17182B] text-white border border-[#2B2E4E] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#625BF6]/20 text-[#A594FD] border border-[#625BF6]/40 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Organizer Flight Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Operational Command Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#A6ACBE] leading-relaxed">
              Consolidated real-time operational telemetry across event ticketing capacities, gate check-in lanes, volunteer sprints, and proactive risk remediation.
            </p>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 z-10">
            <Link
              to="/organizer/events/new"
              className="px-4 py-2.5 bg-[#625BF6] hover:bg-[#5048E5] text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
            <button
              onClick={() => setScannerOpen(true)}
              className="px-4 py-2.5 bg-[#23253E] hover:bg-[#2B2E4E] text-white border border-[#3E4267] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-4 h-4 text-[#A594FD]" />
              <span>Fast QR Scanner</span>
            </button>
            <button
              onClick={() => setCreateTaskModal(true)}
              className="px-4 py-2.5 bg-[#23253E] hover:bg-[#2B2E4E] text-white border border-[#3E4267] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Kanban className="w-4 h-4 text-[#C97A16]" />
              <span>Assign Task</span>
            </button>
            <button
              onClick={() => setCreateMemberModal(true)}
              className="px-3 py-2.5 bg-[#23253E] hover:bg-[#2B2E4E] text-white border border-[#3E4267] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Register new student member"
            >
              <Users className="w-4 h-4 text-[#16856B]" />
              <span>Add Member</span>
            </button>
            <button
              onClick={() => setCreateAnnouncementModal(true)}
              className="px-3 py-2.5 bg-[#23253E] hover:bg-[#2B2E4E] text-white border border-[#3E4267] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Broadcast announcement"
            >
              <Megaphone className="w-4 h-4 text-[#D9485F]" />
              <span>Publish Bulletin</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* Core Live Operational Metrics (All Derived from Backend Data)     */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/organizer/members" className="group">
            <StatCard
              title="Registered Members"
              value={totalRegisteredMembers}
              subtitle={`${activeMemberships} Active annual passes`}
              icon={Users}
              color="indigo"
            />
          </Link>
          <Link to="/organizer/events" className="group">
            <StatCard
              title="Event Tickets Issued"
              value={totalTicketsIssued}
              subtitle={`${totalCheckedIn} Verified check-ins`}
              icon={Calendar}
              color="teal"
            />
          </Link>
          <Link to="/organizer/tasks" className="group">
            <StatCard
              title="Pending Sprint Tasks"
              value={pendingTasks.length}
              subtitle={`${criticalOverdueTasks.length} Critical overdue`}
              icon={Kanban}
              color={criticalOverdueTasks.length > 0 ? 'rose' : 'amber'}
            />
          </Link>
          <Link to="/action-center" className="group">
            <StatCard
              title="Overall Readiness Score"
              value={`${avgReadinessScore} / 100`}
              subtitle={`${criticalIssues.length} Critical unresolved alerts`}
              icon={ShieldAlert}
              color={avgReadinessScore >= 80 ? 'teal' : (avgReadinessScore >= 60 ? 'amber' : 'rose')}
            />
          </Link>
        </div>

        {/* ================================================================= */}
        {/* Section A: Critical Attention (Highest-Priority Unresolved Items) */}
        {/* ================================================================= */}
        <div className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E7E9F1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D9485F]/10 text-[#D9485F] flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#171A2B] flex items-center gap-2">
                  <span>Critical Attention</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D9485F]/10 text-[#D9485F] border border-[#D9485F]/20">
                    {criticalIssues.length} Unresolved
                  </span>
                </h2>
                <p className="text-xs text-[#687086]">
                  Highest-priority operational bottlenecks identified by the Operational Risk Engine.
                </p>
              </div>
            </div>

            <Link
              to="/action-center"
              className="text-xs font-semibold text-[#625BF6] hover:text-[#5048E5] flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>View Full Action Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5">
            {loading ? (
              <LoadingSkeleton lines={3} />
            ) : criticalIssues.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#16856B]/5 border border-[#16856B]/20">
                <CheckCircle2 className="w-8 h-8 text-[#16856B] mx-auto mb-2" />
                <div className="text-xs font-bold text-[#16856B]">
                  No Critical Operational Blockers Found
                </div>
                <p className="text-[11px] text-[#687086] mt-0.5">
                  All active events, volunteer assignments, and cash reserves are operating within nominal thresholds.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalIssues.slice(0, 4).map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => navigate('/action-center')}
                    className="p-4 rounded-xl border border-[#E7E9F1] hover:border-[#625BF6]/40 hover:bg-[#F7F8FC]/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={issue.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                          {issue.severity}
                        </Badge>
                        <span className="text-[11px] font-semibold text-[#687086] uppercase tracking-wider">
                          {issue.category}
                        </span>
                        {issue.target_entity_type && (
                          <span className="text-[10px] text-[#687086] bg-[#F7F8FC] px-2 py-0.5 rounded border border-[#E7E9F1]">
                            {issue.target_entity_type}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[#171A2B] group-hover:text-[#625BF6] transition-colors">
                        {issue.title}
                      </div>
                      <p className="text-xs text-[#687086] line-clamp-1">
                        {issue.description || 'Remediation guidance available in Action Center.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {issue.assignee_name && (
                        <span className="text-[11px] text-[#687086] font-medium">
                          Assigned: {issue.assignee_name}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-[#625BF6] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Resolve</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* Section B & C Grid: Upcoming Events & Tasks Requiring Action      */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Section B: Upcoming Events & Readiness (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-[#E7E9F1] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#625BF6]/10 text-[#625BF6] flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#171A2B]">
                      Upcoming Events & Readiness
                    </h2>
                    <p className="text-xs text-[#687086]">
                      Capacities, check-in yield, and deterministic readiness scores.
                    </p>
                  </div>
                </div>

                <Link
                  to="/organizer/events"
                  className="text-xs font-semibold text-[#625BF6] hover:text-[#5048E5] flex items-center gap-1 transition-colors"
                >
                  <span>All Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-5 divide-y divide-[#E7E9F1]">
                {loading ? (
                  <LoadingSkeleton lines={4} />
                ) : upcomingEvents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#687086]">
                    No upcoming events scheduled. Click "Create Event" to schedule.
                  </div>
                ) : (
                  upcomingEvents.slice(0, 4).map((evt) => {
                    const readySummary = readinessSummaries.find((r) => r.event_id === evt.id);
                    const score = readySummary?.overall_readiness_score ?? 80;
                    const capPct = Math.min(100, Math.round(((evt.booked_count || 0) / Math.max(1, evt.capacity)) * 100));

                    return (
                      <div
                        key={evt.id}
                        onClick={() => navigate('/organizer/events')}
                        className="py-4 first:pt-0 last:pb-0 hover:bg-[#F7F8FC]/70 px-2 -mx-2 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="text-sm font-bold text-[#171A2B] group-hover:text-[#625BF6] transition-colors">
                              {evt.title}
                            </div>
                            <div className="text-xs text-[#687086] flex items-center gap-3 mt-0.5">
                              <span>{evt.event_date}</span>
                              <span>•</span>
                              <span>{evt.venue}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                score >= 80
                                  ? 'bg-[#16856B]/10 text-[#16856B] border-[#16856B]/30'
                                  : score >= 50
                                  ? 'bg-[#C97A16]/10 text-[#C97A16] border-[#C97A16]/30'
                                  : 'bg-[#D9485F]/10 text-[#D9485F] border-[#D9485F]/30'
                              }`}
                            >
                              {score} / 100 Score
                            </span>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="space-y-1.5 mt-3">
                          <div className="flex items-center justify-between text-[11px] text-[#687086]">
                            <span>
                              Booked: <strong className="text-[#171A2B]">{evt.booked_count}</strong> / {evt.capacity} seats ({capPct}%)
                            </span>
                            <span className="text-[#16856B] font-semibold">
                              {evt.checked_in_count} verified at gate
                            </span>
                          </div>
                          <div className="w-full bg-[#E7E9F1] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#625BF6] h-full rounded-full transition-all duration-500"
                              style={{ width: `${capPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-4 bg-[#F7F8FC] border-t border-[#E7E9F1] flex items-center justify-between text-xs text-[#687086]">
              <span>Need what-if stress testing?</span>
              <Link to="/simulator" className="font-semibold text-[#625BF6] hover:underline flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Open Live Event Simulator →</span>
              </Link>
            </div>
          </div>

          {/* Section C: Tasks Requiring Action (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-[#E7E9F1] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#C97A16]/10 text-[#C97A16] flex items-center justify-center font-bold">
                    <Kanban className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#171A2B]">
                      Tasks Requiring Action
                    </h2>
                    <p className="text-xs text-[#687086]">
                      Overdue dates & unassigned critical-path roles.
                    </p>
                  </div>
                </div>

                <Link
                  to="/organizer/tasks"
                  className="text-xs font-semibold text-[#625BF6] hover:text-[#5048E5] flex items-center gap-1 transition-colors"
                >
                  <span>Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-5 divide-y divide-[#E7E9F1]">
                {loading ? (
                  <LoadingSkeleton lines={4} />
                ) : urgentTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#687086]">
                    No urgent task blockers. Volunteer velocity is on schedule.
                  </div>
                ) : (
                  urgentTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate('/organizer/tasks')}
                      className="py-3 first:pt-0 last:pb-0 hover:bg-[#F7F8FC]/70 px-2 -mx-2 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-[#171A2B] group-hover:text-[#625BF6] transition-colors">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-[#687086] flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Due {t.due_date}</span>
                            </span>
                            <span>•</span>
                            <span>{t.assignee_name || <em className="text-[#D9485F]">Unassigned</em>}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {t.is_overdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D9485F]/10 text-[#D9485F] border border-[#D9485F]/20">
                              Overdue
                            </span>
                          )}
                          {t.is_critical_path && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#625BF6]/10 text-[#625BF6] border border-[#625BF6]/20">
                              Critical
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-[#F7F8FC] border-t border-[#E7E9F1] flex items-center justify-between text-xs text-[#687086]">
              <span>Assign student volunteers directly</span>
              <button
                onClick={() => setCreateTaskModal(true)}
                className="font-semibold text-[#625BF6] hover:underline"
              >
                + Assign New Sprint Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Quick Action Modals                                               */}
      {/* ================================================================= */}

      {/* 1. Create Event Modal */}
      {createEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17182B]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E7E9F1] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E9F1] pb-3">
              <h3 className="text-base font-bold text-[#171A2B] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#625BF6]" />
                <span>Create Official Chapter Event</span>
              </h3>
              <button onClick={() => setCreateEventModal(false)} className="text-[#687086] hover:text-[#171A2B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Hackathon 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Venue Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="Campus Auditorium"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Event Date & Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="2026-04-15 10:00"
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Capacity Cap *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Member (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={eventForm.member_price_inr}
                    onChange={(e) => setEventForm({ ...eventForm, member_price_inr: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Guest (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={eventForm.non_member_price_inr}
                    onChange={(e) => setEventForm({ ...eventForm, non_member_price_inr: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={eventForm.estimated_budget_inr}
                    onChange={(e) => setEventForm({ ...eventForm, estimated_budget_inr: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Volunteers Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={eventForm.required_volunteer_count}
                    onChange={(e) => setEventForm({ ...eventForm, required_volunteer_count: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7E9F1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateEventModal(false)}
                  className="px-4 py-2 border rounded-xl text-[#687086] hover:bg-[#F7F8FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-5 py-2 bg-[#625BF6] hover:bg-[#5048E5] text-white font-semibold rounded-xl"
                >
                  {actionSubmitting ? 'Creating...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Assign Task Modal */}
      {createTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17182B]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E7E9F1] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E9F1] pb-3">
              <h3 className="text-base font-bold text-[#171A2B] flex items-center gap-2">
                <Kanban className="w-4 h-4 text-[#C97A16]" />
                <span>Assign Volunteer Sprint Task</span>
              </h3>
              <button onClick={() => setCreateTaskModal(false)} className="text-[#687086] hover:text-[#171A2B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage Sound & Mic Rigging"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">Associated Event</label>
                <select
                  value={taskForm.event_id}
                  onChange={(e) => setTaskForm({ ...taskForm, event_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                >
                  <option value="">General Club Operations</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Assignee Name</label>
                  <input
                    type="text"
                    placeholder="Ananya Roy"
                    value={taskForm.assignee_name}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taskForm.is_critical_path}
                    onChange={(e) => setTaskForm({ ...taskForm, is_critical_path: e.target.checked })}
                    className="rounded text-[#625BF6]"
                  />
                  <span className="font-semibold text-[#171A2B]">Critical Path Task</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#E7E9F1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateTaskModal(false)}
                  className="px-4 py-2 border rounded-xl text-[#687086] hover:bg-[#F7F8FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-5 py-2 bg-[#625BF6] hover:bg-[#5048E5] text-white font-semibold rounded-xl"
                >
                  {actionSubmitting ? 'Saving...' : 'Add to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Member Modal */}
      {createMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17182B]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E7E9F1] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E9F1] pb-3">
              <h3 className="text-base font-bold text-[#171A2B] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#16856B]" />
                <span>Register Student Member</span>
              </h3>
              <button onClick={() => setCreateMemberModal(false)} className="text-[#687086] hover:text-[#171A2B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">Full Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={memberForm.full_name}
                  onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">University Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@clubpulse.edu"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Roll / Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="STU-2026-089"
                    value={memberForm.roll_number}
                    onChange={(e) => setMemberForm({ ...memberForm, roll_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Department</label>
                  <input
                    type="text"
                    value={memberForm.department}
                    onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Annual Dues Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={memberForm.dues_paid_inr}
                    onChange={(e) => setMemberForm({ ...memberForm, dues_paid_inr: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7E9F1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateMemberModal(false)}
                  className="px-4 py-2 border rounded-xl text-[#687086] hover:bg-[#F7F8FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-5 py-2 bg-[#625BF6] hover:bg-[#5048E5] text-white font-semibold rounded-xl"
                >
                  {actionSubmitting ? 'Registering...' : 'Enroll Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Publish Announcement Modal */}
      {createAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17182B]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E7E9F1] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E9F1] pb-3">
              <h3 className="text-base font-bold text-[#171A2B] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#D9485F]" />
                <span>Publish Official Bulletin</span>
              </h3>
              <button onClick={() => setCreateAnnouncementModal(false)} className="text-[#687086] hover:text-[#171A2B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">Bulletin Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Revision for Symposium"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">Notice Content *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Details of the announcement..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Target Audience</label>
                  <select
                    value={announcementForm.target_audience}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, target_audience: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  >
                    <option value="all">All Campus Community</option>
                    <option value="members_only">Active Members Only</option>
                    <option value="organizers">Organizers & Executives</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Priority</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F7F8FC] border-[#E7E9F1]"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7E9F1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateAnnouncementModal(false)}
                  className="px-4 py-2 border rounded-xl text-[#687086] hover:bg-[#F7F8FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-5 py-2 bg-[#625BF6] hover:bg-[#5048E5] text-white font-semibold rounded-xl"
                >
                  {actionSubmitting ? 'Broadcasting...' : 'Publish Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Fast Optical QR Scanner Modal */}
      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </DashboardLayout>
  );
};
