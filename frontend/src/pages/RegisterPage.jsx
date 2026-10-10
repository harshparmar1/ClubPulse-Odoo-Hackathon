import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, User, Hash, Phone, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    setLoading(true);
    setError('');

    try {
      await register({
        full_name: fullName,
        email,
        password,
        roll_number: rollNumber || 'STU-2026-001',
        phone: phone || null,
        role: 'student'
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be registered.');
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
          Create your student membership profile
        </h2>
        <p className="mt-1 text-xs text-[#687086]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#625BF6] hover:text-[#5048E5]">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#E7E9F1] rounded-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#D9485F]/10 border border-[#D9485F]/20 flex items-center gap-2.5 text-xs text-[#D9485F]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D9485F]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ananya Roy"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.univ.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                  Roll / Student ID
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="STU-2026-042"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#625BF6] hover:bg-[#5048E5] disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating profile...' : 'Register Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
