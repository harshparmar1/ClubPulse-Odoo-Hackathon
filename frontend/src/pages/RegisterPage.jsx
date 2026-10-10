import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  User, 
  Hash, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  ArrowLeft, 
  RefreshCw 
} from 'lucide-react';

export const RegisterPage = () => {
  const { sendOtp, verifyOtpAndRegister } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // Status & Timers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMsg('');

    try {
      const res = await sendOtp(email.trim().toLowerCase(), fullName.trim());
      setStep('otp');
      setCountdown(60);
      setInfoMsg(res.message || `A 6-digit verification OTP has been sent to ${email}`);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    setError('');
    setInfoMsg('');

    try {
      const res = await sendOtp(email.trim().toLowerCase(), fullName.trim());
      setCountdown(60);
      setInfoMsg(res.message || `New verification code sent to ${email}`);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOtpAndRegister({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
        full_name: fullName.trim(),
        roll_number: rollNumber.trim() || 'STU-2026-001',
        phone: phone.trim() || null
      });
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
          {step === 'form' ? 'Create student membership profile' : 'Verify your email address'}
        </h2>
        <p className="mt-1 text-xs text-[#687086]">
          {step === 'form' ? (
            <>
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-[#625BF6] hover:text-[#5048E5]">
                Sign in here
              </Link>
            </>
          ) : (
            <>
              We sent a 6-digit OTP code to <strong className="text-[#171A2B]">{email}</strong>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#E7E9F1] rounded-2xl space-y-5">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E9F1]/60">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${step === 'form' ? 'bg-[#625BF6] text-white' : 'bg-emerald-500 text-white'}`}>
                {step === 'otp' ? '✓' : '1'}
              </span>
              <span className="text-xs font-semibold text-[#171A2B]">Details</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-[#E7E9F1]">
              <div className={`h-full transition-all duration-300 ${step === 'otp' ? 'w-full bg-[#625BF6]' : 'w-0'}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${step === 'otp' ? 'bg-[#625BF6] text-white' : 'bg-[#E7E9F1] text-[#687086]'}`}>
                2
              </span>
              <span className={`text-xs font-semibold ${step === 'otp' ? 'text-[#171A2B]' : 'text-[#687086]'}`}>
                OTP Verification
              </span>
            </div>
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

          {step === 'form' ? (
            /* STEP 1: Registration Profile Form */
            <form onSubmit={handleRequestOtp} className="space-y-4">
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
                    placeholder="e.g. Harsh Parmar"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#687086]">
                  A 6-digit verification OTP will be sent to this email address.
                </p>
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
                  Create Password
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
                <span>{loading ? 'Sending Verification OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification Form */
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-[#625BF6] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#171A2B]">Check your email</p>
                  <p className="text-[11px] text-[#687086] mt-0.5">
                    We dispatched a verification code to <strong>{email}</strong>. Please check your inbox or spam folder.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={8}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 849201"
                    className="w-full pl-9 pr-3 py-2.5 text-center tracking-widest text-base font-bold border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setError('');
                  }}
                  className="inline-flex items-center gap-1 text-[#687086] hover:text-[#171A2B] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change details / email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  className="inline-flex items-center gap-1 font-semibold text-[#625BF6] hover:text-[#5048E5] disabled:text-[#687086] disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Verifying & Registering...' : 'Verify OTP & Complete Registration'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
