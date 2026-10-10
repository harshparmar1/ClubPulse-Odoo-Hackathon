import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { Calendar, Plus, Users, MapPin, Ticket, CheckCircle2, X } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';

export const EventsManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [capacity, setCapacity] = useState(150);
  const [memberPriceInr, setMemberPriceInr] = useState(100);
  const [nonMemberPriceInr, setNonMemberPriceInr] = useState(200);
  const [requiredVolunteers, setRequiredVolunteers] = useState(5);
  const [budgetInr, setBudgetInr] = useState(25000);
  const [bannerUrl, setBannerUrl] = useState('');
  const [tags, setTags] = useState('Hackathon, Coding');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await api.get('/api/events');
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await api.post('/api/events', {
        title,
        description,
        venue,
        event_date: eventDate,
        capacity: Number(capacity),
        member_price_paise: Math.round(Number(memberPriceInr) * 100),
        non_member_price_paise: Math.round(Number(nonMemberPriceInr) * 100),
        required_volunteer_count: Number(requiredVolunteers),
        estimated_budget_paise: Math.round(Number(budgetInr) * 100),
        banner_url: bannerUrl || null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        is_published: true
      });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setVenue('');
      fetchEvents();
    } catch (err) {
      alert(`Event creation failed: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Events Administration</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Event Logistics & Ticketing Hub
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create official chapter events, set seating caps, specify volunteer roles, and monitor ticket reservations.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Event Title & Venue</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Bookings</th>
                  <th className="py-3 px-4">Checked-In</th>
                  <th className="py-3 px-4">Member / Non-Member</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Volunteers Req</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{evt.title}</div>
                      <div className="text-[11px] text-slate-400">{evt.venue}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{evt.event_date}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{evt.booked_count}</span>
                      <span className="text-slate-400"> / {evt.capacity}</span>
                    </td>
                    <td className="py-3 px-4 text-teal-700 font-bold">{evt.checked_in_count} verified</td>
                    <td className="py-3 px-4">
                      <span className="text-teal-700 font-semibold">{formatINR(evt.member_price_paise)}</span> /{' '}
                      <span className="text-slate-600">{formatINR(evt.non_member_price_paise)}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatINR(evt.estimated_budget_paise)}
                    </td>
                    <td className="py-3 px-4">{evt.required_volunteer_count} volunteers</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Event Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Create New Chapter Event</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Devcon & Hackathon"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Objectives
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Summarize key event highlights, schedule, tracks..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hall A, Tech Campus"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date & Time (YYYY-MM-DD HH:MM)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="2026-11-15 09:30"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Member Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={memberPriceInr}
                      onChange={(e) => setMemberPriceInr(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Non-Member (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={nonMemberPriceInr}
                      onChange={(e) => setNonMemberPriceInr(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Required Volunteers
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={requiredVolunteers}
                      onChange={(e) => setRequiredVolunteers(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estimated Cost Budget (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={budgetInr}
                      onChange={(e) => setBudgetInr(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                  >
                    {createLoading ? 'Publishing...' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
