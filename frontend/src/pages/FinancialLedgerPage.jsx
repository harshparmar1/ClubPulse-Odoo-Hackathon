import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Receipt,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Search,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Table
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const FinancialLedgerPage = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('INSIGHTS'); // 'INSIGHTS' or 'TRANSACTIONS'
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const [sumRes, txnsRes, insRes] = await Promise.all([
        api.get('/api/transactions/summary'),
        api.get('/api/transactions'),
        fetch('/api/transactions/explainable-insights', {
          headers: { Authorization: `Bearer ${token}` }
        }).then((r) => (r.ok ? r.json() : null))
      ]);
      setSummary(sumRes);
      setTransactions(txnsRes || []);
      setInsights(insRes);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [token]);

  const handleDownloadCsv = async () => {
    try {
      const blob = await api.get('/api/transactions/export/csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skyline_ledger_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const filteredTxns = transactions.filter((t) => {
    const matchType = filterType === 'all' || t.transaction_type === filterType;
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    const matchSearch =
      !search ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchType && matchCat && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>Phase 4: Explainable Financial Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold text-[#171A2B] tracking-tight">
              Treasury Workspace & Reconciled Records
            </h1>
            <p className="text-xs text-[#687086] mt-1">
              Every rupee accounted for with integer-paise precision to eliminate rounding leakage. Rule-based explainability across liquid cash, commitments, and dues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 bg-[#171A2B] hover:bg-[#17182B] text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle: Explainable Insights vs Raw Ledger */}
        <div className="flex items-center gap-3 border-b border-[#E7E9F1] pb-3">
          <button
            onClick={() => setActiveTab('INSIGHTS')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'INSIGHTS'
                ? 'bg-[#625BF6] text-white shadow-xs'
                : 'bg-white text-[#687086] border border-[#E7E9F1] hover:bg-[#F7F8FC]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable Financial Insights</span>
          </button>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-[#625BF6] text-white shadow-xs'
                : 'bg-white text-[#687086] border border-[#E7E9F1] hover:bg-[#F7F8FC]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Reconciled Transactions ({transactions.length})</span>
          </button>
        </div>

        {/* Tab 1: Explainable Financial Insights */}
        {activeTab === 'INSIGHTS' && (
          <div className="space-y-6">
            {/* Top Insight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E7E9F1] shadow-xs">
                <span className="text-[11px] font-bold text-[#687086] uppercase tracking-wider">
                  Available Liquid Cash
                </span>
                <div className="text-2xl font-black text-[#16856B] mt-1">
                  {formatINR(insights?.available_cash_paise ?? summary?.net_liquid_balance_paise)}
                </div>
                <div className="text-[11px] text-[#687086] mt-1">
                  Received minus disbursed payouts
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E7E9F1] shadow-xs">
                <span className="text-[11px] font-bold text-[#687086] uppercase tracking-wider">
                  Projected Total Income
                </span>
                <div className="text-2xl font-black text-[#171A2B] mt-1">
                  {formatINR(insights?.projected_income_paise)}
                </div>
                <div className="text-[11px] text-[#687086] mt-1">
                  Includes {formatINR(insights?.outstanding_member_dues_paise)} uncollected dues
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E7E9F1] shadow-xs">
                <span className="text-[11px] font-bold text-[#687086] uppercase tracking-wider">
                  Pending Reimbursements
                </span>
                <div className="text-2xl font-black text-[#C97A16] mt-1">
                  {formatINR(insights?.pending_reimbursements_paise)}
                </div>
                <div className="text-[11px] text-[#687086] mt-1">
                  Unreviewed member expense claims
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E7E9F1] shadow-xs">
                <span className="text-[11px] font-bold text-[#687086] uppercase tracking-wider">
                  Committed Obligations
                </span>
                <div className="text-2xl font-black text-[#D9485F] mt-1">
                  {formatINR(insights?.upcoming_commitments_paise)}
                </div>
                <div className="text-[11px] text-[#687086] mt-1">
                  Approved catering & venue purchase orders
                </div>
              </div>
            </div>

            {/* Event-Level Projected Surplus or Deficit Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E9F1] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#171A2B]">
                    Event-Level Surplus & Deficit Analysis
                  </h3>
                  <p className="text-xs text-[#687086]">
                    Comparing projected event revenue versus approved and actual expenses
                  </p>
                </div>
                <Badge variant="accent">Deterministic Accounting</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F7F8FC] border-b border-[#E7E9F1] text-[10px] font-bold uppercase tracking-wider text-[#687086]">
                      <th className="py-2.5 px-3">Event Title</th>
                      <th className="py-2.5 px-3">Budget Allocated</th>
                      <th className="py-2.5 px-3">Actual Outlays</th>
                      <th className="py-2.5 px-3">Projected Ticket Intake</th>
                      <th className="py-2.5 px-3">Net Projected Margin</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F8]">
                    {insights?.event_insights?.map((ei) => (
                      <tr key={ei.event_id} className="hover:bg-[#F7F8FC]/50">
                        <td className="py-3 px-3 font-bold text-[#171A2B]">{ei.title}</td>
                        <td className="py-3 px-3 font-mono">{formatINR(ei.budget_paise)}</td>
                        <td className="py-3 px-3 font-mono">{formatINR(ei.actual_expenses_paise)}</td>
                        <td className="py-3 px-3 font-mono text-[#16856B]">
                          {formatINR(ei.projected_revenue_paise)}
                        </td>
                        <td
                          className={`py-3 px-3 font-mono font-bold ${
                            ei.is_surplus ? 'text-[#16856B]' : 'text-[#D9485F]'
                          }`}
                        >
                          {formatINR(ei.projected_surplus_deficit_paise)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Badge
                            variant={
                              ei.status === 'healthy'
                                ? 'positive'
                                : ei.status === 'warning'
                                ? 'warning'
                                : 'critical'
                            }
                          >
                            {ei.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historical Limitation Transparency & Treasurer Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Historical Data Limitation Notice */}
              <div className="bg-[#F7F8FC] p-5 rounded-2xl border border-[#E7E9F1] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#171A2B]">
                  <Info className="w-4 h-4 text-[#625BF6]" />
                  <span>Historical Data Boundary (Transparent Accounting)</span>
                </div>
                <p className="text-xs text-[#687086] leading-relaxed">
                  {insights?.historical_comparison?.limitation_statement ||
                    'Only single-semester operational records exist. Historical multi-year variance trends are withheld to avoid fabricated forecasting.'}
                </p>
                <div className="text-[11px] font-mono text-[#625BF6] pt-1">
                  Active Operational Scope: {insights?.historical_comparison?.period_label}
                </div>
              </div>

              {/* Actionable Treasurer Guidance */}
              <div className="bg-white p-5 rounded-2xl border border-[#E7E9F1] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#171A2B]">
                  <CheckCircle2 className="w-4 h-4 text-[#16856B]" />
                  <span>Treasurer Operational Directives</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#171A2B]">
                  {insights?.treasurer_recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#625BF6] font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Raw Transactions Ledger */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E7E9F1] shadow-2xs text-xs">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[#687086] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search description or TXN ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] font-semibold text-[#171A2B] focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expenses Only</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] font-semibold text-[#171A2B] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="ticket_sale">Ticket Sales</option>
                  <option value="membership_dues">Membership Dues</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="logistics">Logistics</option>
                  <option value="refreshments">Refreshments</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden">
              {filteredTxns.length === 0 ? (
                <EmptyState
                  title="No transactions found"
                  description="Try adjusting your filters or search query."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F7F8FC] border-b border-[#E7E9F1] text-[10px] font-bold uppercase tracking-wider text-[#687086]">
                        <th className="py-3 px-4">TXN ID</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Amount (INR)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F8]">
                      {filteredTxns.map((t) => {
                        const isIncome = t.transaction_type === 'income';
                        return (
                          <tr key={t.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] font-bold text-[#171A2B]">
                              {t.id}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 font-semibold ${
                                  isIncome ? 'text-[#16856B]' : 'text-[#D9485F]'
                                }`}
                              >
                                {isIncome ? (
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                )}
                                <span className="capitalize">{t.transaction_type}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 capitalize font-medium text-[#171A2B]">
                              {t.category.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-4 text-[#171A2B] font-medium max-w-xs truncate">
                              {t.description}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-sm">
                              <span className={isIncome ? 'text-[#16856B]' : 'text-[#D9485F]'}>
                                {isIncome ? '+' : '-'}
                                {formatINR(t.amount_paise)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  t.status === 'completed'
                                    ? 'positive'
                                    : t.status === 'committed'
                                    ? 'warning'
                                    : 'neutral'
                                }
                              >
                                {t.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-[#687086] text-[11px] whitespace-nowrap">
                              {new Date(t.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FinancialLedgerPage;
