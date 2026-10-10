import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  Activity,
  ShieldAlert,
  SlidersHorizontal,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Users,
  Ticket,
  Lock,
  Sparkles,
  Zap
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ThreeScene } from '../components/ThreeScene';

export const LandingPage = () => {
  const heroRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.gsap-hero-title', {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from('.gsap-hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.15,
        ease: 'power3.out'
      });

      gsap.from('.gsap-hero-cta', {
        opacity: 0,
        y: 16,
        duration: 0.7,
        delay: 0.3,
        ease: 'power3.out'
      });

      gsap.from('.gsap-card', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.12,
        delay: 0.4,
        ease: 'power3.out'
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Odoo Hackathon 2026 • Student Organization Intelligence Platform</span>
              </div>

              <h1 className="gsap-hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Know what your club can afford,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
                  what is at risk
                </span>
                , and what to do next.
              </h1>

              <p className="gsap-hero-subtitle text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                ClubPulse transforms chaotic collegiate clubs into resilient operating engines. 
                Move beyond generic spreadsheets and chatbots with connected financial ledgers, 
                explainable risk auditing, and non-mutating event scenario simulations.
              </p>

              <div className="gsap-hero-cta flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                >
                  <span>Launch Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/risk"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-2xs transition-all"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Inspect Risk Engine</span>
                </Link>

                <Link
                  to="/simulator"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-2xs transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Test Live Simulator</span>
                </Link>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Strict Integer Paise Ledger</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Deterministic Rule Engine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Zero-Mutation Sandbox</span>
                </div>
              </div>
            </div>

            {/* Right Column: Three.js Interactive 3D Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-gradient-to-b from-indigo-50/70 to-slate-100/50 p-3 border border-indigo-100 shadow-xl shadow-indigo-100/40">
                <ThreeScene />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <Zap className="w-3.5 h-3.5" />
                      Live Club Resilience Score
                    </span>
                    <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      82 / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Signature Differentiators Grid */}
      <section ref={cardsRef} className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Architecture & Differentiators
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Built for High-Stakes Campus Operations
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Three signature capabilities engineered to eliminate common university organization failures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Risk Engine */}
            <div className="gsap-card bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-lg hover:shadow-indigo-50/50 group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Operational Risk Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Deterministic rules audit real database records across ledger balances, overdue critical tasks, 
                volunteer shortages, and stock shortages. Never hallucinates scores.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li>• Reserve deficit alerts against minimum policy</li>
                <li>• Unassigned required volunteer role detection</li>
                <li>• Explainable cause & recommended remediation</li>
              </ul>
            </div>

            {/* Feature 2: Simulator */}
            <div className="gsap-card bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-lg hover:shadow-indigo-50/50 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Live Club Simulator
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Stress-test event ticket pricing, member ratios, and attendance yields before sanctioning commitments. 
                Guaranteed zero mutation of live database records during simulation.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li>• Real-time variance vs current baseline plan</li>
                <li>• Break-even ticket price sensitivity suggestions</li>
                <li>• Explicit confirmation workflow to apply changes</li>
              </ul>
            </div>

            {/* Feature 3: Handover Report */}
            <div className="gsap-card bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-lg hover:shadow-indigo-50/50 group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Semester Handover Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Eliminates the annual club governance collapse. Generates an instant, verifiable audit trail 
                of opening vs closing cash, outstanding reimbursements, and asset valuations.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li>• 100% derived from integer paise transaction logs</li>
                <li>• Verified event attendance yield summaries</li>
                <li>• Instant executive CSV ledger export</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>ClubPulse • Odoo Hackathon 2026</span>
          </div>
          <p>© 2026 ClubPulse Intelligence Systems. Built with FastAPI, MongoDB Atlas, React & Tailwind.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/events" className="hover:text-indigo-600">Events</Link>
            <Link to="/merch" className="hover:text-indigo-600">Merchandise</Link>
            <Link to="/login" className="hover:text-indigo-600">Demo Sign-In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
