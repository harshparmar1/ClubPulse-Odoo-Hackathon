import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError('');
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-[#625BF6] text-white flex items-center justify-center shadow-md shadow-[#625BF6]/25">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-[#171A2B] tracking-tight">
            ClubPulse
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-[#171A2B]">
          Sign in to your organization account
        </h2>
        <p className="mt-1 text-xs text-[#687086]">
          Or{' '}
          <Link to="/register" className="font-semibold text-[#625BF6] hover:text-[#5048E5]">
            create a new student profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#E7E9F1] rounded-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#D9485F]/10 border border-[#D9485F]/20 flex items-center gap-2.5 text-xs text-[#D9485F]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D9485F]" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Personas */}
          <div className="p-3.5 bg-[#625BF6]/5 rounded-xl border border-[#625BF6]/20">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#625BF6] mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Hackathon Judge 1-Click Sign-In</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@clubpulse.edu', 'student123')}
                className="px-2.5 py-2 bg-white hover:bg-[#625BF6]/10 border border-[#E7E9F1] rounded-xl text-xs font-semibold text-[#171A2B] text-left transition-colors shadow-2xs"
              >
                👤 Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('organizer@clubpulse.edu', 'organizer123')}
                className="px-2.5 py-2 bg-white hover:bg-[#625BF6]/10 border border-[#E7E9F1] rounded-xl text-xs font-semibold text-[#171A2B] text-left transition-colors shadow-2xs"
              >
                📋 Organizer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('treasurer@clubpulse.edu', 'treasurer123')}
                className="px-2.5 py-2 bg-white hover:bg-[#625BF6]/10 border border-[#E7E9F1] rounded-xl text-xs font-semibold text-[#171A2B] text-left transition-colors shadow-2xs"
              >
                💰 Treasurer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@clubpulse.edu', 'admin123')}
                className="px-2.5 py-2 bg-white hover:bg-[#625BF6]/10 border border-[#E7E9F1] rounded-xl text-xs font-semibold text-[#171A2B] text-left transition-colors shadow-2xs"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#625BF6] hover:bg-[#5048E5] disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to ClubPulse'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
