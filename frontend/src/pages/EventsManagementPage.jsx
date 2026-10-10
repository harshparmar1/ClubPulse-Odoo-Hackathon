import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Plus,
  Users,
  MapPin,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Edit2,
  Eye,
  SlidersHorizontal,
  Coins,
  Kanban,
  Box,
  Clock,
  QrCode,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Check,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  MoreVertical,
  LayoutGrid,
  List
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const EventsManagementPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [readinessSummaries, setReadinessSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter controls
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // all, published, draft
  const [timeFilter, setTimeFilter] = useState('all'); // all, upcoming, past
  const [viewMode, setViewMode] = useState('grid'); // grid, table

  // Cancel Confirmation Modal
  const [cancelModalEvent, setCancelModalEvent] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Action status toast
  const [actionNotice, setActionNotice] = useState(null);

  const fetchEventsAndSummaries = async () => {
    try {
      setLoading(true);
      const [evData, readyData] = await Promise.all([
        api.get('/api/events').catch(() => []),
        api.get('/api/readiness/events').catch(() => [])
      ]);
      setEvents(evData || []);
      setReadinessSummaries(readyData || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndSummaries();
  }, [token]);

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Quick toggle publication status
  const handleTogglePublish = async (evt, e) => {
    e.stopPropagation();
    try {
      const updated = await api.patch(`/api/events/${evt.id}`, {
        is_published: !evt.is_published
      });
      setEvents((prev) =>
        prev.map((item) => (item.id === evt.id ? { ...item, is_published: updated.is_published } : item))
      );
      showNotice(
        updated.is_published
          ? `Event "${evt.title}" is now Published (visible to students, admin & treasurer).`
          : `Event "${evt.title}" is now Unpublished (hidden from students, admin & treasurer).`
      );
    } catch (err) {
      console.error('Failed to update publication status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  // Cancel event execution
  const handleConfirmCancel = async () => {
    if (!cancelModalEvent) return;
    try {
      setCancelling(true);
      await api.delete(`/api/events/${cancelModalEvent.id}`);
      setEvents((prev) => prev.filter((item) => item.id !== cancelModalEvent.id));
      showNotice(`Event "${cancelModalEvent.title}" has been cancelled.`);
      setCancelModalEvent(null);
    } catch (err) {
      console.error('Failed to cancel event:', err);
      alert('Failed to cancel event: ' + err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Unique tags for filter pill list
  const categoryPills = ['All', 'Hackathon', 'Workshop', 'AI', 'Coding', 'Tech', 'Gala', 'Design'];

  // Filtering logic
  const now = new Date();
  const filteredEvents = events.filter((evt) => {
    // Search filter
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      (evt.description || '').toLowerCase().includes(search.toLowerCase()) ||
      evt.venue.toLowerCase().includes(search.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === 'All' ||
      (evt.tags && evt.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase())));

    // Status filter: Published vs Unpublished (Drafts)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && evt.is_published) ||
      (statusFilter === 'draft' && !evt.is_published);

    // Time filter (upcoming vs past)
    let matchesTime = true;
    if (timeFilter !== 'all' && evt.event_date) {
      const eventTime = new Date(evt.event_date).getTime();
      if (!isNaN(eventTime)) {
        if (timeFilter === 'upcoming') {
          matchesTime = eventTime >= now.getTime() - 24 * 3600 * 1000;
        } else if (timeFilter === 'past') {
          matchesTime = eventTime < now.getTime() - 24 * 3600 * 1000;
        }
      }
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesTime;
  });

  return (
    <DashboardLayout
      pageTitle="Events & Tickets"
      breadcrumbs={[
        { label: 'Organizer', link: '/organizer/overview' },
        { label: 'Events & Tickets' }
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Notice alert */}
        {actionNotice && (
          <div className="p-3.5 bg-[#16856B]/10 border border-[#16856B]/30 rounded-xl flex items-center justify-between text-xs font-semibold text-[#16856B] animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-[#16856B] hover:opacity-75 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. PAGE HEADER: Title, Subtitle & Prominent "+ Create Event"     */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Events & Ticket Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171A2B] tracking-tight">
              Events & Tickets
            </h1>
            <p className="text-xs sm:text-sm text-[#687086] mt-1">
              Create events, manage ticket availability, and monitor attendance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              to="/organizer/events/new"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#625BF6] hover:bg-[#5048E5] text-white rounded-xl text-xs font-bold shadow-md shadow-[#625BF6]/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Event</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-[#E7E9F1] p-4 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#687086] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search events by title, description, or venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] focus:bg-white text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
              />
            </div>

            {/* Publication Status & Timeline Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Publication Status Selector */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-white text-[#171A2B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
              >
                <option value="all">All Statuses ({events.length})</option>
                <option value="published">
                  Published ({events.filter((e) => e.is_published).length})
                </option>
                <option value="draft">
                  Unpublished / Drafts ({events.filter((e) => !e.is_published).length})
                </option>
              </select>

              {/* Time Period Tabs */}
              <div className="flex items-center bg-[#F7F8FC] border border-[#E7E9F1] p-0.5 rounded-xl text-xs">
                {['all', 'upcoming', 'past'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTimeFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                      timeFilter === tab
                        ? 'bg-white text-[#171A2B] shadow-2xs font-bold'
                        : 'text-[#687086] hover:text-[#171A2B]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* View Switcher: Grid vs Table */}
              <div className="hidden sm:flex items-center bg-[#F7F8FC] border border-[#E7E9F1] p-0.5 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#625BF6] shadow-2xs'
                      : 'text-[#687086] hover:text-[#171A2B]'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-[#625BF6] shadow-2xs'
                      : 'text-[#687086] hover:text-[#171A2B]'
                  }`}
                  title="List / Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs scrollbar-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#687086] mr-1 shrink-0">
              Categories:
            </span>
            {categoryPills.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl font-semibold transition-colors shrink-0 text-xs ${
                  selectedCategory === cat
                    ? 'bg-[#625BF6] text-white shadow-2xs'
                    : 'bg-[#F7F8FC] text-[#687086] border border-[#E7E9F1] hover:bg-[#EEEDFE] hover:text-[#625BF6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. EVENTS LISTING: Grid or Table with Organizer Controls         */}
        {/* ============================================================== */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl h-96 animate-pulse border border-[#E7E9F1]"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E9F1] p-12 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EEEDFE] text-[#625BF6] flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#171A2B]">No events match your criteria</h3>
            <p className="text-xs text-[#687086] mt-1 max-w-sm mx-auto mb-5">
              {search || selectedCategory !== 'All' || statusFilter !== 'all'
                ? 'Try adjusting your search filters or clear your search query.'
                : 'Get started by creating your chapter’s first event.'}
            </p>
            <Link
              to="/organizer/events/new"
              className="px-5 py-2.5 bg-[#625BF6] hover:bg-[#5048E5] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-[#625BF6]/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Event</span>
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          /* ============================================================ */
          /* CARDS GRID VIEW                                              */
          /* ============================================================ */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const capacity = evt.capacity || 100;
              const booked = evt.booked_count || 0;
              const checkins = evt.checked_in_count || 0;
              const fillPercentage = Math.min(100, Math.round((booked / capacity) * 100));
              const isFull = booked >= capacity;

              const readySummary = readinessSummaries.find((r) => r.event_id === evt.id);
              const score = readySummary?.overall_readiness_score ?? 85;

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs hover:shadow-md hover:border-[#625BF6]/40 transition-all flex flex-col overflow-hidden group"
                >
                  {/* Banner Image with Fallback */}
                  <div className="h-44 w-full bg-[#17182B] relative overflow-hidden">
                    <img
                      src={
                        evt.banner_url ||
                        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Status Badges Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs backdrop-blur-md ${
                          evt.is_published
                            ? 'bg-[#16856B]/90 text-white border-[#16856B]'
                            : 'bg-[#17182B]/90 text-[#FFBA69] border-[#E78020]'
                        }`}
                      >
                        {evt.is_published
                          ? '● Published'
                          : '○ Unpublished (Draft)'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {isFull ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9485F] text-white">
                          Sold Out
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#17182B]/80 text-white backdrop-blur-xs border border-white/20">
                          {capacity - booked} Left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {(evt.tags || ['Event']).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-semibold text-[#687086] bg-[#F7F8FC] border border-[#E7E9F1] px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <Link
                        to={`/organizer/events/${evt.id}`}
                        className="font-bold text-base text-[#171A2B] group-hover:text-[#625BF6] transition-colors line-clamp-1 block"
                      >
                        {evt.title}
                      </Link>

                      {/* Description */}
                      <p className="text-xs text-[#687086] line-clamp-2 leading-relaxed">
                        {evt.description || 'No description provided.'}
                      </p>

                      {/* Venue & Schedule */}
                      <div className="pt-1 text-xs text-[#687086] space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#625BF6] shrink-0" />
                          <span className="truncate">{evt.event_date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#625BF6] shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Details: Capacity Bar & Prices */}
                    <div className="pt-3 border-t border-[#E7E9F1] space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-[#687086] mb-1">
                          <span className="font-semibold text-[#171A2B]">Capacity & Turnout</span>
                          <span>
                            {booked} / {capacity} ({fillPercentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F0F2F7] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#625BF6] h-full rounded-full transition-all duration-300"
                            style={{ width: `${fillPercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1.5 text-[10px]">
                          <span className="text-[#16856B] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {checkins} verified check-ins
                          </span>
                          <span className="text-[#687086]">
                            Budget: {formatINR(evt.estimated_budget_paise || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Pricing Row */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0F2F7]">
                        <div>
                          <span className="text-[10px] text-[#687086] block">Member</span>
                          <span className="font-bold text-[#16856B]">
                            {formatINR(evt.member_price_paise)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#687086] block">Non-Member</span>
                          <span className="font-bold text-[#171A2B]">
                            {formatINR(evt.non_member_price_paise)}
                          </span>
                        </div>
                      </div>

                      {/* Organizer Controls Button Toolbar */}
                      <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-[#F0F2F7]">
                        <Link
                          to={`/organizer/events/${evt.id}`}
                          className="flex-1 py-1.5 px-2 bg-[#EEEDFE] hover:bg-[#625BF6] text-[#625BF6] hover:text-white rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>

                        <Link
                          to={`/organizer/events/${evt.id}/edit`}
                          className="p-1.5 text-[#687086] hover:text-[#171A2B] hover:bg-[#F0F2F7] rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>


                        <button
                          onClick={(e) => handleTogglePublish(evt, e)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                            evt.is_published
                              ? 'text-[#687086] border-[#E7E9F1] hover:bg-[#F0F2F7]'
                              : 'text-[#16856B] bg-[#16856B]/10 border-[#16856B]/20 hover:bg-[#16856B]/20'
                          }`}
                          title="Toggle Publication"
                        >
                          {evt.is_published ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          onClick={() => setCancelModalEvent(evt)}
                          className="p-1.5 text-[#687086] hover:text-[#D9485F] hover:bg-[#D9485F]/10 rounded-lg transition-colors"
                          title="Cancel Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ============================================================ */
          /* TABLE VIEW                                                   */
          /* ============================================================ */
          <div className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8FC] text-[#687086] uppercase font-bold border-b border-[#E7E9F1] text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Event Details & Venue</th>
                    <th className="py-3.5 px-4">Date / Time</th>
                    <th className="py-3.5 px-4">Seating & Gate</th>
                    <th className="py-3.5 px-4">Pricing</th>
                    <th className="py-3.5 px-4">Budget</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Organizer Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9F1] font-medium text-[#171A2B]">
                  {filteredEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      onClick={() => navigate(`/organizer/events/${evt.id}`)}
                      className="hover:bg-[#F7F8FC]/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#171A2B] group-hover:text-[#625BF6] transition-colors">
                          {evt.title}
                        </div>
                        <div className="text-[11px] text-[#687086] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#687086]" />
                          <span>{evt.venue}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#687086]">{evt.event_date}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{evt.booked_count || 0}</span>
                          <span className="text-[#687086] font-normal">/ {evt.capacity}</span>
                        </div>
                        <div className="text-[10px] text-[#16856B] font-semibold mt-0.5">
                          {evt.checked_in_count || 0} verified check-ins
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[#16856B] font-bold">
                          {formatINR(evt.member_price_paise)}
                        </div>
                        <div className="text-[10px] text-[#687086]">
                          Guest: {formatINR(evt.non_member_price_paise)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#171A2B] font-semibold">
                        {formatINR(evt.estimated_budget_paise || 0)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            evt.is_published
                              ? 'bg-[#16856B]/10 text-[#16856B] border-[#16856B]/20'
                              : 'bg-[#E78020]/10 text-[#C46814] border-[#E78020]/30'
                          }`}
                        >
                          {evt.is_published
                            ? '● Published'
                            : '○ Unpublished'}
                        </span>
                      </td>

                      <td
                        className="py-3.5 px-4 text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/organizer/events/${evt.id}`}
                          className="p-1.5 text-[#687086] hover:text-[#625BF6] inline-block"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/organizer/events/${evt.id}/edit`}
                          className="p-1.5 text-[#687086] hover:text-[#625BF6] inline-block"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={(e) => handleTogglePublish(evt, e)}
                          className="p-1.5 text-[#687086] hover:text-[#16856B]"
                          title="Toggle Status"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCancelModalEvent(evt)}
                          className="p-1.5 text-[#687086] hover:text-[#D9485F]"
                          title="Cancel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancelModalEvent && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-[#D9485F]/10 text-[#D9485F] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#171A2B]">
                  Cancel Event: {cancelModalEvent.title}?
                </h3>
                <p className="text-xs text-[#687086] mt-1 leading-relaxed">
                  This action will permanently cancel this event from MongoDB Atlas and revoke
                  ticket slots. This cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalEvent(null)}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#687086] hover:bg-[#F7F8FC] border border-[#E7E9F1]"
                >
                  Keep Event
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#D9485F] hover:bg-[#C23C51] text-white flex items-center gap-1.5"
                >
                  {cancelling ? (
                    <span>Cancelling...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Cancellation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventsManagementPage;
