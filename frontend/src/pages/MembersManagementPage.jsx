import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { Users, Search, Filter, RefreshCw, CheckCircle2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';

export const MembersManagementPage = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [renewLoadingId, setRenewLoadingId] = useState(null);

  const fetchMembers = async () => {
    try {
      const data = await api.get('/api/members');
      setMembers(data || []);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRenewMember = async (memberId) => {
    setRenewLoadingId(memberId);
    try {
      await api.post(`/api/members/${memberId}/renew`, {
        duration_months: 12,
        payment_reference: `MANUAL-RENEW-${Date.now()}`
      });
      fetchMembers();
    } catch (err) {
      alert(`Renewal failed: ${err.message}`);
    } finally {
      setRenewLoadingId(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.roll_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Official Chapter Registry</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Member Roster & Registry
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify student dues, departments, validity terms, and manual renewals.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Status:</span>
            {['all', 'active', 'pending', 'expired'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member Info</th>
                  <th className="py-3 px-4">Roll / ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Dues Paid</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No members matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((mem) => (
                    <tr key={mem.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{mem.full_name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{mem.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {mem.roll_number}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{mem.department || 'General'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={mem.status === 'active' ? 'active' : mem.status === 'expired' ? 'critical' : 'warning'}>
                          {mem.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {mem.expiry_date ? mem.expiry_date.slice(0, 10) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatINR(mem.dues_paid_paise)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRenewMember(mem.id)}
                          disabled={renewLoadingId === mem.id}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          {renewLoadingId === mem.id ? 'Renewing...' : 'Renew 1 Year'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
