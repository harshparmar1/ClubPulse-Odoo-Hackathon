import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Users,
  Ticket,
  Box,
  CheckSquare,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const HandoverReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchHandoverReport = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/reports/handover');
      setReport(data);
    } catch (err) {
      console.error('Failed to load handover report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandoverReport();
  }, []);

  const handleDownloadCsv = async () => {
    setExporting(true);
    try {
      const blob = await api.get('/api/reports/handover/export/csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clubpulse_handover_report_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-700 mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Executive Continuity Protocol</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Semester Handover & Audit Report
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verifiable transition briefing for incoming student committee presidents, treasurers, and advisors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCsv}
              disabled={exporting}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Exporting...' : 'Download CSV Ledger'}</span>
            </button>
          </div>
        </div>

        {/* Term & Timestamp Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Session</span>
            <span className="font-bold text-slate-900 text-sm">{report?.academic_term}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Audit Timestamp</span>
            <span className="font-mono text-slate-600">{report?.generated_at?.slice(0, 19).replace('T', ' ')} UTC</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Audit Status</span>
            <span className="text-teal-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Reconciled & Certified
            </span>
          </div>
        </div>

        {/* Financial Flow Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Financial Ledger Reconciliation</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Values in INR (Integer Paise Precision)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Opening Liquid Cash</span>
              <div className="text-lg font-extrabold text-slate-900 mt-1">
                {formatINR(report?.opening_liquid_cash_paise)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200">
              <span className="text-[10px] font-bold uppercase text-teal-700">Total Term Income</span>
              <div className="text-lg font-extrabold text-teal-700 mt-1">
                +{formatINR(report?.total_income_paise)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
              <span className="text-[10px] font-bold uppercase text-rose-700">Total Disbursements</span>
              <div className="text-lg font-extrabold text-rose-700 mt-1">
                -{formatINR(report?.total_expenses_paise)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-[10px] font-bold uppercase text-indigo-700">Closing Liquid Balance</span>
              <div className="text-lg font-extrabold text-indigo-900 mt-1">
                {formatINR(report?.closing_liquid_cash_paise)}
              </div>
            </div>
          </div>

          {/* Obligations & Receivables */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 font-medium">Pending Member Receivables:</span>
              <div className="text-sm font-bold text-slate-800">
                {formatINR(report?.pending_receivables_paise)}
              </div>
              <p className="text-[11px] text-slate-400">Unconfirmed dues or orders</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 font-medium">Outstanding Reimbursements:</span>
              <div className="text-sm font-bold text-amber-600">
                {formatINR(report?.outstanding_reimbursements_paise)}
              </div>
              <p className="text-[11px] text-slate-400">Claims submitted awaiting review</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 font-medium">Committed Future Obligations:</span>
              <div className="text-sm font-bold text-slate-800">
                {formatINR(report?.active_commitments_paise)}
              </div>
              <p className="text-[11px] text-slate-400">Approved vendor obligations</p>
            </div>
          </div>
        </div>

        {/* Operational & Assets Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Operations & Events */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Event Attendance & Memberships</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Active Registered Members:</span>
                <strong className="text-slate-900">{report?.active_members_count} / {report?.total_registered_members}</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Events Conducted in Term:</span>
                <strong className="text-slate-900">{report?.total_events_conducted}</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Total Tickets Issued:</span>
                <strong className="text-slate-900">{report?.total_tickets_issued}</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Verified QR Gate Attendances:</span>
                <strong className="text-teal-700">{report?.total_attendance_verified}</strong>
              </div>
            </div>
          </div>

          {/* Merchandise Inventory & Tasks */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Physical Assets & Task Status</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Inventory Product Catalog Items:</span>
                <strong className="text-slate-900">{report?.inventory_items_count} SKUs</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Remaining Merch Asset Valuation:</span>
                <strong className="text-slate-900">{formatINR(report?.total_inventory_valuation_paise)}</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Pending Volunteer Tasks:</span>
                <strong className="text-slate-900">{report?.pending_tasks_count}</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Critical Overdue Items:</span>
                <strong className={report?.critical_overdue_tasks_count > 0 ? 'text-rose-600' : 'text-teal-600'}>
                  {report?.critical_overdue_tasks_count}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Recommendations & Audit Notes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Executive Transition Recommendations</h3>
            <div className="space-y-2">
              {report?.executive_recommendations?.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Audit Verification Notes</h3>
            <div className="space-y-1.5 text-xs text-slate-500">
              {report?.audit_notes?.map((note, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
