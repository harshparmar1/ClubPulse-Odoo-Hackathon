import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api, formatINR } from '../api/client';
import { X, Ticket, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const EventBookingModal = ({ event, isOpen, onClose, onBookSuccess }) => {
  const { user, isMember } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
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
        quantity
      });
      setBookedTicket(res);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Event Registration</h3>
              <p className="text-xs text-slate-500">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
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
              <h4 className="text-lg font-bold text-slate-900">Registration Confirmed!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Your ticket pass has been generated with a unique QR code token:
              </p>
              <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-slate-800 font-semibold border border-slate-200">
                {bookedTicket.qr_token}
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
                      ? 'Member perk applied: 50% discount active'
                      : 'Non-member rate applied. Join chapter to save 50%.'}
                  </span>
                </div>
                <strong className="text-sm font-bold">
                  {formatINR(unitPricePaise)}/ticket
                </strong>
              </div>

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
                  <span>{loading ? 'Confirming...' : 'Confirm Registration'}</span>
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
