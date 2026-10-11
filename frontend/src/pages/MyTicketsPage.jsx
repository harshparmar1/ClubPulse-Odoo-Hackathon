import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { api, formatINR } from '../api/client';
import { Ticket, Calendar, MapPin, CheckCircle2, Clock, QrCode, X, Sparkles, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PassQRModal } from '../components/PassQRModal';
import { buildTicketQRData } from '../utils/ticketQR';

export const MyTicketsPage = () => {
  const { user } = useAuth();
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

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      tkt.role_track === 'volunteer'
                        ? 'bg-[#625BF6]/10 text-[#625BF6] border-[#625BF6]/20'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {tkt.role_track === 'volunteer' ? '🤝 Volunteer' : '🎓 Participant'}
                    </span>
                    <Badge variant={tkt.checked_in ? 'active' : 'primary'}>
                      {tkt.checked_in ? 'Checked In' : 'Valid Pass'}
                    </Badge>
                  </div>
                </div>

                {/* QR Code and token info */}
                <div className="p-3.5 bg-[#F7F8FC] rounded-xl border border-[#E7E9F1] flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-[#171A2B]">
                      Attendee: {tkt.user_name || user?.full_name} ({tkt.user_roll_number || user?.roll_number || 'ID Verified'})
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
                    className="p-2 bg-white rounded-xl border border-[#E7E9F1] shadow-2xs hover:border-[#625BF6] transition-colors flex flex-col items-center gap-1 cursor-pointer"
                    title="Click to view full-screen QR pass and student credentials"
                  >
                    <QRCodeSVG value={buildTicketQRData(tkt, user)} size={64} level="M" />
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

        {/* Full-screen QR code viewer with Attendee Profile */}
        <PassQRModal
          ticket={activeModalTicket}
          user={user}
          isOpen={Boolean(activeModalTicket)}
          onClose={() => setActiveModalTicket(null)}
        />
      </div>
    </DashboardLayout>
  );
};
