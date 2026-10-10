import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Receipt, Plus, CheckCircle2, XCircle, Clock, Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>Reimbursements & Claims</span>
            </div>
            <h1 className="text-2xl font-bold text-[#171A2B] tracking-tight">
              Expense Reimbursement Claims
            </h1>
            <p className="text-xs text-[#687086] mt-1">
              Submit out-of-pocket receipts for chapter event supplies or review pending volunteer claims.
            </p>
          </div>

          <button
            onClick={() => setClaimModalOpen(true)}
            className="px-4 py-2 bg-[#625BF6] hover:bg-[#5048E5] text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Claim</span>
          </button>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton lines={5} />
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Receipt}
                title="No expense reimbursement claims found"
                description="When volunteers or organizers submit out-of-pocket receipts, they will appear here for review."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8FC] text-[#687086] uppercase font-bold border-b border-[#E7E9F1] text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Claim ID & Date</th>
                    <th className="py-3.5 px-4">Claimant</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Amount</th>
                    {isTreasurerOrAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9F1] font-medium text-[#171A2B]">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#687086]">
                        <div className="text-[#171A2B] font-bold">#{exp.id.slice(-6).toUpperCase()}</div>
                        <div className="text-[10px] text-[#687086]">{exp.created_at?.slice(0, 10)}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#171A2B]">{exp.user_name}</td>
                      <td className="py-3.5 px-4 capitalize text-[#687086]">{exp.category}</td>
                      <td className="py-3.5 px-4 text-[#171A2B] max-w-xs truncate">{exp.description}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            exp.status === 'disbursed'
                              ? 'active'
                              : exp.status === 'approved'
                              ? 'accent'
                              : exp.status === 'rejected'
                              ? 'critical'
                              : 'warning'
                          }
                        >
                          {exp.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sm text-[#171A2B]">
                        {formatINR(exp.amount_paise)}
                      </td>
                      {isTreasurerOrAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          {exp.status === 'submitted' && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleReview(exp.id, 'approve')}
                                className="px-2.5 py-1 rounded-lg bg-[#16856B]/10 hover:bg-[#16856B]/20 text-[#16856B] text-[11px] font-bold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReview(exp.id, 'reject')}
                                className="px-2.5 py-1 rounded-lg bg-[#D9485F]/10 hover:bg-[#D9485F]/20 text-[#D9485F] text-[11px] font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {exp.status === 'approved' && (
                            <button
                              onClick={() => handleReview(exp.id, 'disburse')}
                              className="px-3 py-1 rounded-lg bg-[#625BF6] hover:bg-[#5048E5] text-white text-[11px] font-bold transition-colors"
                            >
                              Disburse Funds
                            </button>
                          )}
                          {['disbursed', 'rejected'].includes(exp.status) && (
                            <span className="text-[11px] text-[#687086] italic">Settled</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Claim Modal */}
        {claimModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full border border-[#E7E9F1] shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E9F1]">
                <h3 className="font-bold text-base text-[#171A2B]">Submit Out-of-Pocket Expense Claim</h3>
                <button
                  onClick={() => setClaimModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#F7F8FC] text-[#687086]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#D9485F]/10 border border-[#D9485F]/20 text-xs text-[#D9485F]">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">
                    Amount Spent (INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1450"
                    value={amountInr}
                    onChange={(e) => setAmountInr(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  >
                    <option value="logistics">Event Logistics & Setup</option>
                    <option value="refreshments">Food & Refreshments</option>
                    <option value="production">Stage, Audio & Production</option>
                    <option value="marketing">Banners & Marketing</option>
                    <option value="stationery">Stationery & Badges</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">
                    Expense Purpose / Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain what was purchased and which event/purpose it served..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">
                    Receipt Photo / Invoice URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or image link"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E9F1]">
                  <button
                    type="button"
                    onClick={() => setClaimModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F1] font-semibold text-[#687086] hover:bg-[#F7F8FC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2 rounded-xl bg-[#625BF6] hover:bg-[#5048E5] text-white font-semibold shadow-2xs disabled:opacity-50"
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
