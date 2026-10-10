import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../api/client';
import { Camera, QrCode, CheckCircle2, AlertTriangle, KeyRound, RefreshCw, Users } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';

export const QRScannerPage = () => {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    try {
      const scanner = new Html5QrcodeScanner(
        'qr-lane-reader',
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          rememberLastUsedCamera: true
        },
        false
      );

      scanner.render(
        (decodedText) => {
          verifyToken(decodedText);
        },
        (error) => {}
      );
      scannerRef.current = scanner;
    } catch (err) {
      console.warn('QR camera lane scanner error:', err);
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {}
      }
    };
  }, []);

  const verifyToken = async (token) => {
    if (!token || loading) return;
    setLoading(true);
    setCurrentResult(null);

    try {
      const res = await api.post('/api/tickets/check-in', { qr_token: token.trim() });
      const record = {
        token: token.trim(),
        success: res.success,
        message: res.message,
        attendeeName: res.attendee_name,
        eventTitle: res.event_title,
        time: new Date().toLocaleTimeString()
      };
      setCurrentResult(record);
      setScanHistory((prev) => [record, ...prev.slice(0, 9)]);
    } catch (err) {
      const errRecord = {
        token: token.trim(),
        success: false,
        message: err.message || 'Token verification failed.',
        time: new Date().toLocaleTimeString()
      };
      setCurrentResult(errRecord);
      setScanHistory((prev) => [errRecord, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Gate Attendance Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Live Gate QR Scanner Lane
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fast camera-based attendee check-in. Automatically protects against duplicate re-entry scans.
          </p>
        </div>

        {/* Current Scan Result Feedback Banner */}
        {currentResult && (
          <div
            className={`p-5 rounded-2xl border flex items-start gap-4 transition-all shadow-md ${
              currentResult.success
                ? 'bg-teal-50 border-teal-200 text-teal-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {currentResult.success ? (
              <CheckCircle2 className="w-7 h-7 text-teal-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-base font-bold">
                {currentResult.success ? 'Verified Check-In!' : 'Check-In Rejected!'}
              </div>
              <p className="text-xs mt-0.5 font-medium">{currentResult.message}</p>
              {currentResult.attendeeName && (
                <div className="mt-2 text-xs font-semibold">
                  Attendee: {currentResult.attendeeName} • Event: {currentResult.eventTitle}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Scanner Viewfinder Box */}
          <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                Camera Optical Viewfinder
              </span>
              <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Lane Active
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 min-h-[300px] flex items-center justify-center">
              <div id="qr-lane-reader" className="w-full text-white text-xs"></div>
            </div>

            {/* Manual Token Fallback */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Manual Token Entry (e.g., CP-TKT-HACK-ANANYA-DEMO01):
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Paste or type ticket token..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && verifyToken(manualToken)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => verifyToken(manualToken)}
                  disabled={loading || !manualToken.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Validate Pass'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Scans Feed */}
          <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Scanned Passes ({scanHistory.length})
              </h3>
              <span className="text-[10px] text-slate-400">Live Log</span>
            </div>

            {scanHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No tickets scanned in this session yet.
              </div>
            ) : (
              <div className="space-y-2">
                {scanHistory.map((scan, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                      scan.success ? 'bg-teal-50/50 border-teal-100' : 'bg-rose-50/50 border-rose-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[170px]">
                        {scan.attendeeName || scan.token}
                      </div>
                      <div className="text-[10px] text-slate-500">{scan.time}</div>
                    </div>
                    <Badge variant={scan.success ? 'active' : 'critical'}>
                      {scan.success ? 'Verified' : 'Rejected'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
