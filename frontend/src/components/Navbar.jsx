import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Menu,
  X,
  LogOut,
  User,
  ShieldAlert,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { Badge } from './Badge';

export const Navbar = () => {
  const { user, role, logout, login } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const demoAccounts = [
    { role: 'student', email: 'student@clubpulse.edu', name: 'Ananya Roy (Student)' },
    { role: 'organizer', email: 'organizer@clubpulse.edu', name: 'Rohan Deshmukh (Organizer)' },
    { role: 'treasurer', email: 'treasurer@clubpulse.edu', name: 'Priya Nair (Treasurer)' },
    { role: 'admin', email: 'admin@clubpulse.edu', name: 'Aarav Sharma (Admin)' }
  ];

  const handleSwitchDemo = async (email, password) => {
    try {
      await login(email, password);
      setDemoMenuOpen(false);
      setMobileMenuOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo switch error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 transition-colors flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              ClubPulse
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200">
              Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/events" className="hover:text-indigo-600 transition-colors">
            Events
          </Link>
          <Link to="/merch" className="hover:text-indigo-600 transition-colors">
            Merchandise
          </Link>
          <Link to="/announcements" className="hover:text-indigo-600 transition-colors">
            Announcements
          </Link>
          {user && (
            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/risk"
              className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Risk Engine</span>
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/simulator"
              className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Live Simulator</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Demo Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher for Hackathon Judges */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="Quick-switch demo personas for hackathon demonstration"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Role: </span>
              <span className="capitalize text-indigo-700 font-bold">{user ? role : 'Demo Switch'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  Switch Persona (Instant Login)
                </div>
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleSwitchDemo(account.email, `${account.role}123`)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                      user?.email === account.email ? 'bg-indigo-50/70 text-indigo-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{account.name}</span>
                    <Badge variant={account.role === 'admin' ? 'critical' : account.role === 'treasurer' ? 'warning' : 'primary'}>
                      {account.role}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-800"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline">{user.full_name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Join Club
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Events
          </Link>
          <Link
            to="/merch"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Merchandise
          </Link>
          <Link
            to="/announcements"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Announcements
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/risk"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-rose-700 bg-rose-50"
            >
              Operational Risk Engine
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50"
            >
              Live Club Simulator
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
