import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Search, Tag, Sparkles, Ticket } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/Badge';
import { EventBookingModal } from '../components/EventBookingModal';

export const EventsPage = () => {
  const { isMember } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  const tagsList = ['All', 'Hackathon', 'Workshop', 'AI', 'Coding', 'Gala', 'Prizes'];

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'All' || (e.tags && e.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chapter Calendar 2026</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Upcoming Organization Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Register for hackathons, technical masterclasses, and networking banquets. 
              Active members automatically unlock preferential seating and ticket discounts.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search event, topic, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {tagsList.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No events matched your search</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const capacity = evt.capacity || 100;
              const booked = evt.booked_count || 0;
              const fillPercentage = Math.min(100, Math.round((booked / capacity) * 100));
              const isFull = booked >= capacity;

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col overflow-hidden group"
                >
                  {/* Banner */}
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={evt.banner_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {isFull ? (
                        <Badge variant="critical">Sold Out</Badge>
                      ) : (
                        <Badge variant="primary">{capacity - booked} Seats Left</Badge>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {evt.tags?.map((t) => (
                          <span key={t} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="pt-2 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{evt.event_date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{evt.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity & Price Bottom */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>Capacity status</span>
                          <span>{booked} / {capacity} ({fillPercentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              fillPercentage >= 90 ? 'bg-amber-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-medium text-slate-400">Ticket Price</div>
                          <div className="text-xs font-bold text-slate-800">
                            {evt.member_price_paise === 0 ? (
                              <span className="text-teal-600 font-extrabold">Free for Members</span>
                            ) : (
                              <span>{formatINR(evt.member_price_paise)} (Members)</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatINR(evt.non_member_price_paise)} Standard
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedEvent(evt)}
                          disabled={isFull}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                        >
                          {isFull ? 'Sold Out' : 'Register Pass'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {selectedEvent && (
        <EventBookingModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onBookSuccess={() => {
            fetchEvents();
          }}
        />
      )}
    </div>
  );
};
