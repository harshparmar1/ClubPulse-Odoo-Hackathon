import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Receipt, Plus, CheckCircle2, XCircle, Clock, Check, X, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';

export const ExpensesPage = () => {
  const { user, role } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  // Form states
  const [amountInr, setAmountInr] = useState('');
  const [category, setCategory] = useState('logistics');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isTreasurerOrAdmin = ['treasurer', 'admin'].includes(role);

  const fetchExpenses = async () => {
    try {
      const endpoint = isTreasurerOrAdmin ? '/api/expenses' : '/api/expenses/my-claims';
      const data = await api.get(endpoint);
      setExpenses(data || []);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [role]);

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!amountInr || !description) return;
    setSubmitLoading(true);
    setErrorMsg('');

    try {
      await api.post('/api/expenses/claim', {
        amount_paise: Math.round(Number(amountInr) * 100),
        category,
        description,
        receipt_url: receiptUrl || null
      });
      setClaimModalOpen(false);
      setAmountInr('');
      setDescription('');
      setReceiptUrl('');
      fetchExpenses();
    } catch (err) {
      setErrorMsg(err.message || 'Claim submission failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReview = async (expenseId, action) => {
    try {
      await api.patch(`/api/expenses/${expenseId}/review`, {
        action,
        notes: `Reviewed by ${user?.full_name}`
      });
      fetchExpenses();
    } catch (err) {
      alert(`Review action failed: ${err.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>Reimbursements & Claims</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Expense Reimbursement Claims
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Submit out-of-pocket receipts for chapter event supplies or review pending volunteer claims.
            </p>
          </div>

          <button
            onClick={() => setClaimModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Claim</span>
          </button>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Claim ID & Date</th>
                  <th className="py-3 px-4">Claimant</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Amount</th>
                  {isTreasurerOrAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={isTreasurerOrAdmin ? 7 : 6} className="py-8 text-center text-slate-400">
                      No expense reimbursement claims found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600">
                        <div>#{exp.id.slice(-6).toUpperCase()}</div>
                        <div className="text-[10px] text-slate-400">{exp.created_at?.slice(0, 10)}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{exp.user_name}</td>
                      <td className="py-3 px-4 capitalize">{exp.category}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{exp.description}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            exp.status === 'disbursed'
                              ? 'active'
                              : exp.status === 'approved'
                              ? 'warning'
                              : exp.status === 'rejected'
                              ? 'critical'
                              : 'neutral'
                          }
                        >
                          {exp.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-sm text-slate-900">
                        {formatINR(exp.amount_paise)}
                      </td>
                      {isTreasurerOrAdmin && (
                        <td className="py-3 px-4 text-right space-x-1">
                          {exp.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReview(exp.id, 'approve')}
                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-[11px] font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReview(exp.id, 'reject')}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {exp.status === 'approved' && (
                            <button
                              onClick={() => handleReview(exp.id, 'disburse')}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold"
                            >
                              Disburse Payout
                            </button>
                          )}
                          {exp.status === 'disbursed' && (
                            <span className="text-[11px] text-slate-400 font-medium">Settled</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim Modal */}
        {claimModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Submit Reimbursement Claim</h3>
                <button
                  onClick={() => setClaimModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount Spent in INR (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 1250.00"
                    value={amountInr}
                    onChange={(e) => setAmountInr(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expense Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="logistics">Logistics & Cabling</option>
                    <option value="refreshments">Refreshments & Food</option>
                    <option value="production">AV & Stage Production</option>
                    <option value="printing">Badge & Poster Printing</option>
                    <option value="other">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Purpose
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe what was purchased and which event/initiative it was for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Receipt Image / Cloud Drive URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or image link"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setClaimModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
