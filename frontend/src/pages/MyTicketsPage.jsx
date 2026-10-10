import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api, formatINR } from '../api/client';
import { Ticket, Calendar, MapPin, CheckCircle2, Clock, QrCode, X, Sparkles } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';

export const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalTicket, setActiveModalTicket] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await api.get('/api/tickets/my-tickets');
        setTickets(data || []);
      } catch (err) {
        console.error('Failed to load tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Digital Event Credential Passes</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Registered Passes & QR Codes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Present your unique digital QR token at the event check-in gate for instant attendance verification.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-48 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No active passes found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              You have not registered for any upcoming events yet.
            </p>
            <a
              href="/events"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Explore Events
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((tkt) => (
              <div
                key={tkt.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Pass #{tkt.id.slice(-6).toUpperCase()}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{tkt.event_title}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tkt.event_date}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tkt.venue}</span>
                    </div>
                  </div>

                  <Badge variant={tkt.checked_in ? 'active' : 'primary'}>
                    {tkt.checked_in ? 'Checked In' : 'Valid Pass'}
                  </Badge>
                </div>

                {/* QR Code and token info */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-700">
                      Attendee: {tkt.user_name} ({tkt.quantity} Seat{tkt.quantity > 1 ? 's' : ''})
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                      {tkt.qr_token}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800">
                      {formatINR(tkt.total_amount_paise)}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModalTicket(tkt)}
                    className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors flex flex-col items-center gap-1"
                    title="Click to view full-screen QR pass"
                  >
                    <QRCodeSVG value={tkt.qr_token} size={64} level="M" />
                    <span className="text-[9px] font-bold text-indigo-600 uppercase">Enlarge</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>
                    {tkt.checked_in ? (
                      <span className="text-teal-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified at {tkt.checked_in_at?.slice(11, 16)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Ready for gate check-in
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setActiveModalTicket(tkt)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Display Pass →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen QR code viewer */}
      {activeModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Gate Entry Verification
              </span>
              <button
                onClick={() => setActiveModalTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-inner inline-block">
              <QRCodeSVG value={activeModalTicket.qr_token} size={200} level="H" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">{activeModalTicket.event_title}</h3>
              <p className="text-xs text-slate-500">Attendee: {activeModalTicket.user_name}</p>
              <div className="p-2 bg-slate-50 rounded-lg font-mono text-[11px] text-slate-600 border border-slate-200 select-all">
                {activeModalTicket.qr_token}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Hold steady in front of the organizer’s camera scanner at entry.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
