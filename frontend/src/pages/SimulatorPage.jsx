import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import {
  SlidersHorizontal,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Save,
  RotateCcw
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
import { Badge } from '../components/Badge';

export const SimulatorPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  // Simulation Sliders / Parameters (prices in INR in UI, multiplied by 100 to paise for API)
  const [targetCapacity, setTargetCapacity] = useState(250);
  const [memberPriceInr, setMemberPriceInr] = useState(150);
  const [nonMemberPriceInr, setNonMemberPriceInr] = useState(300);
  const [attendanceRate, setAttendanceRate] = useState(85); // 85%
  const [memberRatio, setMemberRatio] = useState(60); // 60%
  const [estimatedExpensesInr, setEstimatedExpensesInr] = useState(35000);
  const [reserveThresholdInr, setReserveThresholdInr] = useState(10000);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Load events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.get('/api/events');
        setEvents(data || []);
        if (data && data.length > 0) {
          setSelectedEventId(data[0].id);
          // Pre-populate with first event values
          const ev = data[0];
          setTargetCapacity(ev.capacity || 200);
          setMemberPriceInr(Math.round(ev.member_price_paise / 100));
          setNonMemberPriceInr(Math.round(ev.non_member_price_paise / 100));
          setEstimatedExpensesInr(Math.round((ev.estimated_budget_paise || 2000000) / 100));
        }
      } catch (err) {
        console.error('Failed to load events for simulator:', err);
      }
    };
    fetchEvents();
  }, []);

  // Run simulation on parameters change
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

  const handleApplyToLiveEvent = async () => {
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
      setConfirmModalOpen(false);
      // Reload event list
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
      name: 'Projected Revenue',
      'Current Baseline': simResult?.current_plan
        ? simResult.current_plan.projected_revenue_paise / 100
        : 0,
      'Proposed Scenario': simResult?.proposed_scenario
        ? simResult.proposed_scenario.projected_revenue_paise / 100
        : 0
    },
    {
      name: 'Estimated Expenses',
      'Current Baseline': simResult?.current_plan
        ? simResult.current_plan.estimated_expenses_paise / 100
        : 0,
      'Proposed Scenario': simResult?.proposed_scenario
        ? simResult.proposed_scenario.estimated_expenses_paise / 100
        : 0
    },
    {
      name: 'Net Surplus / Deficit',
      'Current Baseline': simResult?.current_plan
        ? simResult.current_plan.projected_surplus_paise / 100
        : 0,
      'Proposed Scenario': simResult?.proposed_scenario
        ? simResult.proposed_scenario.projected_surplus_paise / 100
        : 0
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Non-Mutating Hypothetical Sandbox</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Club Decision Simulator
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Stress-test event capacity, member yields, and ticket pricing against club liquid cash buffers.
              Hypothetical estimates do not alter live database records until explicitly confirmed.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmModalOpen(true)}
              disabled={!selectedEventId}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Apply to Live Event</span>
            </button>
          </div>
        </div>

        {applySuccess && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{applySuccess}</span>
          </div>
        )}

        {/* Top Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Scenario Parameter Controls</h2>
              <span className="text-[10px] text-slate-400 font-medium">Real-time compute</span>
            </div>

            {/* Event Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Baseline Event to Compare Against:
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
                className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} (Cap: {ev.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Capacity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Target Event Capacity:</span>
                <span className="text-indigo-600 font-bold">{targetCapacity} attendees</span>
              </div>
              <input
                type="range"
                min="30"
                max="600"
                step="10"
                value={targetCapacity}
                onChange={(e) => setTargetCapacity(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>30 (Intimate)</span>
                <span>600 (Hall)</span>
              </div>
            </div>

            {/* Member vs Non-Member Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Member Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={memberPriceInr}
                  onChange={(e) => setMemberPriceInr(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Non-Member Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={nonMemberPriceInr}
                  onChange={(e) => setNonMemberPriceInr(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Attendance Yield Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Expected Attendance Yield:</span>
                <span className="text-teal-700 font-bold">{attendanceRate}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={attendanceRate}
                onChange={(e) => setAttendanceRate(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            {/* Member Ratio Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Member Participation Ratio:</span>
                <span className="text-indigo-600 font-bold">{memberRatio}% Members</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={memberRatio}
                onChange={(e) => setMemberRatio(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Expenses & Reserve Threshold */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Budget Costs (₹)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={estimatedExpensesInr}
                  onChange={(e) => setEstimatedExpensesInr(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reserve Policy Buffer (₹)
                </label>
                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={reserveThresholdInr}
                  onChange={(e) => setReserveThresholdInr(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Comparative Projections & Recharts */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Metrics Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Forecast Revenue
                </span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {formatINR(simResult?.proposed_scenario?.projected_revenue_paise)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Max potential: {formatINR(simResult?.proposed_scenario?.max_possible_revenue_paise)}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Projected Surplus / Shortfall
                </span>
                <div
                  className={`text-xl font-extrabold mt-1 ${
                    simResult?.proposed_scenario?.is_surplus ? 'text-teal-600' : 'text-rose-600'
                  }`}
                >
                  {formatINR(simResult?.proposed_scenario?.projected_surplus_paise)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Costs: {formatINR(simResult?.proposed_scenario?.estimated_expenses_paise)}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Remaining Reserve Headroom
                </span>
                <div
                  className={`text-xl font-extrabold mt-1 ${
                    simResult?.proposed_scenario?.reserve_breached ? 'text-rose-600' : 'text-indigo-600'
                  }`}
                >
                  {formatINR(simResult?.proposed_scenario?.remaining_reserve_paise)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Target policy: ₹{reserveThresholdInr.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Recharts Visualization */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Scenario Financial Delta (INR)</h3>
                <span className="text-xs text-slate-500">Current Plan vs Proposed</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="Current Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Proposed Scenario" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Warnings & Suggestions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>Simulation Constraints & Sensitivity Guidance</span>
              </h3>

              {simResult?.warnings?.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}

              {simResult?.recommendations?.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}

              <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                {simResult?.assumptions_statement}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center mx-auto">
                <Save className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 text-center">
                Confirm Scenario Application
              </h3>
              <p className="text-xs text-slate-600 text-center">
                This will update the live event record in MongoDB Atlas with capacity ({targetCapacity}), 
                member price (₹{memberPriceInr}), and non-member price (₹{nonMemberPriceInr}).
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyToLiveEvent}
                  disabled={applyLoading}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                >
                  {applyLoading ? 'Updating...' : 'Yes, Apply Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
