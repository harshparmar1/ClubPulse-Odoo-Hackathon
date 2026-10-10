import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Mail,
  ShieldCheck,
  AlertCircle,
  Users,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const VolunteerRegistrationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const showToast = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsData, eventsData] = await Promise.all([
        api.get('/api/events/volunteer-applications').catch(() => []),
        api.get('/api/events').catch(() => [])
      ]);
      setApplications(appsData || []);
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Failed to load volunteer applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id, studentName, eventTitle) => {
    setProcessingId(id);
    try {
      await api.post(`/api/events/volunteer-applications/${id}/approve`);
      showToast(`Approved ${studentName} as volunteer for "${eventTitle}".`, 'success');
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'approved', reviewed_by: user?.full_name || 'Admin' } : app))
      );
    } catch (err) {
      showToast(`Approval failed: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id, studentName) => {
    setProcessingId(id);
    try {
      await api.post(`/api/events/volunteer-applications/${id}/reject`);
      showToast(`Rejected volunteer application for ${studentName}.`, 'warning');
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'rejected', reviewed_by: user?.full_name || 'Admin' } : app))
      );
    } catch (err) {
      showToast(`Action failed: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.user_roll || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.event_title || '').toLowerCase().includes(search.toLowerCase());

    const matchesEvent = eventFilter === 'all' || app.event_id === eventFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesEvent && matchesStatus;
  });

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  return (
    <DashboardLayout pageTitle="Volunteer Registrations & Selection">
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Toast Alert */}
        {notice && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-sm transition-all ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : notice.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notice.msg}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-current opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Chapter Volunteer Management</span>
            </div>
            <h1 className="text-2xl font-bold text-[#171A2B] tracking-tight">
              Volunteer Registrations
            </h1>
            <p className="text-xs text-[#687086] mt-1">
              Select and approve student volunteer applicants for campus competitions and flagship events.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-[#E7E9F1] bg-white hover:bg-[#F7F8FC] text-xs font-semibold text-[#171A2B] flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E7E9F1] shadow-2xs">
            <span className="text-[11px] font-semibold text-[#8B93A7] uppercase tracking-wider">
              Total Applicants
            </span>
            <div className="text-2xl font-black text-[#171A2B] mt-1">
              {applications.length}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Selection</span>
            </span>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {pendingCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved Volunteers</span>
            </span>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              {approvedCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E7E9F1] shadow-2xs">
            <span className="text-[11px] font-semibold text-[#8B93A7] uppercase tracking-wider">
              Declined
            </span>
            <div className="text-2xl font-black text-[#687086] mt-1">
              {rejectedCount}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#E7E9F1] shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-[#8B93A7] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Event Filter */}
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] font-semibold focus:outline-none"
            >
              <option value="all">All Events ({events.length})</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-[#F7F8FC] p-1 rounded-xl border border-[#E7E9F1]">
              {['all', 'pending', 'approved', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-[#171A2B] text-white shadow-2xs'
                      : 'text-[#687086] hover:text-[#171A2B]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Volunteer Registrations Table */}
        <div className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton lines={6} />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={UserCheck}
                title="No volunteer applications found"
                description={
                  statusFilter === 'pending'
                    ? 'No pending applications awaiting review.'
                    : 'Try clearing your search or event filter criteria.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8FC] text-[#687086] uppercase font-bold border-b border-[#E7E9F1] text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4">Event Applied For</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Selection Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9F1] font-medium text-[#171A2B]">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#171A2B] flex items-center gap-2">
                          <span>{app.user_name}</span>
                          {app.user_roll && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#EEEDFE] text-[#625BF6]">
                              {app.user_roll}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#687086] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#8B93A7]" />
                          <span>{app.user_email}</span>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#171A2B]">
                          {app.event_title}
                        </div>
                        <div className="text-[11px] text-[#8B93A7] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{app.event_date ? app.event_date.slice(0, 10) : 'TBD'}</span>
                          {app.venue && (
                            <>
                              <span className="mx-1">•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{app.venue}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="py-3.5 px-4 text-[#687086]">
                        {app.created_at ? app.created_at.slice(0, 10) : 'Recent'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            app.status === 'approved'
                              ? 'positive'
                              : app.status === 'rejected'
                              ? 'critical'
                              : 'warning'
                          }
                        >
                          {app.status === 'pending' ? 'Pending Review' : app.status}
                        </Badge>
                        {app.reviewed_by && (
                          <div className="text-[10px] text-[#8B93A7] mt-0.5">
                            By: {app.reviewed_by}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {app.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(app.id, app.user_name, app.event_title)}
                              disabled={processingId === app.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="Approve as volunteer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Select / Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(app.id, app.user_name)}
                              disabled={processingId === app.id}
                              className="px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Decline application"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : app.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Confirmed Volunteer</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApprove(app.id, app.user_name, app.event_title)}
                            disabled={processingId === app.id}
                            className="px-2.5 py-1 rounded-lg border border-[#E7E9F1] hover:border-emerald-600 text-xs text-[#687086] hover:text-emerald-700 transition-colors"
                          >
                            Re-approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default VolunteerRegistrationsPage;
