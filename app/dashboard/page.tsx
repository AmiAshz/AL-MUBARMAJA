"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, X, PenTool, Trash2, Printer, 
  CheckCircle, Camera, LogOut, User, AlertCircle
} from 'lucide-react';
import { useVehicles } from '@/lib/useVehicles';
import { Vehicle, VehicleStatus, VehiclePhoto, PhotoCategory } from '@/lib/types';
import { processImageFile } from '@/lib/imageUtils';
import Link from 'next/link';
import { openWhatsAppWeb } from '@/lib/whatsapp';

const STATUS_COLORS: Record<VehicleStatus, string> = {
  'AWAITING_DIAGNOSIS': 'text-accent-steel border-accent-steel bg-accent-steel/10',
  'IN_PROGRESS': 'text-primary border-primary bg-primary/10',
  'AWAITING_PARTS': 'text-accent-rust border-accent-rust bg-accent-rust/10',
  'READY_FOR_PICKUP': 'text-accent-green border-accent-green bg-accent-green/10',
  'COMPLETED': 'text-accent-green border-accent-green bg-accent-green/10',
};

const BORDER_COLORS: Record<VehicleStatus, string> = {
  'AWAITING_DIAGNOSIS': 'border-l-accent-steel',
  'IN_PROGRESS': 'border-l-primary',
  'AWAITING_PARTS': 'border-l-accent-rust',
  'READY_FOR_PICKUP': 'border-l-accent-green',
  'COMPLETED': 'border-l-accent-green',
};

type FilterCategory = 'AWAITING_DIAGNOSIS' | 'IN_PROGRESS' | 'AWAITING_PARTS' | 'READY_FOR_PICKUP' | 'COMPLETED';

const FILTER_MAP: Record<FilterCategory, VehicleStatus[]> = {
  'AWAITING_DIAGNOSIS': ['AWAITING_DIAGNOSIS'],
  'IN_PROGRESS': ['IN_PROGRESS'],
  'AWAITING_PARTS': ['AWAITING_PARTS'],
  'READY_FOR_PICKUP': ['READY_FOR_PICKUP'],
  'COMPLETED': ['COMPLETED']
};

const ACTIVE_STATUSES = [
  'AWAITING_DIAGNOSIS', 'IN_PROGRESS', 'AWAITING_PARTS', 'READY_FOR_PICKUP'
];

const fmtC = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

export default function DashboardPage() {
  const { vehicles, isLoaded, addVehicle, updateVehicle, updateVehicleStatus, deleteVehicle, addProgressNote, addPhoto, addAdditionalRepair, createEstimate, updateFinalCost, resendTrackingMessage, regenerateTrackingCode, resendCompletionMessage, markWhatsappAsSent } = useVehicles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterCategory | 'All'>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formVehicle, setFormVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(current => current?.message === message ? null : current);
    }, 4500);
  };

  const currentUser = React.useMemo(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }, []);

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/login');
  };

  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter(v => ACTIVE_STATUSES.includes(v.status)).length;
    const parts = vehicles.filter(v => v.status === 'AWAITING_PARTS').length;
    const ready = vehicles.filter(v => v.status === 'READY_FOR_PICKUP').length;
    
    let awaitingEstimate = 0;
    let estimatedValue = 0;

    vehicles.forEach(v => {
      // If there are no estimates, or the latest estimate is not approved/sent
      const hasEstimate = v.estimates && v.estimates.length > 0;
      if (['AWAITING_DIAGNOSIS', 'IN_PROGRESS'].includes(v.status) && !hasEstimate) {
        awaitingEstimate++;
      }
      if (v.status !== 'COMPLETED' && hasEstimate) {
        // Just sum up the latest estimate total
        const latestEst = v.estimates![0];
        estimatedValue += latestEst.total;
        
        const add = (v.additionalRepairs || []).reduce((s, r) => s + r.partsCost + r.laborCost, 0);
        estimatedValue += add;
      }
    });

    return { total, active, parts, ready, awaitingEstimate, estimatedValue };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        (v.plateNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.ownerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.make?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.model?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.jobNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || FILTER_MAP[statusFilter].includes(v.status);
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchQuery, statusFilter]);

  if (!isLoaded) return <div className="min-h-screen bg-[#080808] flex items-center justify-center text-primary font-mono text-sm tracking-widest uppercase">Initializing Telemetry...</div>;

  return (
    <div className="min-h-screen bg-[#080808] text-foreground flex flex-col font-sans">
      
      <header className="print:hidden border-b border-white/10 bg-[#0C0C0C] sticky top-0 z-30">
        <div className="px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-display text-3xl font-bold tracking-widest uppercase text-white hover:text-primary transition-colors">
              Vantara
            </Link>
            <div className="h-6 w-px bg-white/10 hidden md:block"></div>
            <div className="flex flex-col hidden md:flex">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-primary">Command Center</span>
              <span className="text-xs text-secondary italic">"The Journey Behind Every Repair."</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 border border-white/10 bg-[#080808]">
                <User size={12} className="text-secondary" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-secondary">{currentUser.name}</span>
                <span className="text-[9px] font-mono text-primary/60 uppercase">{currentUser.role?.replace('_', ' ')}</span>
              </div>
            )}
            <button 
              onClick={() => { setFormVehicle(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-[#080808] font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Intake Vehicle
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-secondary hover:text-white hover:border-white/30 transition-colors text-xs font-mono uppercase tracking-widest"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
        
        <div className="border-t border-white/5 bg-[#050505] flex overflow-x-auto hide-scrollbar">
          <TelemetryNode label="Total Vehicles" value={stats.total} />
          <TelemetryNode label="Active Jobs" value={stats.active} color="text-primary" />
          <TelemetryNode label="Awaiting Parts" value={stats.parts} color="text-accent-rust" alert={stats.parts > 0} />
          <TelemetryNode label="Ready for Pickup" value={stats.ready} color="text-accent-green" />
          <TelemetryNode label="Awaiting Estimate" value={stats.awaitingEstimate} color="text-secondary" />
          <TelemetryNode label="Est. Workshop Value" value={fmtC(stats.estimatedValue)} color="text-primary" isCurrency />
        </div>
      </header>

      <main className="print:hidden flex-1 p-8 w-full flex flex-col gap-8 max-w-[2000px] mx-auto">
        
        <section className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
            <input 
              type="text" 
              placeholder="[ SEARCH PLATE, VIN, OR OWNER ]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0C0C0C] border border-white/10 py-3.5 pl-11 pr-4 text-xs font-mono tracking-wider focus:outline-none focus:border-primary/50 transition-colors uppercase placeholder:text-white/20"
            />
          </div>
          
          <div className="flex flex-nowrap overflow-x-auto hide-scrollbar border border-white/10 bg-[#0C0C0C]">
            {(['All', 'AWAITING_DIAGNOSIS', 'IN_PROGRESS', 'AWAITING_PARTS', 'READY_FOR_PICKUP', 'COMPLETED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-r border-white/5 last:border-r-0 ${
                  statusFilter === s ? 'bg-primary text-[#080808]' : 'bg-transparent text-secondary hover:bg-white/5'
                }`}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </section>

        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-max">
          <AnimatePresence>
            {filteredVehicles.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center flex flex-col items-center justify-center border border-white/10 bg-[#0C0C0C]">
                <div className="text-secondary font-mono text-sm tracking-widest uppercase mb-2">No Records Found</div>
                <div className="text-white/20 text-xs">Adjust filter or search parameters.</div>
              </motion.div>
            ) : (
              filteredVehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v} onClick={() => setSelectedVehicle(v)} />
              ))
            )}
          </AnimatePresence>
        </section>

      </main>

      <AnimatePresence>
        {isFormOpen && (
          <VehicleFormModal 
            vehicle={formVehicle}
            onClose={() => setIsFormOpen(false)} 
            onSave={async (data: any) => {
              if (formVehicle) {
                await updateVehicle(formVehicle.id, data);
                return true;
              } else {
                return await addVehicle(data);
              }
            }} 
            resendTrackingMessage={resendTrackingMessage}
            setSelectedVehicle={setSelectedVehicle}
            markWhatsappAsSent={markWhatsappAsSent}
            showToast={showToast}
            setConfirmModal={setConfirmModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetailModal
            vehicle={vehicles.find(v => v.id === selectedVehicle.id)!}
            onClose={() => setSelectedVehicle(null)}
            onEdit={() => { setFormVehicle(selectedVehicle); setIsFormOpen(true); setSelectedVehicle(null); }}
            onDelete={() => {
              if (confirm("Remove this vehicle?")) {
                deleteVehicle(selectedVehicle.id);
                setSelectedVehicle(null);
              }
            }}
            onUpdate={updateVehicle}
            onUpdateStatus={updateVehicleStatus}
            onAddNote={addProgressNote}
            onAddPhoto={addPhoto}
            onAddRepair={addAdditionalRepair}
            onCreateEstimate={createEstimate}
            onUpdateFinalCost={updateFinalCost}
            onResendTracking={resendTrackingMessage}
            onRegenerateTracking={regenerateTrackingCode}
            onResendCompletion={resendCompletionMessage}
            markWhatsappAsSent={markWhatsappAsSent}
            showToast={showToast}
            setConfirmModal={setConfirmModal}
          />
        )}
      </AnimatePresence>

      {selectedVehicle && <PrintJobSheet vehicle={vehicles.find(v => v.id === selectedVehicle.id)!} />}

      {/* Floating in-page Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] bg-[#0C0C0C] border border-white/10 p-4 shadow-2xl flex items-center gap-3 font-mono text-xs max-w-sm rounded"
          >
            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-accent-green' : toast.type === 'info' ? 'bg-primary' : 'bg-accent-rust'}`} />
            <span className="text-white flex-1 leading-relaxed">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-secondary hover:text-white ml-2"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal?.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0C0C0C] border border-white/10 shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 text-left"
            >
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
                {confirmModal.title}
              </h3>
              <p className="text-xs font-mono text-secondary leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white text-xs font-mono uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 py-2.5 bg-accent-green hover:bg-accent-green/90 text-black font-semibold text-xs font-mono uppercase tracking-widest"
                >
                  Yes, Mark as Sent
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TelemetryNode({ label, value, color = "text-white", alert = false, isCurrency = false }: any) {
  return (
    <div className="flex-1 min-w-[200px] p-6 border-r border-white/5 last:border-r-0 flex flex-col justify-center relative overflow-hidden group">
      {alert && <div className="absolute top-0 right-0 w-2 h-2 bg-accent-rust rounded-full m-4 animate-pulse"></div>}
      <span className="text-[9px] text-secondary font-mono uppercase tracking-[0.2em] mb-2">{label}</span>
      <span className={`text-3xl font-display font-bold ${color} ${isCurrency ? 'tracking-normal' : 'tracking-tight'}`}>{value}</span>
    </div>
  );
}

function VehicleCard({ vehicle, onClick }: { vehicle: Vehicle, onClick: () => void }) {
  const mainComplaints = vehicle.complaints?.slice(0, 3).map(c => c.description) || [];
  const extraComplaints = (vehicle.complaints?.length || 0) - 3;
  const hasPhotos = vehicle.photos && vehicle.photos.length > 0;
  
  let costLabel = 'COST';
  let costValue = 'Not estimated';
  
  if (vehicle.status === 'COMPLETED' && vehicle.finalTotalCost !== null && vehicle.finalTotalCost !== undefined) {
    costLabel = 'FINAL';
    costValue = fmtC(vehicle.finalTotalCost);
  } else if (vehicle.estimates && vehicle.estimates.length > 0) {
    costLabel = 'ESTIMATED';
    const latestEst = vehicle.estimates[0];
    const addSum = (vehicle.additionalRepairs || []).reduce((s, r) => s + r.partsCost + r.laborCost, 0);
    costValue = fmtC(latestEst.total + addSum);
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`relative bg-[#0C0C0C] border border-white/5 border-l-4 ${BORDER_COLORS[vehicle.status]} cursor-pointer hover:border-r-white/20 hover:border-y-white/20 transition-all flex flex-col min-h-[280px] group overflow-hidden`}
    >
      <div className={`absolute -right-8 top-5 rotate-45 w-40 text-center py-1 text-[8px] font-bold uppercase tracking-[0.2em] shadow-md z-10 ${STATUS_COLORS[vehicle.status]}`}>
        {vehicle.status}
      </div>

      <div className="p-6 flex flex-col h-full relative z-0">
        <div className="flex justify-between items-start mb-6 gap-2">
          <div className="min-w-0 pr-8">
            <div className="font-display font-bold text-2xl tracking-wider text-white group-hover:text-primary transition-colors truncate flex items-center gap-2">
              {vehicle.plateNumber}
            </div>
            <div className="text-[10px] font-mono text-secondary tracking-widest mt-1 flex items-center gap-2">
              {vehicle.jobNumber}
              {hasPhotos && <Camera size={10} className="text-primary" />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 text-xs border-y border-white/5 py-4">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-secondary font-mono mb-1">Make / Model</span>
            <span className="text-white/90 truncate">{vehicle.make} {vehicle.model}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-secondary font-mono mb-1">Owner</span>
            <span className="text-white/90 truncate">{vehicle.ownerName}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {mainComplaints.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-secondary font-mono">
              <span className="text-primary mt-0.5 opacity-50">{">"}</span>
              <span className="line-clamp-1">{c}</span>
            </div>
          ))}
          {extraComplaints > 0 && (
            <div className="text-[10px] text-primary font-mono pl-4 mt-1">+{extraComplaints} more complaints</div>
          )}
        </div>

        <div className="pt-4 mt-4 flex justify-between items-end border-t border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-widest text-secondary font-mono">Date In</span>
            <span className="text-xs font-medium text-white/70">{vehicle.dateBroughtIn}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] uppercase tracking-widest text-secondary font-mono">{costLabel}</span>
            <span className={`text-sm font-bold tracking-widest ${costValue === 'Not estimated' ? 'text-white/30 italic' : 'text-white'}`}>
              {costValue}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VehicleFormModal({ vehicle, onClose, onSave, resendTrackingMessage, setSelectedVehicle, markWhatsappAsSent, showToast, setConfirmModal }: any) {
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [createdVehicle, setCreatedVehicle] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    plateNumber: vehicle?.plateNumber || vehicle?.plate || '',
    vin: vehicle?.vin || '',
    ownerName: vehicle?.ownerName || '',
    ownerPhone: vehicle?.ownerPhone || '',
    dateBroughtIn: vehicle?.dateBroughtIn || new Date().toISOString().split('T')[0],
    complaints: vehicle?.complaints?.length ? vehicle.complaints.map((c: any) => c.description || c) : [''],
    status: vehicle?.status || 'AWAITING_DIAGNOSIS',
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos: VehiclePhoto[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        try {
          const dataUrl = await processImageFile(e.target.files[i]);
          newPhotos.push({ 
            id: crypto.randomUUID(), timestamp: new Date().toISOString(), category: 'Vehicle Arrival', dataUrl 
          });
        } catch(err) {}
      }
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await onSave({
        ...formData,
        complaints: formData.complaints.filter((c: string) => c.trim() !== ''),
        photos: [...(vehicle?.photos || []), ...photos]
      });

      if (vehicle) {
        // Edit mode
        onClose();
      } else {
        // Create mode
        if (res) {
          setCreatedVehicle(res);
        } else {
          setError('Failed to create vehicle. Check backend connection.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  // States for WhatsApp manual intake sending
  const [waStatus, setWaStatus] = useState<'NOT_SENT' | 'WHATSAPP_OPENED' | 'SENT' | 'FAILED'>('NOT_SENT');
  const [waSentAt, setWaSentAt] = useState<string | null>(null);
  const [showConfirmIntake, setShowConfirmIntake] = useState(false);

  if (createdVehicle) {
    const ownerPhone = createdVehicle.ownerPhone || '';
    const trackingLink = `${window.location.origin}/track?code=${createdVehicle.trackingCode}&phone=${encodeURIComponent(ownerPhone)}`;
    const intakeMessage = `VANTARA\n\n` +
      `The Journey Behind Every Repair.\n\n` +
      `Your vehicle has been registered with our workshop.\n\n` +
      `Vehicle:\n${createdVehicle.make} ${createdVehicle.model} ${createdVehicle.year || ''}\n\n` +
      `Registration:\n${createdVehicle.plateNumber}\n\n` +
      `Your tracking number:\n${createdVehicle.trackingCode}\n\n` +
      `Track your vehicle:\n${window.location.origin}/track\n\n` +
      `Use your tracking number and registered phone number to check the progress of your vehicle.\n\n` +
      `Thank you for choosing VANTARA.`;

    const triggerSendIntake = () => {
      openWhatsAppWeb(ownerPhone, intakeMessage);
      setWaStatus('WHATSAPP_OPENED');
      setShowConfirmIntake(false);
      showToast('WhatsApp Web opened. Review the message and send it from WhatsApp.', 'info');
    };

    const triggerConfirmIntake = () => {
      setConfirmModal({
        show: true,
        title: 'Confirm Send',
        message: 'Have you sent this message to the customer through WhatsApp?',
        onConfirm: async () => {
          const success = await markWhatsappAsSent(createdVehicle.id, 'TRACKING_DETAILS');
          if (success) {
            setWaStatus('SENT');
            setWaSentAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
            showToast('WhatsApp status marked as Sent successfully.', 'success');
          } else {
            showToast('Failed to mark WhatsApp status.', 'error');
          }
        }
      });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-md print:hidden">
        {/* Registration Success Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0C0C0C] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] w-full max-w-md p-8 relative flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-white mb-2">Vehicle Registered</h2>
          <p className="text-secondary text-sm mb-8">The intake protocol has been successfully completed.</p>

          <div className="w-full bg-[#080808] border border-white/5 p-6 rounded-lg mb-8 space-y-4 text-left">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-secondary font-mono font-bold mb-1">Tracking Number</div>
              <div className="font-mono text-lg text-primary tracking-widest bg-primary/5 p-3 border border-primary/10 text-center font-bold">{createdVehicle.trackingCode}</div>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-secondary uppercase">Customer Phone</span>
              <span className="text-white">{ownerPhone}</span>
            </div>
            {waSentAt && (
              <div className="flex justify-between items-center text-[10px] font-mono text-secondary pt-2">
                <span>SENT ON</span>
                <span>{waSentAt}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full gap-3">
            {/* Send / Resend WhatsApp Button */}
            {(waStatus === 'NOT_SENT' || waStatus === 'FAILED') && (
              <button 
                onClick={triggerSendIntake}
                className="w-full bg-primary text-black font-semibold rounded-lg py-3 hover:bg-primary/90 transition-all uppercase tracking-wider text-xs font-mono flex items-center justify-center gap-2"
              >
                Send via WhatsApp
              </button>
            )}

            {waStatus === 'WHATSAPP_OPENED' && (
              <div className="space-y-2 w-full text-center">
                <div className="text-xs text-primary font-mono bg-primary/5 p-3 border border-primary/10 rounded mb-2">
                  WhatsApp Web opened. Review the message and press Send inside WhatsApp Web.
                </div>
                <button 
                  onClick={triggerConfirmIntake}
                  className="w-full bg-accent-green text-black font-semibold rounded-lg py-3 hover:bg-accent-green/90 transition-all uppercase tracking-wider text-xs font-mono"
                >
                  Mark as Sent
                </button>
                <button
                  onClick={triggerSendIntake}
                  className="text-xs text-secondary hover:underline font-mono block mt-2"
                >
                  Open WhatsApp Web again
                </button>
              </div>
            )}

            {waStatus === 'SENT' && (
              <div className="space-y-2 w-full text-center">
                <button 
                  disabled
                  className="w-full bg-accent-green/20 text-accent-green font-semibold rounded-lg py-3 border border-accent-green/30 uppercase tracking-wider text-xs font-mono flex items-center justify-center gap-2"
                >
                  ✓ WhatsApp Sent
                </button>
                <button
                  onClick={triggerSendIntake}
                  className="text-xs text-primary hover:underline font-mono"
                >
                  Resend via WhatsApp
                </button>
              </div>
            )}

            <button 
              onClick={() => {
                onClose();
                setSelectedVehicle(createdVehicle);
              }}
              className="w-full bg-[#111111] hover:bg-[#151515] border border-white/10 text-white font-semibold rounded-lg py-3 transition-all uppercase tracking-wider text-xs font-mono"
            >
              View Vehicle Profile
            </button>
          </div>
        </motion.div>

        {/* WhatsApp Intake Confirmation Modal */}
        {showConfirmIntake && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0C0C0C] border border-white/10 shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 text-left">
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">Send tracking details?</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between"><span className="text-secondary">CUSTOMER:</span><span className="text-white">{createdVehicle.ownerName}</span></div>
                <div className="flex justify-between"><span className="text-secondary">PHONE:</span><span className="text-white">{ownerPhone.replace(/.(?=.{4})/g, '*')}</span></div>
                <div className="flex justify-between"><span className="text-secondary">TRACKING CODE:</span><span className="text-primary font-bold">{createdVehicle.trackingCode}</span></div>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <span className="text-[10px] font-mono text-secondary uppercase block mb-1">Message Preview</span>
                <div className="bg-black/50 border border-white/5 p-3 rounded text-[10px] font-mono text-white/70 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                  {intakeMessage}
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => setShowConfirmIntake(false)}
                  className="flex-1 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white text-xs font-mono uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={triggerSendIntake}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-black font-semibold text-xs font-mono uppercase tracking-widest"
                >
                  Send via WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-md print:hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-[#0C0C0C] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] w-full max-w-3xl max-h-[90vh] flex flex-col relative">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#080808]">
          <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-white">{vehicle ? 'Edit Record' : 'Intake Protocol'}</h2>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={20}/></button>
        </div>

        <div className="p-8 overflow-y-auto hide-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-10">
            <div>
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary mb-5 border-b border-white/10 pb-2">Vehicle Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Make" required value={formData.make} onChange={(e: any) => setFormData({...formData, make: e.target.value})} />
                <Input label="Model" required value={formData.model} onChange={(e: any) => setFormData({...formData, model: e.target.value})} />
                <Input label="Year" value={formData.year} onChange={(e: any) => setFormData({...formData, year: e.target.value})} />
                <Input label="Registration / Plate Number" required value={formData.plateNumber} onChange={(e: any) => setFormData({...formData, plateNumber: e.target.value})} />
                <Input label="Date In" type="date" required value={formData.dateBroughtIn} onChange={(e: any) => setFormData({...formData, dateBroughtIn: e.target.value})} />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary mb-5 border-b border-white/10 pb-2">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Owner Name" required value={formData.ownerName} onChange={(e: any) => setFormData({...formData, ownerName: e.target.value})} />
                <Input label="Phone Number" required value={formData.ownerPhone} onChange={(e: any) => setFormData({...formData, ownerPhone: e.target.value})} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-2">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary">Documentation</h3>
                <label className="cursor-pointer text-primary hover:text-white flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors">
                  <Camera size={14}/> Add Photos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((p, i) => (
                    <div key={i} className="relative group border border-white/10 bg-[#080808]">
                      <img src={p.dataUrl} className="w-full h-24 object-cover opacity-80" />
                      <select value={p.category} onChange={(e) => { const newP = [...photos]; newP[i].category = e.target.value as PhotoCategory; setPhotos(newP); }} className="absolute bottom-0 left-0 right-0 w-full bg-black/90 text-[9px] uppercase tracking-widest text-primary p-1 border-t border-white/10 outline-none">
                        {['Vehicle Arrival', 'Front', 'Rear', 'Left Side', 'Right Side', 'Interior', 'Engine', 'Damage', 'Repair Progress', 'Final Condition'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button type="button" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/80 border border-white/10 p-1 text-white hover:text-accent-rust"><X size={12}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-2">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary">Customer Complaints</h3>
                <button type="button" onClick={() => setFormData({...formData, complaints: [...formData.complaints, '']})} className="text-primary hover:text-white flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors">
                  <Plus size={14}/> Add Complaint
                </button>
              </div>
              <div className="space-y-4">
                {formData.complaints.map((c: string, i: number) => (
                  <div key={i} className="flex gap-4">
                    <input type="text" required value={c} onChange={(e) => { const newC = [...formData.complaints]; newC[i] = e.target.value; setFormData({...formData, complaints: newC}); }} className="w-full bg-[#080808] border border-white/10 p-3 text-sm focus:outline-none focus:border-primary font-mono text-white/90 placeholder:text-white/20" placeholder="e.g. AC is not cooling properly" />
                    {formData.complaints.length > 1 && (
                      <button type="button" onClick={() => { const newC = [...formData.complaints]; newC.splice(i, 1); setFormData({...formData, complaints: newC}); }} className="px-4 bg-[#080808] border border-white/10 hover:border-accent-rust text-secondary hover:text-accent-rust transition-colors"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-white/10 bg-[#080808] flex justify-end gap-4">
          <button onClick={onClose} disabled={isSubmitting} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors disabled:opacity-50">Abort</button>
          <button type="submit" form="vehicle-form" disabled={isSubmitting} className="px-8 py-3 bg-primary text-[#080808] text-xs font-mono font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50">
            {isSubmitting ? 'Registering...' : 'Confirm Intake'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Input({ label, type = "text", ...props }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] uppercase tracking-[0.2em] text-secondary font-mono font-bold">{label}</label>
      <input type={type} className="w-full bg-[#080808] border border-white/10 p-3 text-sm focus:outline-none focus:border-primary text-white font-mono" {...props} />
    </div>
  );
}

function VehicleDetailModal({ vehicle, onClose, onEdit, onDelete, onUpdate, onUpdateStatus, onAddNote, onAddPhoto, onAddRepair, onCreateEstimate, onUpdateFinalCost, onResendTracking, onRegenerateTracking, onResendCompletion, markWhatsappAsSent, showToast, setConfirmModal }: any) {
  const [newNote, setNewNote] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [openedTypes, setOpenedTypes] = useState<Record<string, boolean>>({});

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const getConfirmationMessage = (type: string, veh: any) => {
    const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/track` : 'https://yourdomain.com/track';
    const name = `${veh.make} ${veh.model}`;

    switch (type) {
      case 'TRACKING_DETAILS':
        return `VANTARA\n\n` +
          `The Journey Behind Every Repair.\n\n` +
          `Your vehicle has been registered with our workshop.\n\n` +
          `Vehicle:\n${name} ${veh.year || ''}\n\n` +
          `Registration:\n${veh.plateNumber}\n\n` +
          `Your tracking number:\n${veh.trackingCode}\n\n` +
          `Track your vehicle:\n${trackingUrl}\n\n` +
          `Use your tracking number and registered phone number to check the progress of your vehicle.\n\n` +
          `Thank you for choosing VANTARA.`;

      case 'READY_FOR_PICKUP':
        return `VANTARA\n\n` +
          `Your vehicle is ready for pickup.\n\n` +
          `Vehicle:\n${name}\n\n` +
          `Registration:\n${veh.plateNumber}\n\n` +
          `Track your vehicle:\n${trackingUrl}\n\n` +
          `Thank you for choosing VANTARA.`;

      case 'REPAIR_COMPLETED':
        return `VANTARA\n\n` +
          `The repair of your vehicle has been completed.\n\n` +
          `Vehicle:\n${name}\n\n` +
          `Registration:\n${veh.plateNumber}\n\n` +
          `Your vehicle is ready for collection.\n\n` +
          `Track your vehicle:\n${trackingUrl}\n\n` +
          `Thank you for choosing VANTARA.`;

      default:
        return `VANTARA\n\n` +
          `Update on your vehicle ${name} (${veh.plateNumber}).\n\n` +
          `Track your vehicle:\n${trackingUrl}\n\n` +
          `Thank you for choosing VANTARA.`;
    }
  };

  const getNotificationStatusCard = (type: string, label: string) => {
    const history = vehicle.whatsappNotifications || [];
    const notif = history.find((n: any) => n.notificationType === type && n.status === 'SENT');
    
    let statusText = 'Not Sent';
    let statusColor = 'text-secondary bg-white/5';
    let details = '';
    let showSendBtn = true;
    let showConfirmBtn = false;
    let buttonLabel = 'Send via WhatsApp';

    const isOpened = !!openedTypes[type];

    if (notif) {
      statusText = 'Sent';
      statusColor = 'text-accent-green bg-accent-green/10';
      buttonLabel = 'Resend via WhatsApp';
      details = `Sent on: ${formatDate(notif.sentAt)} by ${notif.sentBy?.name || 'Staff'}`;
    } else if (isOpened) {
      statusText = 'WhatsApp Web opened';
      statusColor = 'text-primary bg-primary/10 animate-pulse';
      showConfirmBtn = true;
      details = 'Review the message and press Send inside WhatsApp Web.';
    }

    const triggerOpen = () => {
      const message = getConfirmationMessage(type, vehicle);
      openWhatsAppWeb(vehicle.ownerPhone || '', message);
      setOpenedTypes(prev => ({ ...prev, [type]: true }));
      showToast('WhatsApp Web opened. Review the message and send it from WhatsApp.', 'info');
    };

    const triggerConfirm = () => {
      setConfirmModal({
        show: true,
        title: 'Confirm Send',
        message: 'Have you sent this message to the customer through WhatsApp?',
        onConfirm: async () => {
          const success = await markWhatsappAsSent(vehicle.id, type);
          if (success) {
            setOpenedTypes(prev => ({ ...prev, [type]: false }));
            showToast('WhatsApp status marked as Sent successfully.', 'success');
          } else {
            showToast('Failed to mark WhatsApp status.', 'error');
          }
        }
      });
    };

    return (
      <div className="border-b border-white/5 pb-4 last:border-none last:pb-0 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">{label}</div>
            {details && <div className="text-[10px] font-mono text-secondary mt-1">{details}</div>}
          </div>
          <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded ${statusColor}`}>
            {statusText}
          </span>
        </div>
        <div className="flex gap-2">
          {showSendBtn && (
            <button
              type="button"
              onClick={triggerOpen}
              className="flex-grow py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
            >
              {buttonLabel}
            </button>
          )}
          {showConfirmBtn && (
            <button
              type="button"
              onClick={triggerConfirm}
              className="flex-grow py-2 bg-accent-green/20 hover:bg-accent-green/30 border border-accent-green/30 text-accent-green text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
            >
              Mark as Sent
            </button>
          )}
        </div>
      </div>
    );
  };
  const arrivalPhoto = vehicle.photos?.find((p: any) => p.category === 'Vehicle Arrival');
  const galleryPhotos = vehicle.photos?.filter((p: any) => p.id !== arrivalPhoto?.id) || [];

  const latestCompNotif = (vehicle.notifications || []).find((n: any) => n.messageType === 'VEHICLE_COMPLETED');
  const compFailed = latestCompNotif && latestCompNotif.status === 'FAILED';

  // Diagnostics State
  const [diag, setDiag] = useState({
    inspectionFindings: vehicle.inspections?.[0]?.findings || '',
    diagnosis: vehicle.inspections?.[0]?.diagnosis || '',
    recommendedRepairs: vehicle.inspections?.[0]?.recommendation || ''
  });

  // Estimate State
  const [est, setEst] = useState({
    partsCost: '',
    laborCost: ''
  });

  // Additional Repair State
  const [addRep, setAddRep] = useState({ partsCost: '', laborCost: '', reason: '' });

  // Final Cost State
  const [fin, setFin] = useState({ partsCost: vehicle.finalPartsCost || '', laborCost: vehicle.finalLaborCost || '', otherCost: vehicle.finalOtherCost || '' });

  const hasEstimate = vehicle.estimates && vehicle.estimates.length > 0;
  const baseEstimate = hasEstimate ? vehicle.estimates[0].total : 0;
  const additionalSum = (vehicle.additionalRepairs || []).reduce((s: number, r: any) => s + r.partsCost + r.laborCost, 0);
  const currentEstimate = baseEstimate + additionalSum;

  const saveDiagnostics = () => {
    onUpdate(vehicle.id, diag);
  };

  const saveEstimate = () => {
    onCreateEstimate(vehicle.id, Number(est.partsCost), Number(est.laborCost));
  };

  const saveAdditionalRepair = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRepair(vehicle.id, Number(addRep.partsCost), Number(addRep.laborCost), addRep.reason);
    setAddRep({ partsCost: '', laborCost: '', reason: '' });
  };

  const saveFinalBill = () => {
    onUpdateFinalCost(vehicle.id, Number(fin.partsCost), Number(fin.laborCost), Number(fin.otherCost));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-md print:hidden">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-[#0C0C0C] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] w-full max-w-6xl max-h-[95vh] flex flex-col relative">
        <div className="w-full bg-[#080808] border-b border-white/10 p-8 shrink-0 overflow-x-auto hide-scrollbar">
           <div className="min-w-[1000px]">
             <VehicleJourneyTracker status={vehicle.status} />
           </div>
        </div>
        
        <div className="flex flex-col md:flex-row overflow-hidden flex-1">
          <div className="w-full md:w-2/3 flex flex-col border-r border-white/10 max-h-full overflow-y-auto hide-scrollbar">
            {vehicle.status === 'READY_FOR_PICKUP' && (() => {
              const readyNotif = (vehicle.whatsappNotifications || []).find((n: any) => n.notificationType === 'READY_FOR_PICKUP' && n.status === 'SENT');
              if (readyNotif) return null;

              const isOpened = !!openedTypes['READY_FOR_PICKUP'];

              const triggerOpen = () => {
                const msg = getConfirmationMessage('READY_FOR_PICKUP', vehicle);
                openWhatsAppWeb(vehicle.ownerPhone || '', msg);
                setOpenedTypes(prev => ({ ...prev, READY_FOR_PICKUP: true }));
                showToast('WhatsApp Web opened. Review the message and send it from WhatsApp.', 'info');
              };

              const triggerConfirm = () => {
                setConfirmModal({
                  show: true,
                  title: 'Confirm Send',
                  message: 'Have you sent this message to the customer through WhatsApp?',
                  onConfirm: async () => {
                    const success = await markWhatsappAsSent(vehicle.id, 'READY_FOR_PICKUP');
                    if (success) {
                      setOpenedTypes(prev => ({ ...prev, READY_FOR_PICKUP: false }));
                      showToast('WhatsApp status marked as Sent successfully.', 'success');
                    } else {
                      showToast('Failed to mark WhatsApp status.', 'error');
                    }
                  }
                });
              };

              return (
                <div className="mx-8 mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between gap-3 text-primary text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>Vehicle is ready for pickup. Send the manual pickup notification to the customer.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={triggerOpen}
                      className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary uppercase font-bold tracking-widest text-[9px] transition-colors"
                    >
                      {isOpened ? 'Resend via WhatsApp' : 'Send Pickup Message via WhatsApp'}
                    </button>
                    {isOpened && (
                      <button
                        onClick={triggerConfirm}
                        className="px-3 py-1.5 bg-accent-green text-black uppercase font-bold tracking-widest text-[9px] transition-colors font-semibold rounded"
                      >
                        Mark as Sent
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
            
            {vehicle.status === 'COMPLETED' && (() => {
              const compNotif = (vehicle.whatsappNotifications || []).find((n: any) => n.notificationType === 'REPAIR_COMPLETED' && n.status === 'SENT');
              if (compNotif) return null;

              const isOpened = !!openedTypes['REPAIR_COMPLETED'];

              const triggerOpen = () => {
                const msg = getConfirmationMessage('REPAIR_COMPLETED', vehicle);
                openWhatsAppWeb(vehicle.ownerPhone || '', msg);
                setOpenedTypes(prev => ({ ...prev, REPAIR_COMPLETED: true }));
                showToast('WhatsApp Web opened. Review the message and send it from WhatsApp.', 'info');
              };

              const triggerConfirm = () => {
                setConfirmModal({
                  show: true,
                  title: 'Confirm Send',
                  message: 'Have you sent this message to the customer through WhatsApp?',
                  onConfirm: async () => {
                    const success = await markWhatsappAsSent(vehicle.id, 'REPAIR_COMPLETED');
                    if (success) {
                      setOpenedTypes(prev => ({ ...prev, REPAIR_COMPLETED: false }));
                      showToast('WhatsApp status marked as Sent successfully.', 'success');
                    } else {
                      showToast('Failed to mark WhatsApp status.', 'error');
                    }
                  }
                });
              };

              return (
                <div className="mx-8 mt-8 p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg flex items-center justify-between gap-3 text-accent-green text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Repair is completed. Send the manual completion message to the customer.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={triggerOpen}
                      className="px-3 py-1.5 bg-accent-green/20 hover:bg-accent-green/30 border border-accent-green/30 text-accent-green uppercase font-bold tracking-widest text-[9px] transition-colors"
                    >
                      {isOpened ? 'Resend via WhatsApp' : 'Send Completion Message via WhatsApp'}
                    </button>
                    {isOpened && (
                      <button
                        onClick={triggerConfirm}
                        className="px-3 py-1.5 bg-accent-green text-black uppercase font-bold tracking-widest text-[9px] transition-colors font-semibold rounded"
                      >
                        Mark as Sent
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="p-8 flex flex-col gap-10">
              
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-display text-5xl font-bold uppercase tracking-wider mb-2 text-white">{vehicle.plateNumber}</div>
                  <div className="text-sm font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1 inline-block tracking-widest">{vehicle.jobNumber}</div>
                </div>
                <button onClick={onClose} className="md:hidden text-secondary hover:text-white"><X size={24}/></button>
              </div>

              <div className="flex flex-wrap gap-3 pb-8 border-b border-white/10">
                <button onClick={onEdit} className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-[#080808] hover:bg-white/5 border border-white/10 text-xs font-mono font-bold uppercase tracking-widest text-white"><PenTool size={14} /> Update Info</button>
                <button onClick={() => window.print()} className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-mono font-bold uppercase tracking-widest"><Printer size={14} /> Print Job Sheet</button>
                <button onClick={onDelete} className="flex justify-center items-center gap-2 px-6 py-3 bg-[#080808] hover:bg-accent-rust/10 border border-white/10 hover:border-accent-rust/30 text-accent-rust text-xs font-mono"><Trash2 size={16} /></button>
              </div>

              <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                <DetailItem label="Make & Model" value={`${vehicle.make} ${vehicle.model} ${vehicle.year}`} />
                <DetailItem label="Owner Name" value={vehicle.ownerName} />
                <DetailItem label="Contact" value={vehicle.ownerPhone} />
                <DetailItem label="Date In" value={vehicle.dateBroughtIn} />
                
                <div className="col-span-2 border border-white/10 bg-[#080808]/50 p-6 space-y-6">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-mono font-bold border-b border-white/10 pb-2">Customer Tracking (WhatsApp)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-secondary font-mono font-bold mb-1">Phone Number</div>
                      <div className="font-mono text-xs text-white/95 mt-1">
                        {vehicle.ownerPhone ? vehicle.ownerPhone.replace(/.(?=.{4})/g, '*') : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-secondary font-mono font-bold mb-1">Tracking Code</div>
                      <span className="font-mono text-xs text-primary font-bold mt-1 tracking-widest">{vehicle.trackingCode || 'Not assigned'}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h5 className="text-[10px] uppercase tracking-[0.15em] text-secondary font-mono font-bold">CUSTOMER MESSAGES</h5>
                    {getNotificationStatusCard('TRACKING_DETAILS', 'Tracking Details')}
                    {getNotificationStatusCard('READY_FOR_PICKUP', 'Ready for Pickup')}
                    {getNotificationStatusCard('REPAIR_COMPLETED', 'Repair Completed')}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex gap-4">
                    <button
                      disabled={isRegenerating}
                      onClick={async () => {
                        if (confirm('Regenerating will invalidate the old tracking code immediately. Proceed?')) {
                          setIsRegenerating(true);
                          const success = await onRegenerateTracking(vehicle.id);
                          setIsRegenerating(false);
                          alert(success ? 'Tracking code regenerated.' : 'Failed to regenerate tracking code.');
                        }
                      }}
                      className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:text-primary-hover disabled:opacity-50"
                    >
                      {isRegenerating ? 'Regenerating...' : 'Regenerate Code'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-secondary font-mono font-bold mb-4 border-b border-white/10 pb-2">Customer Complaints</h4>
                <ul className="space-y-3">
                  {vehicle.complaints?.map((c: any, i: number) => (
                    <li key={i} className="flex items-start gap-4 p-4 bg-[#080808] border border-white/5 text-sm font-mono text-white/80"><span className="text-primary opacity-50 mt-0.5">{">"}</span><span>{c.description || c}</span></li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#080808] border border-white/10 p-6 space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-mono font-bold border-b border-white/10 pb-2">Inspection & Diagnosis</h4>
                <Input label="Inspection Findings" value={diag.inspectionFindings} onChange={(e:any) => setDiag({...diag, inspectionFindings: e.target.value})} />
                <Input label="Diagnosis" value={diag.diagnosis} onChange={(e:any) => setDiag({...diag, diagnosis: e.target.value})} />
                <Input label="Recommended Repairs" value={diag.recommendedRepairs} onChange={(e:any) => setDiag({...diag, recommendedRepairs: e.target.value})} />
                <button onClick={saveDiagnostics} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-widest">Save Diagnostics</button>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 p-6 space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-mono font-bold border-b border-white/10 pb-2">Repair Cost Estimation</h4>
                
                {!hasEstimate ? (
                  <div className="text-center py-6">
                    <p className="text-secondary text-sm font-mono italic mb-6">Repair cost not determined yet. Inspection required before an estimate can be prepared.</p>
                    <div className="flex gap-4 max-w-md mx-auto">
                      <Input label="Parts Est (₹)" type="number" value={est.partsCost} onChange={(e:any) => setEst({...est, partsCost: e.target.value})} />
                      <Input label="Labor Est (₹)" type="number" value={est.laborCost} onChange={(e:any) => setEst({...est, laborCost: e.target.value})} />
                    </div>
                    <button onClick={saveEstimate} className="mt-6 px-8 py-3 bg-primary text-[#080808] font-bold text-xs font-mono uppercase tracking-widest hover:bg-white transition-colors">Prepare Estimate</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-mono"><span className="text-secondary">PARTS ESTIMATE</span><span className="text-white">{fmtC(vehicle.estimatePartsCost || 0)}</span></div>
                    <div className="flex justify-between text-sm mb-6 font-mono"><span className="text-secondary">LABOR ESTIMATE</span><span className="text-white">{fmtC(vehicle.estimateLaborCost || 0)}</span></div>
                    
                    {vehicle.additionalRepairs && vehicle.additionalRepairs.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                        <h5 className="text-[9px] uppercase tracking-widest text-accent-rust font-mono">Additional Repairs</h5>
                        {vehicle.additionalRepairs.map((r: any) => (
                          <div key={r.id} className="flex justify-between items-start text-xs font-mono bg-[#0C0C0C] p-3 border border-white/5">
                            <span className="text-secondary max-w-[60%]">{r.reason}</span>
                            <span className="text-white text-right">{fmtC(r.partsCost + r.laborCost)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-end pt-6 mt-6 border-t-2 border-white/20">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-mono font-bold">ESTIMATED REPAIR COST</span>
                        <select 
                          value={vehicle.approvalStatus || 'Pending'} 
                          onChange={(e) => onUpdate(vehicle.id, { approvalStatus: e.target.value }, `Customer estimate approval updated to: ${e.target.value}`)}
                          className="bg-[#0C0C0C] border border-white/20 text-xs text-white p-2 outline-none uppercase font-mono tracking-widest"
                        >
                          <option value="Pending">Pending Approval</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <span className="font-display text-3xl font-bold text-white tracking-widest">{fmtC(currentEstimate)}</span>
                    </div>

                    <form onSubmit={saveAdditionalRepair} className="mt-8 pt-6 border-t border-white/10">
                       <h5 className="text-[9px] uppercase tracking-widest text-secondary font-mono mb-4">Log Additional Discovery</h5>
                       <div className="flex gap-4 items-end">
                         <div className="flex-1"><Input label="Reason" required value={addRep.reason} onChange={(e:any) => setAddRep({...addRep, reason: e.target.value})} /></div>
                         <div className="w-24"><Input label="Parts" type="number" required value={addRep.partsCost} onChange={(e:any) => setAddRep({...addRep, partsCost: e.target.value})} /></div>
                         <div className="w-24"><Input label="Labor" type="number" required value={addRep.laborCost} onChange={(e:any) => setAddRep({...addRep, laborCost: e.target.value})} /></div>
                         <button type="submit" className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono uppercase tracking-widest">Add</button>
                       </div>
                    </form>
                  </div>
                )}
              </div>

              {vehicle.status === 'Completed / Picked Up' && (
                <div className="bg-accent-green/10 border border-accent-green/30 p-6 space-y-6">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-accent-green font-mono font-bold border-b border-accent-green/30 pb-2">Finalize Bill</h4>
                  <div className="flex gap-4">
                     <Input label="Actual Parts" type="number" value={fin.partsCost} onChange={(e:any) => setFin({...fin, partsCost: e.target.value})} />
                     <Input label="Actual Labor" type="number" value={fin.laborCost} onChange={(e:any) => setFin({...fin, laborCost: e.target.value})} />
                     <Input label="Other Costs" type="number" value={fin.otherCost} onChange={(e:any) => setFin({...fin, otherCost: e.target.value})} />
                  </div>
                  <div className="flex justify-between items-center mt-6">
                     <span className="text-[10px] uppercase tracking-[0.2em] text-accent-green font-mono font-bold">FINAL REPAIR COST</span>
                     <span className="font-display text-3xl font-bold text-white tracking-widest">{fmtC(Number(fin.partsCost) + Number(fin.laborCost) + Number(fin.otherCost))}</span>
                  </div>
                  <button onClick={saveFinalBill} className="w-full mt-4 py-3 bg-accent-green text-black font-bold uppercase tracking-widest text-xs font-mono">Confirm Final Cost</button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col bg-[#0A0A0A] max-h-full">
            <div className="p-8 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-display text-2xl uppercase font-bold tracking-widest text-white">Telemetry</h3>
              <button onClick={onClose} className="hidden md:block text-secondary hover:text-white"><X size={24}/></button>
            </div>
            <div className="p-8 border-b border-white/10">
              <label className="text-[10px] uppercase tracking-[0.2em] text-secondary font-mono font-bold mb-4 block">Override Status</label>
              <select value={vehicle.status} onChange={(e) => onUpdateStatus(vehicle.id, e.target.value)} className={`w-full appearance-none p-4 text-sm font-mono font-bold uppercase tracking-[0.1em] focus:outline-none cursor-pointer border ${STATUS_COLORS[vehicle.status as VehicleStatus]}`}>
                {JOURNEY_STAGES.map(s => <option key={s} value={s} className="bg-[#0C0C0C] text-white">{s}</option>)}
              </select>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar p-8">
              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-0 md:before:translate-x-2.5 before:h-full before:w-px before:bg-white/10">
                {(vehicle.progressLogs || []).map((log: any) => (
                  <div key={log.id} className="relative flex items-start gap-6 pb-8 last:pb-0">
                    <div className="flex items-center justify-center w-5 h-5 border border-primary bg-[#080808] shrink-0 z-10 mt-1"><div className="w-1.5 h-1.5 bg-primary"></div></div>
                    <div className="flex-1 bg-[#080808] border border-white/5 p-5 hover:border-white/20 transition-colors">
                      <div className="text-[9px] font-mono tracking-[0.1em] text-secondary mb-3">
                        {new Date(log.createdAt).toLocaleDateString('en-IN')} • {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="text-sm font-mono text-white/90 leading-relaxed">{log.message || log.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-[#080808]">
              <form onSubmit={(e) => { e.preventDefault(); if(newNote.trim()) { onAddNote(vehicle.id, newNote); setNewNote(''); } }} className="flex gap-3">
                <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="APPEND LOG ENTRY..." className="flex-1 bg-[#0C0C0C] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-primary font-mono text-white placeholder:text-white/20" />
                <button type="submit" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold uppercase tracking-widest">Append</button>
              </form>
            </div>
          </div>
        </div>


      </motion.div>
    </div>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div className="flex flex-col gap-2 border-l border-white/10 pl-4">
      <span className="text-[9px] uppercase tracking-[0.2em] text-secondary font-mono font-bold">{label}</span>
      <span className="text-sm font-bold text-white tracking-wide truncate">{value}</span>
    </div>
  );
}

const JOURNEY_STAGES: VehicleStatus[] = [
  'AWAITING_DIAGNOSIS', 'IN_PROGRESS', 'AWAITING_PARTS',
  'READY_FOR_PICKUP', 'COMPLETED'
];

function VehicleJourneyTracker({ status }: { status: VehicleStatus }) {
  const currentIndex = JOURNEY_STAGES.indexOf(status);
  const isBlocked = status === 'AWAITING_PARTS';
  return (
    <div className="w-full flex items-center justify-between relative pt-2 pb-4">
      <div className="absolute left-6 right-6 top-5 h-px bg-white/10" />
      <div className={`absolute left-6 top-5 h-px transition-all duration-700 ease-in-out ${isBlocked ? 'bg-accent-rust' : 'bg-primary'}`} style={{ width: `calc(${(currentIndex / (JOURNEY_STAGES.length - 1)) * 100}% - 3rem)` }} />
      {JOURNEY_STAGES.map((stage, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;
        let nodeColor = 'border-white/10 bg-[#080808]';
        let labelColor = 'text-white/20';
        let innerDot = 'bg-transparent';
        if (isCompleted) { nodeColor = 'border-primary bg-primary text-[#080808]'; labelColor = 'text-white/60'; }
        else if (isActive) {
          if (isBlocked) { nodeColor = 'border-accent-rust bg-[#080808] shadow-[0_0_15px_rgba(139,58,58,0.5)]'; labelColor = 'text-accent-rust font-bold'; innerDot = 'bg-accent-rust'; }
          else { nodeColor = 'border-primary bg-[#080808] shadow-[0_0_15px_rgba(212,175,55,0.5)]'; labelColor = 'text-primary font-bold'; innerDot = 'bg-primary'; }
        }
        return (
          <div key={stage} className="relative z-10 flex flex-col items-center gap-4 w-28">
            <div className={`w-6 h-6 border flex items-center justify-center transition-all duration-700 rotate-45 ${nodeColor}`}>
              {isCompleted ? <CheckCircle size={12} className="-rotate-45" /> : <div className={`w-1.5 h-1.5 ${innerDot}`} />}
            </div>
            <span className={`text-[8px] font-mono uppercase tracking-[0.1em] whitespace-nowrap text-center transition-colors duration-700 ${labelColor}`}>{stage}</span>
          </div>
        );
      })}
    </div>
  );
}

function PrintJobSheet({ vehicle }: { vehicle: Vehicle }) {
  const hasEstimate = vehicle.estimates && vehicle.estimates.length > 0;
  const baseEstimate = hasEstimate ? vehicle.estimates![0].total : 0;
  const additionalSum = (vehicle.additionalRepairs || []).reduce((s: number, r: any) => s + r.partsCost + r.laborCost, 0);
  const currentEstimate = baseEstimate + additionalSum;

  return (
    <div className="hidden print:block absolute inset-0 bg-white text-black p-10 font-sans z-[9999] h-max">
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-widest mb-1">VANTARA</h1>
          <p className="text-sm italic text-gray-600">The Journey Behind Every Repair.</p>
        </div>
        <div className="text-right">
          <h2 className="font-display text-2xl font-bold uppercase">{vehicle.jobNumber}</h2>
          <p className="text-sm text-gray-600 font-mono mt-1">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-12 mb-8 font-mono">
        <div>
          <h3 className="font-bold border-b border-black pb-2 mb-4 uppercase tracking-[0.2em] text-[10px]">Vehicle Specification</h3>
          <table className="w-full text-xs text-left">
            <tbody>
              <tr><th className="py-2 w-1/3 text-gray-500 font-normal tracking-widest">MAKE/MODEL</th><td className="font-bold">{vehicle.make} {vehicle.model} {vehicle.year}</td></tr>
              <tr><th className="py-2 text-gray-500 font-normal tracking-widest">PLATE</th><td className="font-bold">{vehicle.plateNumber}</td></tr>
              <tr><th className="py-2 text-gray-500 font-normal tracking-widest">DATE IN</th><td>{vehicle.dateBroughtIn}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="font-bold border-b border-black pb-2 mb-4 uppercase tracking-[0.2em] text-[10px]">Customer Data</h3>
          <table className="w-full text-xs text-left">
            <tbody>
              <tr><th className="py-2 w-1/3 text-gray-500 font-normal tracking-widest">NAME</th><td className="font-bold">{vehicle.ownerName}</td></tr>
              <tr><th className="py-2 text-gray-500 font-normal tracking-widest">PHONE</th><td className="font-bold">{vehicle.ownerPhone}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8 font-mono">
        <h3 className="font-bold border-b border-black pb-2 mb-4 uppercase tracking-[0.2em] text-[10px]">Initial Complaints</h3>
        <ul className="list-none text-xs space-y-3">
          {vehicle.complaints?.map((c, i) => <li key={i} className="flex gap-4 border-b border-gray-200 pb-2"><span className="text-gray-400">[{i+1}]</span> {c.description || (c as unknown as string)}</li>)}
        </ul>
      </div>

      <div className="mb-8 font-mono">
        <h3 className="font-bold border-b border-black pb-2 mb-4 uppercase tracking-[0.2em] text-[10px]">Diagnosis & Recommendations</h3>
        <div className="text-xs mb-4"><strong>FINDINGS:</strong> {vehicle.inspections?.[0]?.findings || 'Pending'}</div>
        <div className="text-xs mb-4"><strong>DIAGNOSIS:</strong> {vehicle.inspections?.[0]?.diagnosis || 'Pending'}</div>
        <div className="text-xs"><strong>RECOMMENDED:</strong> {vehicle.inspections?.[0]?.recommendation || 'Pending'}</div>
      </div>

      <div className="mb-8 font-mono">
        <h3 className="font-bold border-b border-black pb-2 mb-4 uppercase tracking-[0.2em] text-[10px]">Cost Breakdown</h3>
        {!hasEstimate ? (
          <div className="text-xs italic text-gray-500">Repair estimate not yet prepared.</div>
        ) : (
          <table className="w-full text-xs text-left max-w-md">
            <tbody>
              <tr><th className="py-2 font-normal text-gray-600">ESTIMATED TOTAL:</th><td className="text-right font-bold">{fmtC(baseEstimate)}</td></tr>
              {vehicle.additionalRepairs && vehicle.additionalRepairs.length > 0 && (
                <tr><th className="py-2 font-normal text-gray-600 border-t border-gray-300">ADDITIONAL REPAIRS:</th><td className="text-right font-bold border-t border-gray-300">+{fmtC(additionalSum)}</td></tr>
              )}
              {vehicle.status === 'COMPLETED' && vehicle.finalTotalCost !== null && vehicle.finalTotalCost !== undefined ? (
                <tr><th className="py-4 text-base tracking-widest border-t-2 border-black">FINAL REPAIR COST:</th><td className="py-4 text-base font-bold text-right border-t-2 border-black">{fmtC(vehicle.finalTotalCost)}</td></tr>
              ) : (
                <tr><th className="py-4 text-base tracking-widest border-t-2 border-black">CURRENT ESTIMATE:</th><td className="py-4 text-base font-bold text-right border-t-2 border-black">{fmtC(currentEstimate)}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-16 pt-8 border-t-2 border-black grid grid-cols-2 gap-16 text-center text-xs font-mono uppercase tracking-[0.2em]">
        <div><div className="h-16 border-b border-gray-400 mb-4"></div>Customer Signature</div>
        <div><div className="h-16 border-b border-gray-400 mb-4"></div>Advisor Authorization</div>
      </div>
    </div>
  );
}
