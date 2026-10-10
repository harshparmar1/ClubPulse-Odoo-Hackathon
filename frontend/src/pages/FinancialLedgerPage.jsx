import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { Receipt, Download, Filter, Plus, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const FinancialLedgerPage = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchLedger = async () => {
    try {
      const [sumRes, txnsRes] = await Promise.all([
        api.get('/api/transactions/summary'),
        api.get('/api/transactions')
      ]);
      setSummary(sumRes);
      setTransactions(txnsRes || []);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleDownloadCsv = async () => {
    try {
      const blob = await api.get('/api/transactions/export/csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clubpulse_ledger_${Date.now()}.csv`;
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
    return matchType && matchCat;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>Traceable Financial Ledger</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Treasury Cash Ledger & Disbursals
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Every rupee accounted for with integer-paise precision to prevent rounding errors.
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Net Liquid Balance"
            value={formatINR(summary?.net_liquid_balance_paise)}
            subtitle="Current bank & cash reserve"
            icon={Receipt}
            color="indigo"
          />
          <StatCard
            title="Total Cash Received"
            value={formatINR(summary?.cash_received_paise)}
            subtitle="Tickets, dues & merch sales"
            icon={ArrowDownLeft}
            color="teal"
          />
          <StatCard
            title="Total Disbursed"
            value={formatINR(summary?.cash_paid_paise)}
            subtitle="Settled reimbursements & vendor ops"
            icon={ArrowUpRight}
            color="rose"
          />
          <StatCard
            title="Committed Obligations"
            value={formatINR(summary?.committed_obligations_paise)}
            subtitle="Approved unpaid expenses"
            icon={Clock}
            color="amber"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-4 h-4" />
            <span>Filter Transactions:</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="membership_dues">Membership Dues</option>
            <option value="ticket_sale">Ticket Sales</option>
            <option value="merchandise">Merchandise</option>
            <option value="logistics">Logistics</option>
            <option value="refreshments">Refreshments</option>
            <option value="production">Production</option>
            <option value="reimbursement">Reimbursement</option>
          </select>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">TXN ID & Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTxns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No transaction records found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredTxns.map((t) => {
                    const isIncome = t.transaction_type === 'income';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-600">
                          <div>#{t.id.slice(-6).toUpperCase()}</div>
                          <div className="text-[10px] text-slate-400">{t.created_at?.slice(0, 10)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isIncome ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {t.transaction_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 capitalize font-semibold text-slate-800">
                          {t.category.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{t.description}</td>
                        <td className="py-3 px-4">
                          <Badge variant={t.status === 'completed' ? 'active' : t.status === 'committed' ? 'warning' : 'neutral'}>
                            {t.status}
                          </Badge>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-extrabold text-sm ${
                            isIncome ? 'text-teal-600' : 'text-slate-900'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatINR(t.amount_paise)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
