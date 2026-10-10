import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, formatINR } from '../api/client';
import { CreditCard, CheckCircle2, Calendar, ShieldCheck, Sparkles, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';

export const MembershipPage = () => {
  const { user, isMember, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleActivateOrRenew = async (durationMonths = 12) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isMember) {
        // Find member id or call renew
        await api.post(`/api/members/${user.id || 'mem_01'}/renew`, {
          duration_months: durationMonths,
          payment_reference: `PAY-${Date.now()}`
        });
        setSuccessMsg(`Membership renewed successfully for ${durationMonths} months!`);
      } else {
        // Create active membership
        await api.post('/api/members', {
          full_name: user?.full_name || 'Student Member',
          email: user?.email,
          roll_number: user?.roll_number || 'STU-2026-001',
          department: 'Computer Science',
          membership_type: durationMonths === 12 ? 'annual' : 'semester',
          dues_paid_paise: durationMonths === 12 ? 50000 : 30000 // ₹500 or ₹300
        });
        setSuccessMsg('Membership activated! 50% discounts are now unlocked.');
      }
      await refreshUser();
    } catch (err) {
      setErrorMsg(err.message || 'Membership update could not be processed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Chapter Credentialing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Membership Status & Renewal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain active membership status to receive 50% ticket discounts, priority event registration, and voting rights.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Membership Status Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-bold">
                CP
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Official Club Card
                </span>
                <h3 className="text-lg font-bold">{user?.full_name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">ID Number</span>
                <span className="font-mono font-semibold">{user?.roll_number || 'STU-2026-001'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Valid Until</span>
                <span className="font-semibold text-teal-300">
                  {user?.membership_expiry ? user.membership_expiry.slice(0, 10) : 'Not Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right space-y-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center md:justify-end gap-2">
              <Badge variant={isMember ? 'active' : 'warning'}>
                {isMember ? 'Active Annual Pass' : 'Pending Dues'}
              </Badge>
            </div>
            <div className="text-xs text-slate-300">
              {isMember ? 'All chapter privileges unlocked' : 'Standard guest privileges only'}
            </div>
          </div>
        </div>

        {/* Benefits Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Annual Membership Tier</h3>
                <p className="text-xs text-slate-500">12 Months Full Chapter Coverage</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-slate-900">₹500.00</span>
                <span className="text-[10px] text-slate-400 block">/ year</span>
              </div>
            </div>

            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>50% discount on all Hackathons and Symposia</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Free entry to technical workshops and agent labs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Voting rights in annual committee executive elections</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Priority merchandise pre-orders & size reservations</span>
              </li>
            </ul>

            <button
              onClick={() => handleActivateOrRenew(12)}
              disabled={loading}
              className="w-full mt-4 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isMember ? 'Renew Annual Pass (12 Mo)' : 'Join Annual Membership (₹500)'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Single Semester Pass</h3>
                <p className="text-xs text-slate-500">6 Months Spring Term Coverage</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-slate-900">₹300.00</span>
                <span className="text-[10px] text-slate-400 block">/ semester</span>
              </div>
            </div>

            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>50% discount on term hackathons</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Access to open volunteer sprint groups</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Official chapter certificate of membership</span>
              </li>
            </ul>

            <button
              onClick={() => handleActivateOrRenew(6)}
              disabled={loading}
              className="w-full mt-4 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isMember ? 'Extend by 6 Months' : 'Get Semester Pass (₹300)'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
