import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Stethoscope, Plus } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Appointment {
  id: string;
  date: string;
  type: string;
  location?: string;
  provider?: {
    name: string;
    specialty: string;
  };
}

interface UpcomingAppointmentsWidgetProps {
  className?: string;
}

export function UpcomingAppointmentsWidget({ className = '' }: UpcomingAppointmentsWidgetProps) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadAppointments = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('health_appointments')
          .select(`
            id,
            date,
            type,
            location,
            provider:provider_id (
              name,
              specialty
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'scheduled')
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(5);
          
        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, [user]);
  
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let prefix = '';
    if (date.toDateString() === today.toDateString()) {
      prefix = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      prefix = 'Tomorrow';
    } else {
      prefix = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }
    
    const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${prefix} at ${time}`;
  };
  
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'checkup':
      case 'follow_up':
      case 'specialist':
        return <Stethoscope size={14} className="text-blue-500" />;
      case 'dental':
        return <Tooth size={14} className="text-cyan-500" />;
      case 'vision':
        return <Eye size={14} className="text-purple-500" />;
      case 'therapy':
        return <Brain size={14} className="text-pink-500" />;
      default:
        return <Calendar size={14} className="text-gray-500" />;
    }
  };
  
  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case 'checkup': return 'Check-up';
      case 'follow_up': return 'Follow-up';
      case 'specialist': return 'Specialist Visit';
      case 'dental': return 'Dental';
      case 'vision': return 'Vision';
      case 'therapy': return 'Therapy';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-[#1E1B4B]" />
            Upcoming Appointments
          </h3>
          <a 
            href="/dashboard/health/appointments" 
            className="text-xs text-[#1E1B4B] hover:text-[#2D2A6A]"
          >
            View All
          </a>
        </div>
        
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : appointments.length > 0 ? (
            appointments.map(appointment => (
              <div 
                key={appointment.id}
                className="p-3 rounded-lg bg-[#F5F8F7] hover:bg-[#E5EDEB] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg flex-shrink-0">
                    {getAppointmentTypeIcon(appointment.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getAppointmentTypeLabel(appointment.type)}
                      </span>
                      {appointment.provider && (
                        <span className="text-xs text-gray-500">
                          with Dr. {appointment.provider.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatAppointmentDate(appointment.date)}</span>
                      </div>
                      {appointment.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={12} />
                          <span className="truncate max-w-[120px]">{appointment.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              <p>No upcoming appointments</p>
              <a 
                href="/dashboard/health/appointments" 
                className="mt-2 inline-block text-[#1E1B4B] hover:text-[#2D2A6A]"
              >
                Schedule an appointment
              </a>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <a 
            href="/dashboard/health/appointments" 
            className="text-xs text-[#1E1B4B] hover:text-[#2D2A6A] flex items-center gap-1"
          >
            <Plus size={12} />
            <span>Add new appointment</span>
          </a>
        </div>
      </div>
    </Card>
  );
}

// Helper components for this file only
function Tooth({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 5.5c-1.5-2-3-2.5-4-2.5-3 0-5 2.5-5 5 0 2.5 2 3.5 2 5s-2 2.5-2 5c0 2.5 2 4.5 5 4.5 1 0 2.5-.5 4-2.5 1.5 2 3 2.5 4 2.5 3 0 5-2 5-4.5 0-2.5-2-3.5-2-5s2-2.5 2-5c0-2.5-2-5-5-5-1 0-2.5.5-4 2.5z"></path>
    </svg>
  );
}

function Eye({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function Brain({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
    </svg>
  );
}