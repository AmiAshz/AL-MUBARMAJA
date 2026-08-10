"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Phone, ArrowRight, Loader2, AlertCircle, CheckCircle2, Circle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

// Helper for the timeline
const ALL_STATUSES = [
  'AWAITING_DIAGNOSIS',
  'IN_PROGRESS',
  'AWAITING_PARTS',
  'READY_FOR_PICKUP',
  'COMPLETED'
];

const getStatusIndex = (status: string) => ALL_STATUSES.indexOf(status);

function TrackContent() {
  const searchParams = useSearchParams();
  const [trackingCode, setTrackingCode] = useState(searchParams.get('code') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);

  // Auto-submit if both params are present on load
  React.useEffect(() => {
    if (searchParams.get('code') && searchParams.get('phone')) {
      const formEvent = { preventDefault: () => {} } as React.FormEvent;
      handleTrack(formEvent);
    }
  }, [searchParams]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const res = await fetch('http://localhost:5000/api/public/vehicle-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCode, phone })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Tracking failed');
      }

      setTrackingData(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AWAITING_DIAGNOSIS': return 'Vehicle Received & Awaiting Diagnosis';
      case 'IN_PROGRESS': return 'Repair In Progress';
      case 'AWAITING_PARTS': return 'Awaiting Parts for Repair';
      case 'READY_FOR_PICKUP': return 'Quality Check Passed - Ready for Pickup';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 relative overflow-x-hidden pt-24 pb-12">
      {/* Background Graphic elements */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center items-center opacity-20">
        <div className="w-[800px] h-[800px] rounded-full border border-primary/20 absolute blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        <Link href="/" className="flex flex-col items-center gap-2 group mb-8">
          <div className="w-10 h-10 rounded bg-surface-100 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors shadow-lg">
            <span className="font-display text-primary text-2xl leading-none mt-1">V</span>
          </div>
          <span className="font-display text-2xl tracking-widest uppercase">Vantara</span>
          <span className="text-xs text-secondary tracking-widest uppercase mt-1 opacity-70">The Journey Behind Every Repair.</span>
        </Link>

        <AnimatePresence mode="wait">
          {!trackingData ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              className="w-full bg-surface-50 border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-display uppercase tracking-wider mb-2 text-primary">Track Your Vehicle</h1>
                <p className="text-secondary text-sm">Enter the private tracking details provided by your workshop.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleTrack} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-secondary">Vantara Tracking Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                      <Key size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                      className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-4 font-mono tracking-widest text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all uppercase placeholder-white/20"
                      placeholder="VT-XXXX-XXXX-XXXX"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-secondary">Registered Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder-white/20"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-black font-semibold rounded-lg py-4 mt-6 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>Track Vehicle <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6"
            >
              {/* Vehicle Header */}
              <div className="bg-surface-50 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Key size={120} />
                </div>
                <div className="relative z-10">
                  <div className="text-xs text-primary font-medium tracking-widest uppercase mb-1">Your Vehicle</div>
                  <h2 className="text-3xl font-display uppercase tracking-wider">
                    {trackingData.vehicle.make} {trackingData.vehicle.model}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-surface-100 border border-white/10 rounded-full text-sm font-mono tracking-widest">{trackingData.vehicle.plateNumber}</span>
                    <span className="text-secondary text-sm">{trackingData.vehicle.year}</span>
                  </div>
                </div>
                
                <div className="relative z-10 bg-surface-100 border border-white/10 px-6 py-4 rounded-xl flex flex-col items-end">
                   <span className="text-xs text-secondary tracking-widest uppercase mb-1">Current Status</span>
                   <span className="text-lg text-primary font-semibold tracking-wide uppercase">{getStatusLabel(trackingData.status)}</span>
                </div>
              </div>

              {/* Cost/Estimate Module if visible */}
              {(trackingData.estimate || trackingData.finalCost) && (
                <div className="bg-surface-50 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                  <div className="text-xs text-primary font-medium tracking-widest uppercase mb-4">Financial Overview</div>
                  
                  {trackingData.estimate && (
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-lg font-medium">Repair Estimate</h3>
                        <p className="text-sm text-secondary mt-1 max-w-md">{trackingData.estimate.notes || 'Awaiting approval'}</p>
                      </div>
                      <div className="text-2xl font-mono text-primary">
                        ₹{trackingData.estimate.total.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {trackingData.finalCost && (
                    <div className="flex justify-between items-center pt-4">
                      <div>
                        <h3 className="text-lg font-medium">Final Repair Cost</h3>
                      </div>
                      <div className="text-2xl font-mono text-primary">
                        ₹{trackingData.finalCost.total.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Visual Timeline */}
              <div className="bg-surface-50 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="text-xs text-primary font-medium tracking-widest uppercase mb-8">Journey Timeline</div>
                
                <div className="relative">
                  {ALL_STATUSES.map((status, index) => {
                    const currentIndex = getStatusIndex(trackingData.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div key={status} className="flex items-start gap-6 mb-8 last:mb-0 relative">
                        {/* Connecting Line */}
                        {index < ALL_STATUSES.length - 1 && (
                          <div className={`absolute left-3 top-8 bottom-[-24px] w-0.5 ${isCompleted && index < currentIndex ? 'bg-primary/50' : 'bg-white/5'}`} />
                        )}
                        
                        {/* Icon */}
                        <div className="relative z-10 bg-surface-50 flex items-center justify-center pt-1">
                          {isCompleted ? (
                             <CheckCircle2 size={26} className="text-primary bg-background rounded-full" />
                          ) : (
                             <Circle size={26} className="text-white/20 bg-background rounded-full" />
                          )}
                        </div>

                        {/* Text */}
                        <div>
                          <h4 className={`text-sm uppercase tracking-wider font-medium ${isCompleted ? 'text-foreground' : 'text-secondary'}`}>
                            {getStatusLabel(status)}
                          </h4>
                          {isCurrent && (
                            <p className="text-sm text-primary/80 mt-1">
                              Your vehicle is currently at this stage.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Logs */}
              {trackingData.customerUpdates && trackingData.customerUpdates.length > 0 && (
                <div className="bg-surface-50 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                  <div className="text-xs text-primary font-medium tracking-widest uppercase mb-6">Recent Updates</div>
                  
                  <div className="space-y-4">
                    {trackingData.customerUpdates.map((update: any) => (
                      <div key={update.id} className="bg-surface-100 border border-white/5 p-4 rounded-xl flex gap-4 items-start">
                        <div className="mt-1">
                          <Clock size={16} className="text-primary/70" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground mb-1">{update.message}</p>
                          <span className="text-xs text-secondary">
                            {new Date(update.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => setTrackingData(null)}
                  className="text-sm text-secondary hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                  <ArrowRight size={16} className="rotate-180" /> Track Another Vehicle
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-24 text-center pb-8 relative z-10">
        <p className="text-secondary text-sm">Need help with your vehicle?</p>
        <p className="text-primary text-sm mt-1">Please contact the workshop directly.</p>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-mono animate-pulse">LOADING...</div>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
