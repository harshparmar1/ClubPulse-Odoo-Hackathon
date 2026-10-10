import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { Users, Search, Filter, RefreshCw, CheckCircle2, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Official Chapter Registry</span>
            </div>
            <h1 className="text-2xl font-bold text-[#171A2B] tracking-tight">
              Member Roster & Registry
            </h1>
            <p className="text-xs text-[#687086] mt-1">
              Verify student dues, departments, validity terms, and manual renewals.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E7E9F1] shadow-2xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#687086] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#687086] font-medium">Status:</span>
            {['all', 'active', 'pending', 'expired'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-[#171A2B] text-white'
                    : 'bg-[#F7F8FC] text-[#687086] hover:bg-[#E7E9F1]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton lines={5} />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Users}
                title="No members match criteria"
                description="Try clearing search filters or registering new students in the club registry."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8FC] text-[#687086] uppercase font-bold border-b border-[#E7E9F1] text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Member Info</th>
                    <th className="py-3.5 px-4">Roll / ID</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Valid Until</th>
                    <th className="py-3.5 px-4">Dues Paid</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9F1] font-medium text-[#171A2B]">
                  {filteredMembers.map((mem) => (
                    <tr key={mem.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#171A2B]">{mem.full_name}</div>
                        <div className="text-[11px] text-[#687086] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#687086]" />
                          <span>{mem.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#171A2B]">
                        {mem.roll_number}
                      </td>
                      <td className="py-3.5 px-4 text-[#687086]">{mem.department || 'General'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={mem.status === 'active' ? 'active' : mem.status === 'expired' ? 'critical' : 'warning'}>
                          {mem.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#687086]">
                        {mem.valid_until ? mem.valid_until.slice(0, 10) : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#16856B]">
                        {formatINR(mem.dues_paid_paise)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRenewMember(mem.id)}
                          disabled={renewLoadingId === mem.id}
                          className="px-3 py-1.5 rounded-xl border border-[#E7E9F1] hover:border-[#625BF6] hover:bg-[#625BF6]/5 font-semibold text-[#625BF6] transition-colors disabled:opacity-50"
                        >
                          {renewLoadingId === mem.id ? 'Renewing...' : 'Renew 1 Yr'}
                        </button>
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
