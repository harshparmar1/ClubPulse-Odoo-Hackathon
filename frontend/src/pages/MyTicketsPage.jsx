import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api, formatINR } from '../api/client';
import { Ticket, Calendar, MapPin, CheckCircle2, Clock, QrCode, X, Sparkles, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Digital Event Credential Passes</span>
          </div>
          <h1 className="text-2xl font-bold text-[#171A2B] tracking-tight">
            My Registered Passes & QR Codes
          </h1>
          <p className="text-xs text-[#687086] mt-1">
            Present your unique digital QR token at the event check-in gate for instant attendance verification.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-48 animate-pulse border border-[#E7E9F1]"></div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-[#E7E9F1]">
            <EmptyState
              icon={Ticket}
              title="No active event passes registered"
              description="You have not booked tickets for any upcoming chapters. Explore the event calendar to reserve seats."
              action={
                <a
                  href="/events"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#625BF6] text-white rounded-xl text-xs font-semibold hover:bg-[#5048E5] transition-colors"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((tkt) => (
              <div
                key={tkt.id}
                className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#625BF6]">
                      Pass #{tkt.id.slice(-6).toUpperCase()}
                    </span>
                    <h3 className="font-bold text-base text-[#171A2B]">{tkt.event_title}</h3>
                    <div className="text-xs text-[#687086] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#687086]" />
                      <span>{tkt.event_date}</span>
                    </div>
                    <div className="text-xs text-[#687086] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#687086]" />
                      <span>{tkt.venue}</span>
                    </div>
                  </div>

                  <Badge variant={tkt.checked_in ? 'active' : 'primary'}>
                    {tkt.checked_in ? 'Checked In' : 'Valid Pass'}
                  </Badge>
                </div>

                {/* QR Code and token info */}
                <div className="p-3.5 bg-[#F7F8FC] rounded-xl border border-[#E7E9F1] flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-[#171A2B]">
                      Attendee: {tkt.user_name} ({tkt.quantity} Seat{tkt.quantity > 1 ? 's' : ''})
                    </div>
                    <div className="text-[10px] font-mono text-[#687086] truncate max-w-[180px]">
                      {tkt.qr_token}
                    </div>
                    <div className="text-[11px] font-bold text-[#171A2B]">
                      {formatINR(tkt.total_amount_paise)}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModalTicket(tkt)}
                    className="p-2 bg-white rounded-xl border border-[#E7E9F1] shadow-2xs hover:border-[#625BF6] transition-colors flex flex-col items-center gap-1"
                    title="Click to view full-screen QR pass"
                  >
                    <QRCodeSVG value={tkt.qr_token} size={64} level="M" />
                    <span className="text-[9px] font-bold text-[#625BF6] uppercase">Enlarge</span>
                  </button>
                </div>

                <div className="text-[11px] text-[#687086] flex items-center justify-between pt-1">
                  <span>
                    {tkt.checked_in ? (
                      <span className="text-[#16856B] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified at {tkt.checked_in_at?.slice(11, 16)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#687086]" />
                        Ready for gate check-in
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setActiveModalTicket(tkt)}
                    className="text-xs font-semibold text-[#625BF6] hover:text-[#5048E5]"
                  >
                    Display Pass →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full-screen QR code viewer */}
        {activeModalTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-[#E7E9F1]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#625BF6]">
                  Gate Entry Verification
                </span>
                <button
                  onClick={() => setActiveModalTicket(null)}
                  className="p-1 rounded-lg text-[#687086] hover:text-[#171A2B] hover:bg-[#F7F8FC]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-white border border-[#E7E9F1] rounded-2xl shadow-inner inline-block">
                <QRCodeSVG value={activeModalTicket.qr_token} size={200} level="H" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#171A2B]">{activeModalTicket.event_title}</h3>
                <p className="text-xs text-[#687086]">Attendee: {activeModalTicket.user_name}</p>
                <div className="p-2 bg-[#F7F8FC] rounded-lg font-mono text-[11px] text-[#171A2B] border border-[#E7E9F1] select-all">
                  {activeModalTicket.qr_token}
                </div>
              </div>

              <p className="text-[11px] text-[#687086]">
                Hold steady in front of the organizer’s camera scanner at entry.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
