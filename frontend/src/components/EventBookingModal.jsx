import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api, formatINR } from '../api/client';
import {
  X,
  Ticket,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Users,
  Check
} from 'lucide-react';

export const EventBookingModal = ({ event, isOpen, onClose, onBookSuccess }) => {
  const { user, isMember, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedRole, setSelectedRole] = useState('participant'); // 'participant' or 'volunteer'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookedTicket, setBookedTicket] = useState(null);

  if (!isOpen || !event) return null;

  const unitPricePaise = isMember ? event.member_price_paise : event.non_member_price_paise;
  const totalPricePaise = unitPricePaise * quantity;
  const remainingCapacity = Math.max(0, event.capacity - (event.booked_count || 0));

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/tickets/book', {
        event_id: event.id,
        quantity,
        role_track: isMember ? selectedRole : 'participant'
      });
      setBookedTicket(res);
      if (refreshUser) {
        try {
          await refreshUser();
        } catch {}
      }
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {}
      if (onBookSuccess) onBookSuccess(res);
    } catch (err) {
      setError(err.message || 'Ticket booking could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Event Registration Pass</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {bookedTicket ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {bookedTicket.role_track === 'volunteer'
                    ? 'Volunteer Registration Confirmed!'
                    : 'Pass Registration Confirmed!'}
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1">
                  {bookedTicket.role_track === 'volunteer'
                    ? 'You are registered on the Volunteer Operations crew for this event. Tasks and Scanner access are active.'
                    : 'Your attendee pass has been generated with a unique check-in QR code token:'}
                </p>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-slate-800 font-semibold border border-slate-200 flex items-center justify-between px-4">
                <span>{bookedTicket.qr_token}</span>
                <span className="text-[10px] font-sans font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {bookedTicket.role_track === 'volunteer' ? 'Volunteer Track' : 'Participant Track'}
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/my-tickets');
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>View Ticket QR Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Event details snippet */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Date & Time:</span>
                  <strong className="text-slate-800">{event.event_date}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Venue:</span>
                  <strong className="text-slate-800">{event.venue}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Seats Available:</span>
                  <strong className="text-teal-700">{remainingCapacity} of {event.capacity}</strong>
                </div>
              </div>

              {/* Membership Discount Callout */}
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                isMember ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    {isMember
                      ? 'Member benefit active: 50% discount unlocked'
                      : 'Standard non-member rate applied.'}
                  </span>
                </div>
                <strong className="text-sm font-bold">
                  {unitPricePaise === 0 ? 'Free Pass' : `${formatINR(unitPricePaise)}/ticket`}
                </strong>
              </div>

              {/* Chapter Role Track Selection: Shown ONLY if user has active membership */}
              {isMember && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                      <span>Choose Your Chapter Role Track</span>
                    </label>
                    <span className="text-[11px] text-indigo-600 font-semibold">Active Member Privilege</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option A: Participant Track */}
                    <div
                      onClick={() => setSelectedRole('participant')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                        selectedRole === 'participant'
                          ? 'bg-indigo-50/50 border-indigo-600 shadow-xs ring-2 ring-indigo-600/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              selectedRole === 'participant' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-900 leading-tight">As a Participant</h5>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                              Attendee & Competitor
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            selectedRole === 'participant' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {selectedRole === 'participant' && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Hackathons, workshops & chapter networking. Direct competition & verified attendee credential.
                      </p>
                    </div>

                    {/* Option B: Volunteer Track */}
                    <div
                      onClick={() => setSelectedRole('volunteer')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                        selectedRole === 'volunteer'
                          ? 'bg-indigo-50/50 border-indigo-600 shadow-xs ring-2 ring-indigo-600/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              selectedRole === 'volunteer' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-900 leading-tight">As a Volunteer</h5>
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                              Operations & Logistics
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            selectedRole === 'volunteer' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {selectedRole === 'volunteer' && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Event organizing crew. Unlocks volunteer task sprint boards & check-in gate scanner.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Number of Attendees
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="px-5 py-2 text-sm font-bold text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(remainingCapacity, quantity + 1))}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">Max 10 passes per checkout</span>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Total payable</span>
                  <div className="text-xl font-extrabold text-slate-900">{formatINR(totalPricePaise)}</div>
                </div>
                <button
                  onClick={handleBook}
                  disabled={loading || remainingCapacity === 0}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <span>
                    {loading
                      ? 'Confirming...'
                      : isMember
                      ? `Confirm as ${selectedRole === 'volunteer' ? 'Volunteer' : 'Participant'}`
                      : 'Confirm Registration'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
