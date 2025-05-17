import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'health' | 'legal' | 'financial' | 'other';
}

interface CalendarWidgetProps {
  className?: string;
}

export function CalendarWidget({ className = '' }: CalendarWidgetProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadEvents = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Load health appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('health_appointments')
          .select('id, date, type, location')
          .eq('user_id', user.id)
          .gte('date', new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString())
          .lte('date', new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString());
          
        if (appointmentsError) throw appointmentsError;
        
        // Convert appointments to calendar events
        const appointmentEvents: CalendarEvent[] = (appointmentsData || []).map(appointment => ({
          id: `appointment_${appointment.id}`,
          title: `${appointment.type} appointment`,
          date: new Date(appointment.date),
          type: 'health'
        }));
        
        // Add some mock events for demonstration
        const mockEvents: CalendarEvent[] = [
          {
            id: 'mock_1',
            title: 'Insurance Review',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
            type: 'financial'
          },
          {
            id: 'mock_2',
            title: 'Will Update',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
            type: 'legal'
          }
        ];
        
        setEvents([...appointmentEvents, ...mockEvents]);
      } catch (error) {
        console.error('Error loading calendar events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [user, currentDate]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const calendar = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const dayEvents = events.filter(event => event.date.toDateString() === date.toDateString());
      const hasEvents = dayEvents.length > 0;
      
      calendar.push(
        <div 
          key={`day-${day}`} 
          className={`h-8 w-8 flex items-center justify-center rounded-full text-sm relative
            ${isToday ? 'bg-[#1E1B4B] text-white font-medium' : 'hover:bg-[#E5EDEB] cursor-pointer'}
          `}
          title={dayEvents.map(e => e.title).join(', ')}
        >
          {day}
          {hasEvents && (
            <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
              dayEvents.some(e => e.type === 'health') ? 'bg-green-500' :
              dayEvents.some(e => e.type === 'legal') ? 'bg-blue-500' :
              dayEvents.some(e => e.type === 'financial') ? 'bg-amber-500' :
              'bg-gray-500'
            }`}></span>
          )}
        </div>
      );
    }
    
    return calendar;
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'health':
        return 'bg-green-500';
      case 'legal':
        return 'bg-blue-500';
      case 'financial':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get upcoming events (sorted by date)
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#1E1B4B]" />
            Calendar
          </h3>
          <div className="flex items-center gap-1">
            <button 
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-[#E5EDEB] text-[#1E1B4B]"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-[#E5EDEB] text-[#1E1B4B]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="text-center mb-2">
          <h4 className="font-medium text-[#1E1B4B]">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h4>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs text-gray-500 font-medium text-center">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {loading ? (
            Array(35).fill(0).map((_, i) => (
              <div key={i} className="h-8 w-8 animate-pulse bg-gray-100 rounded-full"></div>
            ))
          ) : (
            renderCalendar()
          )}
        </div>
        
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Upcoming Events</h4>
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`}></div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {event.date.toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">No upcoming events</p>
          )}
        </div>
      </div>
    </Card>
  );
}