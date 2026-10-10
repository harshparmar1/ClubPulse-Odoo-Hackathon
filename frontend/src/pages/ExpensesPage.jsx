import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Receipt,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const ExpensesPage = () => {
  const { user, role, isVolunteer } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Form states
  const [amountInr, setAmountInr] = useState('');
  const [category, setCategory] = useState('logistics');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isOrganizer = role === 'organizer';
  const isTreasurer = role === 'treasurer';
  const canReview = ['organizer', 'treasurer', 'admin'].includes(role);

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // Organizers, Treasurers, and Admins fetch all claims; volunteers fetch their own
      const endpoint = canReview ? '/api/expenses' : '/api/expenses/my-claims';
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
  }, [role, isVolunteer, user]);

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
      showNotice('Reimbursement claim submitted successfully.');
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
        notes: `Reviewed by ${user?.full_name || 'Organizer'}`
      });
      showNotice(`Claim ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'updated'} successfully.`);
      fetchExpenses();
    } catch (err) {
      alert(`Review action failed: ${err.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-100" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>{isOrganizer ? 'Volunteer Claims & Reimbursements' : 'Reimbursements & Claims'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171A2B] tracking-tight">
              {isOrganizer ? 'Volunteer Reimbursement Claims' : 'Expense Reimbursement Claims'}
            </h1>
            <p className="text-xs sm:text-sm text-[#687086] mt-1">
              {isOrganizer
                ? 'Review out-of-pocket expense claims and complaints submitted by event volunteers.'
                : 'Submit out-of-pocket receipts for chapter event supplies or track pending claims.'}
            </p>
          </div>

          {/* Remove "Submit New Claim" on Organizer side. Only show for Volunteers / Members */}
          {!isOrganizer && (
            <button
              onClick={() => setClaimModalOpen(true)}
              className="px-4 py-2.5 bg-[#625BF6] hover:bg-[#5048E5] text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Claim</span>
            </button>
          )}
        </div>

        {/* Organizer Notice Banner */}
        {isOrganizer && (
          <div className="p-4 rounded-2xl bg-[#EEEDFE]/60 border border-[#625BF6]/20 flex items-start gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#625BF6]/10 text-[#625BF6] flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck className="w-5 h-5 text-[#625BF6]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#171A2B]">
                Volunteer Claims Inbox
              </h4>
              <p className="text-[11px] text-[#687086] mt-0.5 leading-relaxed">
                Out-of-pocket expense reimbursement claims and complaints raised by volunteers are displayed below for organizer review and operational approval. Organizers do not submit claims here.
              </p>
            </div>
          </div>
        )}

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton lines={5} />
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-16 text-center">
              <EmptyState
                icon={Receipt}
                title={isOrganizer ? "No volunteer reimbursement claims found" : "No expense reimbursement claims found"}
                description={
                  isOrganizer
                    ? "When volunteers submit out-of-pocket event expense claims or complaints, they will display here."
                    : "Click 'Submit New Claim' to submit your out-of-pocket receipts."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8FC] text-[#687086] uppercase font-bold border-b border-[#E7E9F1] text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Claim ID & Date</th>
                    <th className="py-3.5 px-4">Volunteer / Claimant</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Receipt</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    {canReview && <th className="py-3.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9F1] font-medium text-[#171A2B]">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#687086]">
                        <div className="text-[#171A2B] font-bold">#{exp.id.slice(-6).toUpperCase()}</div>
                        <div className="text-[10px] text-[#687086]">{exp.created_at?.slice(0, 10)}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#171A2B] flex items-center gap-1.5">
                          <span>{exp.user_name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Volunteer
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8B93A7]">{exp.user_email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F7F8FC] border border-[#E7E9F1] capitalize text-[#687086]">
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#171A2B] max-w-xs">
                        <div className="truncate" title={exp.description}>{exp.description}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {exp.receipt_url ? (
                          <a
                            href={exp.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#625BF6] hover:underline"
                          >
                            <span>View Bill</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#8B93A7]">No Attachment</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-sm text-[#171A2B]">
                        {formatINR(exp.amount_paise)}
                      </td>

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
                          {exp.status === 'pending' || exp.status === 'submitted'
                            ? 'Pending Review'
                            : exp.status}
                        </Badge>
                      </td>

                      {canReview && (
                        <td className="py-3.5 px-4 text-right">
                          {['pending', 'submitted'].includes(exp.status) && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleReview(exp.id, 'approve')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReview(exp.id, 'reject')}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white text-[11px] font-bold transition-colors cursor-pointer border border-rose-200"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {exp.status === 'approved' && isTreasurer && (
                            <button
                              type="button"
                              onClick={() => handleReview(exp.id, 'disburse')}
                              className="px-3 py-1 rounded-lg bg-[#625BF6] hover:bg-[#5048E5] text-white text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Disburse Funds
                            </button>
                          )}
                          {exp.status === 'approved' && !isTreasurer && (
                            <span className="text-[11px] text-emerald-700 font-semibold">
                              Approved
                            </span>
                          )}
                          {['disbursed', 'rejected'].includes(exp.status) && (
                            <span className="text-[11px] text-[#687086] italic">
                              {exp.status === 'disbursed' ? 'Settled' : 'Rejected'}
                            </span>
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

        {/* Claim Modal (For Volunteers/Students when submitting claims) */}
        {claimModalOpen && !isOrganizer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full border border-[#E7E9F1] shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E9F1]">
                <h3 className="font-bold text-base text-[#171A2B]">Submit Out-of-Pocket Expense Claim</h3>
                <button
                  type="button"
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
                    <option value="travel">Volunteer Travel / Conveyance</option>
                    <option value="supplies">Print, Stationery & Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">Description & Reason *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Specify what items were purchased and why..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">
                    Receipt / Invoice Link (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or image link"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setClaimModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#687086] hover:bg-[#F7F8FC] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-4 py-2 text-xs font-bold bg-[#625BF6] hover:bg-[#5048E5] text-white rounded-xl shadow-2xs transition-colors"
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
