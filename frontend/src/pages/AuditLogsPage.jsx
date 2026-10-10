import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import {
  FileSpreadsheet,
  Clock,
  User,
  Shield,
  Search,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const AuditLogsPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit-logs?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    return (
      log.user_email?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.summary?.toLowerCase().includes(q) ||
      log.entity_type?.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell pageTitle="Operational Governance & Audit Trail">
      <div className="space-y-6">
        {/* Header Overview Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E9F1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#625BF6]/10 text-[#625BF6]">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-[#171A2B] tracking-tight">
                Immutable Governance & Audit Trail
              </h1>
            </div>
            <p className="text-xs text-[#687086] mt-1 max-w-2xl leading-relaxed">
              Cryptographically verified operation ledger tracking all status changes, risk acknowledgments, and financial reviews. Protected against retroactive mutation.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#687086]">Verified Audit Events:</span>
            <div className="text-2xl font-black text-[#171A2B]">{total}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#E7E9F1] shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-[#687086]" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, entity type, or change summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-[#171A2B] bg-transparent focus:outline-hidden"
          />
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-[#E7E9F1] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-3 border-[#625BF6] border-t-transparent rounded-full mx-auto"></div>
              <p className="text-xs text-[#687086] mt-3">Loading immutable audit log records...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#687086]">
              No audit log entries match your filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F8FC] border-b border-[#E7E9F1] text-[10px] font-bold uppercase tracking-wider text-[#687086]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor & Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Summary</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F8] text-xs">
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr className="hover:bg-[#F7F8FC]/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#687086] whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#171A2B]">{log.user_email}</div>
                            <span className="text-[10px] uppercase font-semibold text-[#625BF6]">
                              {log.user_role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant="accent">{log.action}</Badge>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#687086]">
                            {log.entity_type} / {log.entity_id.slice(0, 10)}...
                          </td>
                          <td className="py-3.5 px-4 text-[#171A2B] font-medium max-w-md truncate">
                            {log.summary}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="p-1 text-[#687086] hover:text-[#625BF6] rounded-lg hover:bg-[#F3F4F8]"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-[#F7F8FC]">
                            <td colSpan={6} className="p-4 border-b border-[#E7E9F1]">
                              <div className="text-[11px] font-bold text-[#687086] mb-1 uppercase tracking-wider">
                                Operation Payload Snapshot
                              </div>
                              <pre className="p-3 rounded-xl bg-white border border-[#E7E9F1] font-mono text-[11px] text-[#171A2B] overflow-x-auto">
                                {JSON.stringify(log.payload || {}, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
