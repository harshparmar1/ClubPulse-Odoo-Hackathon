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
        await api.post(`/api/members/${user.id || 'mem_01'}/renew`, {
          duration_months: durationMonths,
          payment_reference: `PAY-${Date.now()}`
        });
        setSuccessMsg(`Membership renewed successfully for ${durationMonths} months!`);
      } else {
        await api.post('/api/members', {
          full_name: user?.full_name || 'Student Member',
          email: user?.email,
          roll_number: user?.roll_number || 'STU-2026-001',
          department: 'Computer Science',
          membership_type: durationMonths === 12 ? 'annual' : 'semester',
          dues_paid_paise: durationMonths === 12 ? 50000 : 30000
        });
        setSuccessMsg('Membership activated! 50% ticket discounts are now unlocked.');
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Chapter Credentialing</span>
          </div>
          <h1 className="text-2xl font-bold text-[#171A2B] tracking-tight">
            Membership Status & Renewal
          </h1>
          <p className="text-xs text-[#687086] mt-1">
            Maintain active membership status to receive 50% ticket discounts, priority event registration, and voting rights.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-[#16856B]/10 border border-[#16856B]/20 text-[#16856B] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16856B] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-[#D9485F]/10 border border-[#D9485F]/20 text-[#D9485F] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D9485F] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Digital Membership Pass Card */}
        <div className="p-6 rounded-2xl bg-[#17182B] text-white shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#625BF6]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#625BF6] text-white flex items-center justify-center font-bold shadow-md shadow-[#625BF6]/30">
                CP
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  Official Chapter Credential
                </span>
                <h3 className="text-lg font-bold text-white">{user?.full_name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-white/50 block text-[10px] uppercase tracking-wider">ID Number</span>
                <span className="font-mono font-semibold text-white">{user?.roll_number || 'STU-2026-001'}</span>
              </div>
              <div>
                <span className="text-white/50 block text-[10px] uppercase tracking-wider">Valid Until</span>
                <span className="font-semibold text-[#16856B]">
                  {user?.membership_expiry ? user.membership_expiry.slice(0, 10) : 'Not Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 relative z-10">
            <div className="flex items-center md:justify-end gap-2">
              <Badge variant={isMember ? 'active' : 'warning'}>
                {isMember ? 'Active Annual Pass' : 'Pending Dues'}
              </Badge>
            </div>
            <div className="text-xs text-white/70">
              {isMember ? 'All chapter privileges unlocked' : 'Standard guest privileges only'}
            </div>
            <button
              onClick={() => handleActivateOrRenew(12)}
              disabled={loading}
              className="px-4 py-2 bg-[#625BF6] hover:bg-[#5048E5] text-white font-semibold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : isMember ? 'Renew For 1 Year (₹500)' : 'Activate Pass (₹500)'}
            </button>
          </div>
        </div>

        {/* Benefits Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E7E9F1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#171A2B] text-sm">Annual Membership Tier</h3>
                <p className="text-xs text-[#687086]">12 Months Full Chapter Coverage</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#171A2B]">₹500.00</span>
                <span className="text-[10px] text-[#687086] block">/ year</span>
              </div>
            </div>

            <ul className="text-xs text-[#687086] space-y-2.5 pt-2 border-t border-[#E7E9F1]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16856B] shrink-0" />
                <span>50% discount on all Hackathons and Symposia</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16856B] shrink-0" />
                <span>Free entry to technical workshops and agent labs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16856B] shrink-0" />
                <span>Priority registration for limited-capacity venues</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16856B] shrink-0" />
                <span>Voting rights in annual executive committee elections</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E7E9F1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#171A2B] text-sm">Semester Membership Tier</h3>
                <p className="text-xs text-[#687086]">6 Months Chapter Coverage</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#171A2B]">₹300.00</span>
                <span className="text-[10px] text-[#687086] block">/ semester</span>
              </div>
            </div>

            <ul className="text-xs text-[#687086] space-y-2.5 pt-2 border-t border-[#E7E9F1]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16856B] shrink-0" />
                <span>50% discount on all chapter events in term</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16856B] shrink-0" />
                <span>Member-only volunteer and coordinator roles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16856B] shrink-0" />
                <span>Direct access to project mentors and sponsors</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
