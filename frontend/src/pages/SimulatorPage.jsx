import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import {
  SlidersHorizontal,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw,
  ShieldAlert,
  Info,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

export const SimulatorPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  // Scenario parameters
  const [targetCapacity, setTargetCapacity] = useState(250);
  const [memberPriceInr, setMemberPriceInr] = useState(150);
  const [nonMemberPriceInr, setNonMemberPriceInr] = useState(300);
  const [attendanceRate, setAttendanceRate] = useState(85);
  const [memberRatio, setMemberRatio] = useState(60);
  const [estimatedExpensesInr, setEstimatedExpensesInr] = useState(35000);
  const [reserveThresholdInr, setReserveThresholdInr] = useState(10000);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');

  // Initial load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.get('/api/events');
        setEvents(data || []);
        if (data && data.length > 0) {
          const ev = data[0];
          setSelectedEventId(ev.id);
          setTargetCapacity(ev.capacity || 200);
          setMemberPriceInr(Math.round(ev.member_price_paise / 100));
          setNonMemberPriceInr(Math.round(ev.non_member_price_paise / 100));
          setEstimatedExpensesInr(Math.round((ev.estimated_budget_paise || 2000000) / 100));
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    fetchEvents();
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    setApplySuccess('');
    try {
      const payload = {
        event_id: selectedEventId || null,
        target_capacity: Number(targetCapacity),
        member_price_paise: Number(memberPriceInr) * 100,
        non_member_price_paise: Number(nonMemberPriceInr) * 100,
        expected_attendance_rate: Number(attendanceRate) / 100,
        member_ratio: Number(memberRatio) / 100,
        estimated_expenses_paise: Number(estimatedExpensesInr) * 100,
        reserve_threshold_paise: Number(reserveThresholdInr) * 100
      };
      const res = await api.post('/api/simulator/simulate', payload);
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [
    selectedEventId,
    targetCapacity,
    memberPriceInr,
    nonMemberPriceInr,
    attendanceRate,
    memberRatio,
    estimatedExpensesInr,
    reserveThresholdInr
  ]);

  const handleResetToBaseline = () => {
    const ev = events.find((x) => x.id === selectedEventId);
    if (ev) {
      setTargetCapacity(ev.capacity || 200);
      setMemberPriceInr(Math.round(ev.member_price_paise / 100));
      setNonMemberPriceInr(Math.round(ev.non_member_price_paise / 100));
      setEstimatedExpensesInr(Math.round((ev.estimated_budget_paise || 2000000) / 100));
      setAttendanceRate(85);
      setMemberRatio(60);
    }
  };

  const handleApplyChanges = async () => {
    if (!selectedEventId) return;
    setApplyLoading(true);
    try {
      const res = await api.post('/api/simulator/apply', {
        event_id: selectedEventId,
        capacity: Number(targetCapacity),
        member_price_paise: Number(memberPriceInr) * 100,
        non_member_price_paise: Number(nonMemberPriceInr) * 100,
        estimated_budget_paise: Number(estimatedExpensesInr) * 100
      });
      setApplySuccess(res.message);
      setConfirmOpen(false);
      const data = await api.get('/api/events');
      setEvents(data || []);
    } catch (err) {
      alert(`Could not apply scenario: ${err.message}`);
    } finally {
      setApplyLoading(false);
    }
  };

  const chartData = [
    {
      metric: 'Forecast Revenue',
      Current: simResult?.current_plan ? simResult.current_plan.projected_revenue_paise / 100 : 0,
      Simulated: simResult?.proposed_scenario ? simResult.proposed_scenario.projected_revenue_paise / 100 : 0
    },
    {
      metric: 'Budget Costs',
      Current: simResult?.current_plan ? simResult.current_plan.estimated_expenses_paise / 100 : 0,
      Simulated: simResult?.proposed_scenario ? simResult.proposed_scenario.estimated_expenses_paise / 100 : 0
    },
    {
      metric: 'Net Surplus / Deficit',
      Current: simResult?.current_plan ? simResult.current_plan.projected_surplus_paise / 100 : 0,
      Simulated: simResult?.proposed_scenario ? simResult.proposed_scenario.projected_surplus_paise / 100 : 0
    }
  ];

  return (
    <DashboardLayout
      pageTitle="Live Club Simulator"
      breadcrumbs={[{ label: 'Intelligence' }, { label: 'Simulator' }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E7E9F1]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EEEDFE] text-[#625BF6] border border-[#D4D1FD] text-xs font-semibold mb-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Non-Mutating Sandbox</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#171A2B] tracking-tight">
              Event Financial & Capacity Simulator
            </h1>
            <p className="text-xs text-[#687086] mt-0.5">
              Test hypothetical ticket yields, capacity adjustments, and break-even points before committing club reserves.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              onClick={handleResetToBaseline}
              className="px-3.5 py-2 border border-[#E7E9F1] bg-white hover:bg-[#F7F8FC] text-[#171A2B] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#687086]" />
              <span>Reset Baseline</span>
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!selectedEventId}
              className="px-4 py-2 bg-[#625BF6] hover:bg-[#5048E5] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply to Event</span>
            </button>
          </div>
        </div>

        {applySuccess && (
          <div className="p-3.5 rounded-xl bg-[#E7F5F0] border border-[#BCE4D7] text-[#16856B] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{applySuccess}</span>
          </div>
        )}

        {/* Main Grid: Controls vs Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#E7E9F1] shadow-[0_1px_3px_rgba(23,26,43,0.03)] space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7E9F1] pb-3">
              <h2 className="text-sm font-bold text-[#171A2B]">Scenario Assumptions</h2>
              <span className="text-[11px] text-[#687086]">Deterministic Model</span>
            </div>

            {/* Select baseline event */}
            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                Baseline Event to Stress-Test
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  const ev = events.find((x) => x.id === e.target.value);
                  if (ev) {
                    setTargetCapacity(ev.capacity || 200);
                    setMemberPriceInr(Math.round(ev.member_price_paise / 100));
                    setNonMemberPriceInr(Math.round(ev.non_member_price_paise / 100));
                    setEstimatedExpensesInr(Math.round((ev.estimated_budget_paise || 2000000) / 100));
                  }
                }}
                className="w-full text-xs font-medium px-3 py-2 border border-[#E7E9F1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} (Cap: {ev.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-[#171A2B]">
                <span>Target Capacity:</span>
                <span className="text-[#625BF6] font-bold">{targetCapacity} attendees</span>
              </div>
              <input
                type="range"
                min="30"
                max="600"
                step="10"
                value={targetCapacity}
                onChange={(e) => setTargetCapacity(Number(e.target.value))}
                className="w-full accent-[#625BF6] cursor-pointer"
              />
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                  Member Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={memberPriceInr}
                  onChange={(e) => setMemberPriceInr(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 border border-[#E7E9F1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                  Non-Member (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={nonMemberPriceInr}
                  onChange={(e) => setNonMemberPriceInr(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 border border-[#E7E9F1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>
            </div>

            {/* Attendance Yield */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-[#171A2B]">
                <span>Expected Attendance Yield:</span>
                <span className="text-[#16856B] font-bold">{attendanceRate}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={attendanceRate}
                onChange={(e) => setAttendanceRate(Number(e.target.value))}
                className="w-full accent-[#16856B] cursor-pointer"
              />
            </div>

            {/* Member Ratio */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-[#171A2B]">
                <span>Member Turnout Proportion:</span>
                <span className="text-[#625BF6] font-bold">{memberRatio}% Members</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={memberRatio}
                onChange={(e) => setMemberRatio(Number(e.target.value))}
                className="w-full accent-[#625BF6] cursor-pointer"
              />
            </div>

            {/* Budget & Threshold */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                  Budget Costs (₹)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={estimatedExpensesInr}
                  onChange={(e) => setEstimatedExpensesInr(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 border border-[#E7E9F1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                  Reserve Floor Buffer (₹)
                </label>
                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={reserveThresholdInr}
                  onChange={(e) => setReserveThresholdInr(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 border border-[#E7E9F1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* KPI Triad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white p-4 rounded-xl border border-[#E7E9F1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687086]">
                  Forecast Revenue
                </span>
                <div className="text-xl font-bold text-[#171A2B] mt-1">
                  {formatINR(simResult?.proposed_scenario?.projected_revenue_paise)}
                </div>
                <div className="text-[11px] text-[#687086] mt-0.5">
                  Max potential: {formatINR(simResult?.proposed_scenario?.max_possible_revenue_paise)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E7E9F1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687086]">
                  Surplus / Shortfall
                </span>
                <div
                  className={`text-xl font-bold mt-1 ${
                    simResult?.proposed_scenario?.is_surplus ? 'text-[#16856B]' : 'text-[#D9485F]'
                  }`}
                >
                  {formatINR(simResult?.proposed_scenario?.projected_surplus_paise)}
                </div>
                <div className="text-[11px] text-[#687086] mt-0.5">
                  Cost: {formatINR(simResult?.proposed_scenario?.estimated_expenses_paise)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E7E9F1]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687086]">
                  Post-Event Reserve
                </span>
                <div
                  className={`text-xl font-bold mt-1 ${
                    simResult?.proposed_scenario?.reserve_breached ? 'text-[#D9485F]' : 'text-[#625BF6]'
                  }`}
                >
                  {formatINR(simResult?.proposed_scenario?.remaining_reserve_paise)}
                </div>
                <div className="text-[11px] text-[#687086] mt-0.5">
                  Safety floor: ₹{reserveThresholdInr.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Recharts Comparison */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E9F1] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#171A2B]">
                  Scenario Delta Comparison (INR)
                </h3>
                <span className="text-[11px] text-[#687086]">Current Baseline vs Simulated</span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F8" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#687086' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#687086' }} />
                    <Tooltip
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E7E9F1', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="Current" fill="#A6ACBE" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Simulated" fill="#625BF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Warnings & Sensitivity Notes */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E9F1] space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#171A2B] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#625BF6]" />
                <span>Deterministic Sensitivity Guidance</span>
              </h3>

              {simResult?.warnings?.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#FDF2F4] border border-[#FACED5] text-xs text-[#D9485F] flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}

              {simResult?.recommendations?.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#E7F5F0] border border-[#BCE4D7] text-xs text-[#16856B] flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}

              {/* Volunteer Coverage Impact */}
              {simResult?.volunteer_impact && (
                <div className="p-3.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#171A2B] flex items-center gap-1.5">
                      <span>Volunteer Staffing Impact</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        simResult.volunteer_impact.volunteer_gap > 0
                          ? 'bg-[#D9485F]/10 text-[#D9485F]'
                          : 'bg-[#16856B]/10 text-[#16856B]'
                      }`}
                    >
                      {simResult.volunteer_impact.assessment}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                    <div>
                      <div className="text-[#687086]">Needed Staff:</div>
                      <div className="font-extrabold text-[#171A2B]">{simResult.volunteer_impact.needed_volunteers} volunteers</div>
                    </div>
                    <div>
                      <div className="text-[#687086]">Baseline Roster:</div>
                      <div className="font-extrabold text-[#171A2B]">{simResult.volunteer_impact.baseline_volunteers} volunteers</div>
                    </div>
                    <div>
                      <div className="text-[#687086]">Staffing Gap:</div>
                      <div className={`font-extrabold ${simResult.volunteer_impact.volunteer_gap > 0 ? 'text-[#D9485F]' : 'text-[#16856B]'}`}>
                        +{simResult.volunteer_impact.volunteer_gap} required
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Sensitivity Drivers */}
              {simResult?.key_sensitivity_drivers?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-[#171A2B] block">
                    Key Sensitivity Drivers (Elasticity Ranking)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {simResult.key_sensitivity_drivers.map((drv, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F1] text-[11px]">
                        <div className="font-bold text-[#171A2B]">{drv.driver}</div>
                        <div className="text-xs font-black text-[#625BF6] mt-0.5">±₹{drv.impact_inr.toLocaleString('en-IN')}</div>
                        <p className="text-[10px] text-[#687086] mt-1 line-clamp-2">{drv.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operational Risks Highlight */}
              {simResult?.operational_risks?.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-[#D9485F] block">
                    Simulated Operational Bottlenecks
                  </span>
                  {simResult.operational_risks.map((op, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#D9485F]/5 border border-[#D9485F]/20 text-xs text-[#D9485F] font-medium">
                      ⚠️ {op}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[11px] text-[#687086] italic pt-1 border-t border-[#E7E9F1]">
                {simResult?.assumptions_statement}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmOpen}
          title="Apply Simulated Scenario"
          message={`Are you sure you want to update the live event record with capacity (${targetCapacity}), member price (₹${memberPriceInr}), and non-member price (₹${nonMemberPriceInr})?`}
          confirmText="Yes, Apply to Live Event"
          loading={applyLoading}
          onConfirm={handleApplyChanges}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default SimulatorPage;
