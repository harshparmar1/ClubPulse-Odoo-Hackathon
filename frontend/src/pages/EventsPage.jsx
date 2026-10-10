import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Search, Tag, Sparkles, Ticket, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/Badge';
import { EventBookingModal } from '../components/EventBookingModal';
import { EmptyState } from '../components/EmptyState';

export const EventsPage = () => {
  const { isMember, role, loading: authLoading } = useAuth();
  const isStaff = ['organizer', 'admin', 'treasurer'].includes(role);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (!authLoading && ['organizer', 'admin', 'treasurer'].includes(role)) {
    return <Navigate to="/organizer/events" replace />;
  }

  const fetchEvents = async () => {
    try {
      const data = await api.get('/api/events?published_only=true');
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
    if (e.is_published === false) return false;
    // If student has not bought membership, hide free membership events
    if (!isMember && !isStaff && e.member_price_paise === 0) {
      return false;
    }
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'All' || (e.tags && e.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chapter Calendar 2026</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#171A2B]">
              Upcoming Organization Events
            </h1>
            <p className="text-xs sm:text-sm text-[#687086] mt-1 max-w-xl">
              Register for hackathons, technical masterclasses, and networking banquets. 
              Active members automatically unlock preferential seating and ticket discounts.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-[#687086] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search event, topic, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-white text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6] shadow-2xs"
            />
          </div>
        </div>

        {/* Non-member benefit banner */}
        {!isMember && !isStaff && (
          <div className="p-3.5 bg-gradient-to-r from-[#625BF6]/10 to-indigo-50 border border-[#625BF6]/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#171A2B] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#625BF6] shrink-0" />
              <span>
                <strong>Chapter Members</strong> get free access to exclusive member workshops and 50% discount on hackathons.
              </span>
            </div>
            <a
              href="/membership"
              className="inline-flex items-center gap-1 font-bold text-[#625BF6] hover:text-[#5048E5] transition-colors shrink-0"
            >
              <span>Unlock Member Benefits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Category Tags & Count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-[#687086]">
            Showing <span className="font-bold text-[#171A2B]">{filteredEvents.length}</span> published chapter events
          </div>

          {/* Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {tagsList.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
                  selectedTag === tag
                    ? 'bg-[#625BF6] text-white shadow-2xs'
                    : 'bg-white text-[#687086] border border-[#E7E9F1] hover:bg-[#F7F8FC]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-[#E7E9F1]"></div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-[#E7E9F1]">
            <EmptyState
              icon={Ticket}
              title="No events match your criteria"
              description="Try clearing your search query or selecting a different tag."
            />
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
                  className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs hover:shadow-md hover:border-[#625BF6]/40 transition-all flex flex-col overflow-hidden group"
                >
                  {/* Banner */}
                  <div className="h-44 w-full bg-[#F7F8FC] relative overflow-hidden">
                    <img
                      src={evt.banner_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {isFull ? (
                        <Badge variant="critical">Sold Out</Badge>
                      ) : (
                        <Badge variant="active">{capacity - booked} Seats Left</Badge>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {evt.tags?.map((t) => (
                          <span key={t} className="text-[10px] font-semibold text-[#687086] bg-[#F7F8FC] border border-[#E7E9F1] px-2 py-0.5 rounded-md">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-bold text-base text-[#171A2B] group-hover:text-[#625BF6] transition-colors line-clamp-1">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-[#687086] line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="pt-2 text-xs text-[#687086] space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#625BF6]" />
                          <span>{evt.event_date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#625BF6]" />
                          <span>{evt.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity & Price Bottom */}
                    <div className="pt-3 border-t border-[#E7E9F1] space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-[#687086] mb-1">
                          <span>Capacity status</span>
                          <span>{booked} / {capacity} ({fillPercentage}%)</span>
                        </div>
                        <div className="w-full bg-[#F7F8FC] border border-[#E7E9F1] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              fillPercentage >= 90 ? 'bg-[#D98A18]' : 'bg-[#16856B]'
                            }`}
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-medium text-[#687086]">Ticket Price</div>
                          <div className="text-xs font-bold text-[#171A2B]">
                            {evt.member_price_paise === 0 ? (
                              <span className="text-[#16856B] font-bold">Free for Members</span>
                            ) : (
                              <span>{formatINR(evt.member_price_paise)} (Members)</span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#687086]">
                            {formatINR(evt.non_member_price_paise)} Standard
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedEvent(evt)}
                          disabled={isFull}
                          className="px-4 py-2 bg-[#625BF6] hover:bg-[#5048E5] disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
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
