import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  LayoutDashboard,
  Ticket,
  CreditCard,
  ShoppingBag,
  CheckSquare,
  Receipt,
  Users,
  Calendar,
  QrCode,
  Box,
  Kanban,
  ShieldAlert,
  SlidersHorizontal,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  Bell,
  Search,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { NotificationDropdown } from './NotificationDropdown';

export const AppShell = ({ children, pageTitle, breadcrumbs = [] }) => {
  const { user, role, logout, login, isMember, canVolunteer, isVolunteer, membershipRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
      setMobileDrawerOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo switch error:', err);
    }
  };

  const isOrganizer = ['organizer', 'admin'].includes(role);
  const isTreasurer = ['treasurer', 'admin'].includes(role);

  const memberNavItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/my-tickets', label: 'My QR Passes', icon: Ticket },
    { to: '/membership', label: 'Membership Status', icon: CreditCard },
    ...(canVolunteer
      ? [
          { to: '/my-tasks', label: 'My Volunteer Tasks', icon: CheckSquare },
          { to: '/organizer/scanner', label: 'Manage QR / Scanner', icon: QrCode }
        ]
      : []),
    { to: '/expenses', label: 'Reimbursements', icon: Receipt }
  ];

  const navItemClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
      isActive
        ? 'bg-[#625BF6] text-white shadow-[0_2px_8px_rgba(98,91,246,0.3)]'
        : 'text-[#A6ACBE] hover:text-white hover:bg-[#23253E]'
    }`;

  const renderNavSection = (title, items) => (
    <div className="space-y-1 mb-5">
      {!sidebarCollapsed && (
        <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#687086] mb-1.5">
          {title}
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileDrawerOpen(false)}
            className={({ isActive }) => navItemClass(isActive)}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            {!sidebarCollapsed && item.badge && (
              <span className="ml-auto text-[10px] bg-[#D9485F] text-white px-1.5 py-0.2 rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex text-[#171A2B]">
      {/* ---------------------------------------------------- */}
      {/* Desktop Sidebar (Fixed Dark Navy #17182B)            */}
      {/* ---------------------------------------------------- */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 bg-[#17182B] border-r border-[#24263F] z-30 transition-all duration-300 sticky top-0 h-screen ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between pb-5 mb-4 border-b border-[#23253E]">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-bold shadow-md shadow-[#625BF6]/20 p-0.5 shrink-0 overflow-hidden">
                <img src="/logo.png" alt="Skyline" className="w-full h-full object-contain" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="font-extrabold text-sm tracking-tight text-white leading-tight">
                    Skyline
                  </div>
                  <div className="text-[10px] font-semibold text-[#8B93A7] tracking-wider uppercase">
                    Operating System
                  </div>
                </div>
              )}
            </Link>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-md text-[#687086] hover:text-white hover:bg-[#23253E] transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Back to Home Button */}
          <div className="mb-3">
            <Link
              to="/"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                sidebarCollapsed
                  ? 'justify-center text-[#A6ACBE] hover:text-white hover:bg-[#23253E]'
                  : 'bg-[#23253E]/80 text-[#CBD0E1] hover:text-white hover:bg-[#2E3152] border border-[#2B2E4E]'
              }`}
              title="Return to Chapter Homepage"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#847BFA] shrink-0" />
              {!sidebarCollapsed && <span>← Back to Home</span>}
            </Link>
          </div>

          {/* Navigation Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Student Domain */}
            {renderNavSection('Member Space', memberNavItems)}

            {/* Organizer Operations */}
            {isOrganizer &&
              renderNavSection('Operations', [
                { to: '/action-center', label: 'Action Center', icon: CheckSquare },
                { to: '/readiness', label: 'Event Readiness', icon: Activity },
                { to: '/organizer/overview', label: 'Operations Hub', icon: LayoutDashboard },
                { to: '/organizer/members', label: 'Member Roster', icon: Users },
                { to: '/organizer/events', label: 'Events & Capacity', icon: Calendar },
                { to: '/organizer/scanner', label: 'Gate QR Scanner', icon: QrCode },
                { to: '/organizer/merch', label: 'Apparel Inventory', icon: Box },
                { to: '/organizer/tasks', label: 'Sprint Task Board', icon: Kanban }
              ])}

            {/* Executive & Treasury */}
            {isTreasurer &&
              renderNavSection('Treasury & Intel', [
                { to: '/ledger', label: 'Treasury Ledger', icon: Receipt },
                { to: '/risk', label: 'Operational Risk', icon: ShieldAlert },
                { to: '/simulator', label: 'Live Simulator', icon: SlidersHorizontal },
                { to: '/audit-logs', label: 'Audit Trail', icon: FileSpreadsheet },
                { to: '/handover', label: 'Semester Handover', icon: FileSpreadsheet }
              ])}
          </div>

          {/* Bottom Account Card */}
          <div className="pt-3 border-t border-[#23253E]">
            {!sidebarCollapsed ? (
              <div className="p-2.5 rounded-xl bg-[#1E2038] border border-[#2B2E4E] flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-lg bg-[#625BF6]/20 text-[#625BF6] border border-[#625BF6]/40 flex items-center justify-center font-bold text-xs shrink-0">
                    {user?.full_name?.[0] || 'U'}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">
                      {user?.full_name || 'Member'}
                    </div>
                    <div className="text-[10px] text-[#8B93A7] capitalize flex items-center gap-1">
                      <span>{role}</span>
                      <span>•</span>
                      <span className={isMember ? (isVolunteer ? 'text-[#847BFA]' : 'text-[#16856B]') : 'text-[#687086]'}>
                        {isMember ? (isVolunteer ? 'Volunteer Crew' : 'Participant') : 'Guest'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-1.5 text-[#8B93A7] hover:text-white rounded-lg hover:bg-[#2B2E4E] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full py-2 flex justify-center text-[#8B93A7] hover:text-white hover:bg-[#23253E] rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* Mobile Drawer (Slide-out Overlay)                    */}
      {/* ---------------------------------------------------- */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#17182B]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[80vw] bg-[#17182B] h-full p-4 flex flex-col justify-between z-10 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-[#23253E]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold p-0.5 overflow-hidden">
                  <img src="/logo.png" alt="Skyline" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-sm text-white">Skyline</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[#8B93A7] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Back to Home Button in Drawer */}
              <Link
                to="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#23253E] text-white border border-[#2B2E4E] hover:bg-[#625BF6] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[#847BFA]" />
                <span>← Back to Home Page</span>
              </Link>

              {renderNavSection('Member Space', memberNavItems)}

              {isOrganizer &&
                renderNavSection('Operations', [
                  { to: '/action-center', label: 'Action Center', icon: CheckSquare },
                  { to: '/readiness', label: 'Event Readiness', icon: Activity },
                  { to: '/organizer/overview', label: 'Operations Hub', icon: LayoutDashboard },
                  { to: '/organizer/members', label: 'Member Roster', icon: Users },
                  { to: '/organizer/events', label: 'Events & Capacity', icon: Calendar },
                  { to: '/organizer/scanner', label: 'Gate QR Scanner', icon: QrCode },
                  { to: '/organizer/merch', label: 'Apparel Inventory', icon: Box },
                  { to: '/organizer/tasks', label: 'Sprint Task Board', icon: Kanban }
                ])}

              {isTreasurer &&
                renderNavSection('Treasury & Intel', [
                  { to: '/ledger', label: 'Treasury Ledger', icon: Receipt },
                  { to: '/risk', label: 'Operational Risk', icon: ShieldAlert },
                  { to: '/simulator', label: 'Live Simulator', icon: SlidersHorizontal },
                  { to: '/audit-logs', label: 'Audit Trail', icon: FileSpreadsheet },
                  { to: '/handover', label: 'Semester Handover', icon: FileSpreadsheet }
                ])}
            </div>

            <div className="pt-3 border-t border-[#23253E] flex items-center justify-between">
              <span className="text-xs text-[#8B93A7]">{user?.full_name}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-xs text-[#D9485F] font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Main Content Area                                    */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E7E9F1] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 text-[#687086] hover:text-[#171A2B] rounded-lg hover:bg-[#F3F4F8]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Back to Home Button in Top Header */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8FC] hover:bg-[#EEEDFE] text-[#171A2B] hover:text-[#625BF6] border border-[#E7E9F1] text-xs font-bold transition-all shadow-2xs group"
              title="Return to Chapter Homepage"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#625BF6] group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Home Page</span>
            </Link>

            {/* Breadcrumb or Title */}
            <div>
              {breadcrumbs.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-[#687086]">
                  {breadcrumbs.map((bc, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#A6ACBE]" />}
                      {bc.link ? (
                        <Link to={bc.link} className="hover:text-[#625BF6] transition-colors">
                          {bc.label}
                        </Link>
                      ) : (
                        <span className="font-semibold text-[#171A2B]">{bc.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <h1 className="text-base sm:text-lg font-bold text-[#171A2B] tracking-tight">
                  {pageTitle || 'Dashboard'}
                </h1>
              )}
            </div>
          </div>

          {/* Right Header: Notifications, Demo Persona Switcher & Profile */}
          <div className="flex items-center gap-3">
            {/* Operational Notifications */}
            <NotificationDropdown />

            {/* Quick Demo Switcher (Crucial for Hackathon Evaluation) */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F7F8FC] hover:bg-[#EEEDFE] text-[#171A2B] border border-[#E7E9F1] transition-colors shadow-2xs"
                title="Switch demo persona instantly"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#625BF6]" />
                <span className="hidden sm:inline text-[#687086]">Persona:</span>
                <span className="capitalize font-bold text-[#625BF6]">{role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#687086]" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E7E9F1] p-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#687086] border-b border-[#F3F4F8] mb-1">
                    Instant Demo Switch
                  </div>
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => handleSwitchDemo(account.email, `${account.role}123`)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-[#EEEDFE] transition-colors ${
                        user?.email === account.email ? 'bg-[#EEEDFE] text-[#625BF6] font-bold' : 'text-[#171A2B]'
                      }`}
                    >
                      <span className="truncate">{account.name}</span>
                      <StatusBadge
                        variant={
                          account.role === 'admin'
                            ? 'critical'
                            : account.role === 'treasurer'
                            ? 'warning'
                            : 'accent'
                        }
                      >
                        {account.role}
                      </StatusBadge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E7E9F1]">
              <div className="w-7 h-7 rounded-lg bg-[#EEEDFE] text-[#625BF6] border border-[#D4D1FD] flex items-center justify-center font-bold text-xs shrink-0">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-[#171A2B]">
                {user?.full_name?.split(' ')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
