import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../api/client';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Database
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';

export const RiskWorkspacePage = () => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const fetchRiskEvaluation = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/risk/evaluate');
      setRiskData(data);
    } catch (err) {
      console.error('Failed to load risk evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskEvaluation();
  }, []);

  const items = riskData?.risk_items || [];
  const filteredItems = items.filter((item) => {
    if (filterSeverity === 'ALL') return true;
    return item.severity === filterSeverity;
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-teal-400 border-teal-500/40 bg-teal-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Command Center Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1120] text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Deterministic Operational Risk Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Live Organization Risk Matrix
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Continuous background auditing across financial obligations, task deadlines, volunteer deficits, 
                and inventory thresholds. Rule-based explainability with zero generative hallucination.
              </p>
            </div>

            {/* Readiness Score Gauge */}
            <div className="flex items-center gap-6 p-5 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-inner">
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Readiness Score
                </div>
                <div
                  className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-extrabold ${getScoreColor(
                    riskData?.readiness_score || 0
                  )}`}
                >
                  <span className="text-3xl tracking-tight">{riskData?.readiness_score ?? '--'}</span>
                  <span className="text-[10px] font-medium opacity-80">/ 100</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Critical Issues:
                  </span>
                  <strong className="text-white">{riskData?.total_critical ?? 0}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Warnings:
                  </span>
                  <strong className="text-white">{riskData?.total_warning ?? 0}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-teal-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    Healthy Signals:
                  </span>
                  <strong className="text-white">{riskData?.total_info ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Formula Transparency Banner */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Documented Formula:</strong>{' '}
                {riskData?.score_formula || '35% Financial Solvency + 25% Task Velocity + 25% Event Logistics + 15% Inventory'}
              </span>
            </div>

            <button
              onClick={fetchRiskEvaluation}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-Evaluate Engine</span>
            </button>
          </div>
        </div>

        {/* Contributing Factor Sub-Gauges */}
        {riskData?.score_breakdown && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Financial Solvency (35%)
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {riskData.score_breakdown.financial_solvency} / 100
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Liquid cash vs obligations</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Task Velocity (25%)
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {riskData.score_breakdown.task_velocity} / 100
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Critical path completion</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Event Logistics (25%)
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {riskData.score_breakdown.event_logistics} / 100
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Volunteer coverage ratio</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Inventory Health (15%)
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {riskData.score_breakdown.inventory_health} / 100
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Stockout mitigation buffer</p>
            </div>
          </div>
        )}

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sev}
              <span className="ml-1.5 opacity-70">
                (
                {sev === 'ALL'
                  ? items.length
                  : items.filter((i) => i.severity === sev).length}
                )
              </span>
            </button>
          ))}
        </div>

        {/* Risk Items List */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No active risks under this filter</h3>
            <p className="text-xs text-slate-500 mt-1">
              All audited parameters are currently meeting standard organization thresholds.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((risk) => {
              const isCrit = risk.severity === 'CRITICAL';
              const isWarn = risk.severity === 'WARNING';

              return (
                <div
                  key={risk.id}
                  className={`rounded-2xl p-6 border transition-all shadow-2xs ${
                    isCrit
                      ? 'bg-rose-50/40 border-rose-200/90'
                      : isWarn
                      ? 'bg-amber-50/30 border-amber-200/90'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={isCrit ? 'critical' : isWarn ? 'warning' : 'neutral'}>
                          {risk.severity}
                        </Badge>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {risk.category} • ID: {risk.id}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{risk.title}</h3>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
                        {risk.explanation}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-medium">
                        <span className="text-[11px] text-slate-400 uppercase">Audit Source:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                          {risk.source_record?.type} :: {risk.source_record?.title || risk.source_record?.id}
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Recommended Action
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-800 font-medium max-w-xs shadow-2xs">
                        {risk.recommended_action}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
