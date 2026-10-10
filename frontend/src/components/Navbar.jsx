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
  UserCheck,
  CheckSquare
} from 'lucide-react';
import { Badge } from './Badge';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = () => {
  const { user, role, logout, login } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const demoAccounts = [
    { role: 'admin', email: 'harshparmar1617@gmail.com', name: 'Harsh Parmar (Admin)', password: '123456' },
    { role: 'organizer', email: 'pranitpawar3004@gmail.com', name: 'Pranit Pawar (Organizer)', password: '123456' },
    { role: 'treasurer', email: 'yugr362@gmail.com', name: 'Yug (Treasurer)', password: '123456' }
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E9F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E7E9F1] shadow-xs flex items-center justify-center overflow-hidden p-0.5 group-hover:scale-105 transition-transform shrink-0">
            <img src="/logo.png" alt="Skyline Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-[#171A2B] group-hover:text-[#625BF6] transition-colors">
              Skyline
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#625BF6]/10 text-[#625BF6] border border-[#625BF6]/20">
              Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#687086]">
          <Link
            to={['organizer', 'treasurer', 'admin'].includes(role) ? '/organizer/events' : '/events'}
            className="hover:text-[#625BF6] transition-colors"
          >
            Events
          </Link>
          <Link to="/merch" className="hover:text-[#625BF6] transition-colors">
            Merchandise
          </Link>
          <Link to="/announcements" className="hover:text-[#625BF6] transition-colors">
            Announcements
          </Link>
          {user && (
            <Link to="/dashboard" className="hover:text-[#625BF6] transition-colors">
              Dashboard
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/action-center"
              className="flex items-center gap-1 text-[#171A2B] hover:text-[#625BF6] transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Action Center</span>
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/readiness"
              className="flex items-center gap-1 text-[#171A2B] hover:text-[#625BF6] transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-[#16856B]" />
              <span>Readiness</span>
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/risk"
              className="flex items-center gap-1.5 text-[#D9485F] bg-[#D9485F]/10 px-2.5 py-1 rounded-lg border border-[#D9485F]/20 hover:bg-[#D9485F]/20 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Risk Engine</span>
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/simulator"
              className="flex items-center gap-1.5 text-[#625BF6] bg-[#625BF6]/10 px-2.5 py-1 rounded-lg border border-[#625BF6]/20 hover:bg-[#625BF6]/20 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Live Simulator</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Notifications, Demo Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {user && <NotificationDropdown />}

          {/* Quick Demo Role Switcher for Hackathon Judges */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#F7F8FC] hover:bg-[#E7E9F1] text-[#171A2B] border border-[#E7E9F1] transition-colors"
              title="Quick-switch demo personas for hackathon demonstration"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#625BF6]" />
              <span className="hidden sm:inline">Role: </span>
              <span className="capitalize text-[#625BF6] font-bold">{user ? role : 'Persona'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#687086]" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E7E9F1] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#687086] border-b border-[#E7E9F1] mb-1">
                  Switch Persona (Instant Sign-In)
                </div>
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleSwitchDemo(account.email, account.password || '123456')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between hover:bg-[#F7F8FC] transition-colors ${
                      user?.email === account.email ? 'bg-[#625BF6]/10 text-[#625BF6] font-bold' : 'text-[#171A2B]'
                    }`}
                  >
                    <span>{account.name}</span>
                    <Badge variant={account.role === 'admin' ? 'critical' : account.role === 'treasurer' ? 'warning' : 'accent'}>
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
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-xl border border-[#E7E9F1] hover:bg-[#F7F8FC] transition-colors text-xs font-semibold text-[#171A2B]"
              >
                <div className="w-6 h-6 rounded-full bg-[#625BF6]/10 text-[#625BF6] flex items-center justify-center font-bold">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline">{user.full_name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 text-[#687086] hover:text-[#171A2B] rounded-xl hover:bg-[#F7F8FC] transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-[#687086] hover:text-[#171A2B] rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#625BF6] hover:bg-[#5048E5] rounded-xl shadow-xs transition-colors"
              >
                Join Club
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#687086] rounded-xl hover:bg-[#F7F8FC]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E9F1] bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to={['organizer', 'treasurer', 'admin'].includes(role) ? '/organizer/events' : '/events'}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#171A2B] hover:bg-[#F7F8FC]"
          >
            Events
          </Link>
          <Link
            to="/merch"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#171A2B] hover:bg-[#F7F8FC]"
          >
            Merchandise
          </Link>
          <Link
            to="/announcements"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#171A2B] hover:bg-[#F7F8FC]"
          >
            Announcements
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#171A2B] hover:bg-[#F7F8FC]"
            >
              Dashboard
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/risk"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#D9485F] bg-[#D9485F]/10"
            >
              Operational Risk Engine
            </Link>
          )}
          {['organizer', 'treasurer', 'admin'].includes(role) && (
            <Link
              to="/simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#625BF6] bg-[#625BF6]/10"
            >
              Live Club Simulator
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
