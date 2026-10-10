import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, formatINR } from '../api/client';
import {
  Calendar,
  Ticket,
  Receipt,
  Users,
  ShieldAlert,
  ArrowRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  QrCode,
  Bell,
  Box,
  AlertTriangle,
  CreditCard,
  CheckSquare
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { RiskAlert } from '../components/RiskAlert';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const StudentDashboard = () => {
  const { user, role, isMember } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [allMembers, setAllMembers] = useState([]);

  const isOrganizer = ['organizer', 'admin'].includes(role);
  const isTreasurer = ['treasurer', 'admin'].includes(role);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const promises = [
          api.get('/api/events?published_only=true').catch(() => []),
          api.get('/api/tickets/my-tickets').catch(() => []),
          api.get(`/api/tasks?assignee_id=${user?.id}`).catch(() => []),
          api.get('/api/announcements').catch(() => [])
        ];

        if (isOrganizer || isTreasurer) {
          promises.push(api.get('/api/risk/evaluate').catch(() => null));
          promises.push(api.get('/api/transactions/summary').catch(() => null));
          promises.push(api.get('/api/members').catch(() => []));
        }

        const results = await Promise.all(promises);
        setEvents((results[0] || []).filter((e) => e.is_published !== false));
        setMyTickets(results[1] || []);
        setMyTasks(results[2] || []);
        setAnnouncements(results[3] || []);

        if (isOrganizer || isTreasurer) {
          setRiskData(results[4]);
          setFinancialSummary(results[5]);
          setAllMembers(results[6] || []);
        }
      } catch (err) {
        console.error('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboard();
  }, [user, role]);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate meaningful metrics from real data
  const upcomingEvents = events.filter((e) => e.is_published);
  const activeMembersCount = allMembers.filter((m) => m.status === 'active').length;
  const criticalRisks = riskData?.risk_items?.filter((r) => r.severity === 'CRITICAL') || [];
  const warningRisks = riskData?.risk_items?.filter((r) => r.severity === 'WARNING') || [];

  return (
    <DashboardLayout
      pageTitle="Overview"
      breadcrumbs={[{ label: 'ClubPulse' }, { label: 'Dashboard' }]}
    >
      <div className="space-y-8">
        {/* ---------------------------------------------------- */}
        {/* A. Welcome Header with Contextual Primary Action     */}
        {/* ---------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E9F1]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#687086]">{todayFormatted}</span>
              <span>•</span>
              <StatusBadge
                variant={role === 'admin' ? 'critical' : role === 'treasurer' ? 'warning' : 'accent'}
              >
                {role.toUpperCase()}
              </StatusBadge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A2B] tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Member'}
            </h1>
            <p className="text-xs sm:text-sm text-[#687086] mt-0.5">
              {isOrganizer
                ? 'Review gate ticket scans, volunteer milestones, and operational attention alerts.'
                : isTreasurer
                ? 'Audit liquid cash reserves, incoming collections, and pending expense claims.'
                : 'Browse chapter events, access gate QR passes, and check volunteer milestones.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            {isOrganizer ? (
              <Link
                to="/organizer/events"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#625BF6] hover:bg-[#5048E5] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </Link>
            ) : isTreasurer ? (
              <Link
                to="/expenses"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#625BF6] hover:bg-[#5048E5] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Receipt className="w-4 h-4" />
                <span>Review Claims</span>
              </Link>
            ) : (
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#625BF6] hover:bg-[#5048E5] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Browse Events</span>
              </Link>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* B. KPI Summary Row (Derived 100% from Live APIs)    */}
        {/* ---------------------------------------------------- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-[#E7E9F1] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isTreasurer || isOrganizer ? (
              <>
                <StatCard
                  title="Net Liquid Reserve"
                  value={formatINR(financialSummary?.net_liquid_balance_paise || 0)}
                  subtitle="Available operating funds"
                  icon={Receipt}
                  color="indigo"
                />
                <StatCard
                  title="Active Members"
                  value={activeMembersCount || allMembers.length}
                  subtitle={`${allMembers.length} Total registered`}
                  icon={Users}
                  color="teal"
                />
                <StatCard
                  title="Upcoming Events"
                  value={upcomingEvents.length}
                  subtitle="Published on calendar"
                  icon={Calendar}
                  color="indigo"
                />
                <StatCard
                  title="Operational Readiness"
                  value={riskData ? `${riskData.readiness_score}/100` : '--'}
                  subtitle={
                    criticalRisks.length > 0
                      ? `${criticalRisks.length} Critical risks detected`
                      : 'All systems within threshold'
                  }
                  icon={ShieldAlert}
                  color={criticalRisks.length > 0 ? 'rose' : 'teal'}
                  badge={
                    riskData && (
                      <StatusBadge variant={criticalRisks.length > 0 ? 'critical' : 'active'}>
                        {criticalRisks.length > 0 ? 'Attention' : 'Healthy'}
                      </StatusBadge>
                    )
                  }
                />
              </>
            ) : (
              <>
                <StatCard
                  title="My Membership"
                  value={isMember ? 'Active Member' : 'Standard'}
                  subtitle={isMember ? '50% Ticket discounts active' : 'Renew dues to unlock perks'}
                  icon={CreditCard}
                  color={isMember ? 'teal' : 'amber'}
                  badge={
                    <StatusBadge variant={isMember ? 'active' : 'warning'}>
                      {isMember ? 'Verified' : 'Pending'}
                    </StatusBadge>
                  }
                />
                <StatCard
                  title="My QR Passes"
                  value={myTickets.length}
                  subtitle="Registered event tickets"
                  icon={Ticket}
                  color="indigo"
                />
                <StatCard
                  title="Volunteer Tasks"
                  value={myTasks.filter((t) => t.status !== 'done').length}
                  subtitle="Pending checklist items"
                  icon={CheckSquare}
                  color="teal"
                />
                <StatCard
                  title="Upcoming Events"
                  value={upcomingEvents.length}
                  subtitle="Open for registration"
                  icon={Calendar}
                  color="indigo"
                />
              </>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* D. Operational Attention ("Needs Attention" Section) */}
        {/* ---------------------------------------------------- */}
        {riskData && (criticalRisks.length > 0 || warningRisks.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D98A18]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#171A2B]">
                  Operational Attention Required
                </h2>
              </div>
              <Link
                to="/risk"
                className="text-xs font-semibold text-[#625BF6] hover:text-[#5048E5] flex items-center gap-1"
              >
                <span>View Full Risk Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...criticalRisks, ...warningRisks].slice(0, 2).map((risk) => (
                <RiskAlert
                  key={risk.id}
                  severity={risk.severity}
                  category={risk.category}
                  title={risk.title}
                  explanation={risk.explanation}
                  sourceRecord={risk.source_record}
                  actionText="Inspect & Remediate"
                  actionLink="/risk"
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* C. Upcoming Events Grid                              */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#171A2B] tracking-tight">
                Upcoming Chapter Events
              </h2>
              <p className="text-xs text-[#687086]">
                Conferences, workshops, and student networking hackathons.
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-[#625BF6] hover:text-[#5048E5] flex items-center gap-1"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcomingEvents.slice(0, 3).map((evt) => {
              const capacity = evt.capacity || 100;
              const booked = evt.booked_count || 0;
              const fillPct = Math.min(100, Math.round((booked / capacity) * 100));

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-xl border border-[#E7E9F1] overflow-hidden shadow-[0_1px_3px_rgba(23,26,43,0.03)] hover:border-[#D3D7E8] hover:shadow-[0_4px_12px_rgba(23,26,43,0.05)] transition-all flex flex-col justify-between"
                >
                  <div className="h-36 bg-[#F3F4F8] relative overflow-hidden">
                    <img
                      src={
                        evt.banner_url ||
                        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <StatusBadge variant={booked >= capacity ? 'critical' : 'active'}>
                        {booked >= capacity ? 'Sold Out' : `${capacity - booked} Seats Left`}
                      </StatusBadge>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#625BF6]">
                        {evt.tags?.[0] || 'Event'}
                      </div>
                      <h3 className="text-sm font-bold text-[#171A2B] line-clamp-1">{evt.title}</h3>
                      <div className="space-y-1 text-xs text-[#687086] pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#A6ACBE]" />
                          <span>{evt.event_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#A6ACBE]" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E7E9F1] space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] text-[#687086] mb-1">
                          <span>Capacity</span>
                          <span>
                            {booked}/{capacity} ({fillPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F3F4F8] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              fillPct >= 90 ? 'bg-[#D98A18]' : 'bg-[#16856B]'
                            }`}
                            style={{ width: `${fillPct}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#171A2B]">
                          {evt.member_price_paise === 0 ? (
                            <span className="text-[#16856B]">Free (Member)</span>
                          ) : (
                            <span>{formatINR(evt.member_price_paise)}</span>
                          )}
                        </div>

                        <Link
                          to="/events"
                          className="px-3 py-1.5 bg-[#EEEDFE] hover:bg-[#D4D1FD] text-[#625BF6] rounded-lg text-xs font-semibold transition-colors"
                        >
                          Details & Pass
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* E. Recent Activity & Active Passes                   */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Passes for Current Student */}
          <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-[#E7E9F1] shadow-[0_1px_3px_rgba(23,26,43,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E9F1] pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#625BF6]" />
                <h3 className="text-sm font-bold text-[#171A2B]">My Active Passes</h3>
              </div>
              <Link to="/my-tickets" className="text-xs font-semibold text-[#625BF6]">
                View All ({myTickets.length}) →
              </Link>
            </div>

            {myTickets.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#687086]">
                You haven't reserved any passes yet.{' '}
                <Link to="/events" className="text-[#625BF6] font-semibold">
                  Browse events to register.
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myTickets.slice(0, 3).map((tkt) => (
                  <div
                    key={tkt.id}
                    className="p-3 rounded-lg border border-[#E7E9F1] bg-[#F7F8FC] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-[#171A2B]">{tkt.event_title}</h4>
                      <div className="text-[11px] text-[#687086] mt-0.5">
                        {tkt.event_date} • {tkt.venue}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge variant={tkt.checked_in ? 'active' : 'accent'}>
                        {tkt.checked_in ? 'Checked In' : 'Valid Pass'}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bulletins */}
          <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-[#E7E9F1] shadow-[0_1px_3px_rgba(23,26,43,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E9F1] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#625BF6]" />
                <h3 className="text-sm font-bold text-[#171A2B]">Latest Bulletins</h3>
              </div>
              <Link to="/announcements" className="text-xs font-semibold text-[#625BF6]">
                Feed →
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#687086]">{ann.author_name}</span>
                    <StatusBadge
                      variant={
                        ann.priority === 'urgent'
                          ? 'critical'
                          : ann.priority === 'high'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {ann.priority}
                    </StatusBadge>
                  </div>
                  <h4 className="text-xs font-bold text-[#171A2B]">{ann.title}</h4>
                  <p className="text-[11px] text-[#687086] line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
