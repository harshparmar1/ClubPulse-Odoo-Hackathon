import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  UserCheck, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft 
} from 'lucide-react';

export const LoginPage = () => {
  const { login, sendLoginOtp, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();

  // Mode: 'otp' (Student OTP) | 'password' (Leadership / Password)
  const [mode, setMode] = useState('otp');

  // Password Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student OTP Login State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('email'); // 'email' | 'code'
  const [countdown, setCountdown] = useState(0);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle standard password sign-in
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setInfoMsg('');

    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click login for the 3 fixed leadership roles
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setMode('password');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError('');
    setInfoMsg('');
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Send Student Login OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail) return;

    setLoading(true);
    setError('');
    setInfoMsg('');

    try {
      const res = await sendLoginOtp(otpEmail.trim().toLowerCase());
      setOtpStep('code');
      setCountdown(60);
      setInfoMsg(res.message || `Verification OTP sent to ${otpEmail}`);
    } catch (err) {
      setError(err.message || 'Failed to dispatch OTP. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Login OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    setError('');
    setInfoMsg('');

    try {
      const res = await sendLoginOtp(otpEmail.trim().toLowerCase());
      setCountdown(60);
      setInfoMsg(res.message || `New verification code sent to ${otpEmail}`);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Student Login OTP & Sign In
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyLoginOtp(otpEmail.trim().toLowerCase(), otpCode.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#E7E9F1] shadow-xs flex items-center justify-center p-1 overflow-hidden shrink-0">
            <img src="/logo.png" alt="Skyline" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-extrabold text-[#171A2B] tracking-tight">
            Skyline
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-[#171A2B]">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-[#687086]">
          Or{' '}
          <Link to="/register" className="font-semibold text-[#625BF6] hover:text-[#5048E5]">
            create a new student profile with OTP
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#E7E9F1] rounded-2xl space-y-5">
          
          {/* Quick Demo Personas - ONLY Fixed Leadership (Admin, Organizer, Treasurer) */}
          <div className="p-3.5 bg-[#625BF6]/5 rounded-xl border border-[#625BF6]/20">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#625BF6] mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Leadership 1-Click Sign-In</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('harshparmar1617@gmail.com', '123456')}
                className="px-2 py-2 bg-white hover:bg-[#625BF6]/10 border border-[#E7E9F1] rounded-xl text-[11px] font-semibold text-[#171A2B] text-center transition-colors shadow-2xs"
                title="Harsh Parmar (Admin)"
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('pranitpawar3004@gmail.com', '123456')}
                className="px-2 py-2 bg-white hover:bg-[#625BF6]/10 border border-[#E7E9F1] rounded-xl text-[11px] font-semibold text-[#171A2B] text-center transition-colors shadow-2xs"
                title="Pranit Pawar (Organizer)"
              >
                📋 Organizer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('yugr362@gmail.com', '123456')}
                className="px-2 py-2 bg-white hover:bg-[#625BF6]/10 border border-[#E7E9F1] rounded-xl text-[11px] font-semibold text-[#171A2B] text-center transition-colors shadow-2xs"
                title="Yug (Treasurer)"
              >
                💰 Treasurer
              </button>
            </div>
          </div>

          {/* Login Tabs */}
          <div className="flex border-b border-[#E7E9F1]">
            <button
              type="button"
              onClick={() => {
                setMode('otp');
                setError('');
                setInfoMsg('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'otp'
                  ? 'border-[#625BF6] text-[#625BF6]'
                  : 'border-transparent text-[#687086] hover:text-[#171A2B]'
              }`}
            >
              Student OTP Sign-In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('password');
                setError('');
                setInfoMsg('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'password'
                  ? 'border-[#625BF6] text-[#625BF6]'
                  : 'border-transparent text-[#687086] hover:text-[#171A2B]'
              }`}
            >
              Password Sign-In
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#D9485F]/10 border border-[#D9485F]/20 flex items-center gap-2.5 text-xs text-[#D9485F]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D9485F]" />
              <span>{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* MODE 1: Student OTP Login */}
          {mode === 'otp' && (
            otpStep === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                    Student Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#687086]">
                    Enter any email address. We will send a 6-digit OTP code to verify and log you in.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !otpEmail}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#625BF6] hover:bg-[#5048E5] disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Sending OTP code...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                  <KeyRound className="w-4 h-4 text-[#625BF6] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#171A2B]">Enter OTP Code</p>
                    <p className="text-[11px] text-[#687086] mt-0.5">
                      Sent to <strong>{otpEmail}</strong>. Check your inbox or spam folder.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                    6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={8}
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 642109"
                      className="w-full pl-9 pr-3 py-2.5 text-center tracking-widest text-base font-bold border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('email');
                      setError('');
                    }}
                    className="inline-flex items-center gap-1 text-[#687086] hover:text-[#171A2B] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    className="inline-flex items-center gap-1 font-semibold text-[#625BF6] hover:text-[#5048E5] disabled:text-[#687086] disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 4}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Log In'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )
          )}

          {/* MODE 2: Password Sign-In */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
