"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronRight, FileText, Wrench, IndianRupee, Activity, 
  MapPin, CheckCircle, Truck, ClipboardList, Eye, Users, 
  Settings, PenTool, Search, ArrowRight, CalendarClock, Hammer, Key
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom = 0) => ({
    opacity: 1, 
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// --- SUB-COMPONENTS ---

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-surface-100 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
            <span className="font-display text-primary text-xl leading-none mt-1">V</span>
          </div>
          <span className="font-display text-2xl tracking-widest uppercase">Vantara</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm font-medium text-secondary hover:text-foreground transition-colors">How It Works</Link>
          <Link href="#features" className="text-sm font-medium text-secondary hover:text-foreground transition-colors">Features</Link>
          <Link href="#about" className="text-sm font-medium text-secondary hover:text-foreground transition-colors">About</Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/track" className="px-5 py-2.5 bg-transparent border border-white/20 text-foreground font-semibold text-sm rounded hover:bg-white/5 transition-colors">Check Vehicle Status</Link>
          <Link href="/login" className="px-5 py-2.5 bg-primary text-black font-semibold text-sm rounded hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            Workshop Login
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-secondary hover:text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-50 border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-secondary hover:text-foreground">How It Works</Link>
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-secondary hover:text-foreground">Features</Link>
              <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="text-secondary hover:text-foreground">About</Link>
              <div className="h-px w-full bg-white/5 my-2" />
              <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="px-5 py-2.5 bg-transparent border border-white/20 text-center text-foreground font-semibold text-sm rounded hover:bg-white/5 transition-colors">Check Vehicle Status</Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="px-5 py-2.5 bg-primary text-black text-center font-semibold text-sm rounded hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)]">Workshop Login</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* Background Graphic elements */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-20">
        <div className="w-[800px] h-[800px] rounded-full border border-white/5 absolute" />
        <div className="w-[600px] h-[600px] rounded-full border border-white/5 absolute" />
        <div className="w-[400px] h-[400px] rounded-full border border-primary/20 absolute blur-[1px]" />
        
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col items-center text-center">
        
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-6 flex items-center gap-3 bg-surface-100 border border-white/10 px-4 py-1.5 rounded-full shadow-lg">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium tracking-widest uppercase text-secondary">Vantara OS 1.0</span>
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="text-5xl md:text-7xl lg:text-8xl font-display font-bold uppercase tracking-tight mb-8 leading-[0.9]">
          The Journey Behind <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Every Repair.</span>
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="text-lg md:text-xl text-secondary max-w-2xl mb-12 leading-relaxed">
          From the moment your vehicle arrives to the moment it leaves, Vantara keeps every detail of its journey connected.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login" className="px-8 py-4 bg-primary text-black font-semibold rounded hover:bg-primary/90 transition-all w-full sm:w-auto shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] text-center">
            OPEN YOUR WORKSHOP
          </Link>
          <Link href="/track" className="px-8 py-4 bg-surface-100 border border-white/10 text-foreground font-semibold rounded hover:bg-surface-200 transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
            CHECK YOUR VEHICLE <ArrowRight size={18} className="text-secondary" />
          </Link>
        </motion.div>

        {/* Abstract Vehicle Visual */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="mt-24 relative w-full max-w-4xl h-[300px] md:h-[400px] border border-white/10 bg-surface-50 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group">
          {/* Diagnostic lines and glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-steel/10 via-transparent to-primary/5" />
          
          {/* Central abstract vehicle representation */}
          <div className="relative w-full h-full flex items-center justify-center opacity-80">
            <svg width="600" height="200" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto px-10">
              <path d="M100 150 L150 80 L450 80 L500 150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
              <path d="M50 150 L550 150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
              {/* Animated scanning line */}
              <motion.line 
                x1="150" y1="80" x2="150" y2="150" 
                stroke="#D4AF37" strokeWidth="1" 
                animate={{ x: [0, 300, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>

          {/* Floating Data Labels */}
          <div className="absolute top-10 left-10 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="text-[10px] font-mono text-primary mb-1">SYS.DIAG_01</div>
            <div className="text-xs text-secondary">Engine Bay Scan</div>
          </div>
          
          <div className="absolute bottom-10 right-10 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="text-[10px] font-mono text-accent-steel mb-1">TELEMETRY_SYNC</div>
            <div className="text-xs text-secondary">Data Link Active</div>
          </div>

          {/* Floating Status Element */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute -right-4 md:right-10 top-1/2 -translate-y-1/2 bg-surface-100/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-widest text-secondary">Current Journey</span>
            </div>
            <div className="flex justify-between items-end gap-6">
              <span className="text-sm font-medium">Repair in progress</span>
              <span className="font-display text-xl text-primary">68%</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: '68%' }} 
                transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                className="h-full bg-primary rounded-full" 
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.p custom={6} variants={fadeUp} initial="hidden" animate="visible" className="mt-12 text-sm text-secondary uppercase tracking-widest font-medium">
          From the moment a vehicle arrives to the moment it leaves, Vantara keeps every detail connected.
        </motion.p>
      </div>
    </section>
  );
}

function CustomerTracking() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/track?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-background border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold uppercase mb-4">Where is your vehicle now?</motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-xl text-secondary max-w-2xl mx-auto">Your vehicle is on its own journey. Check its current repair status using the private tracking details provided by your workshop.</motion.p>
        </div>
        
        {/* Panel */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-5xl mx-auto bg-surface-50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          
          {/* Visual Side */}
          <div className="w-full md:w-1/2 bg-[#0a0a0a] relative p-12 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
             <div className="relative z-10">
               <div className="text-[10px] font-mono tracking-widest text-primary uppercase mb-4 border border-primary/20 bg-primary/10 inline-block px-3 py-1 rounded-full">Customer Vehicle Tracking</div>
               <p className="text-secondary max-w-sm text-lg font-medium">Follow your vehicle's journey without calling the workshop.</p>
             </div>
             
             {/* Abstract Vehicle Graphic */}
             <div className="relative mt-12 w-full h-48 flex items-center justify-center opacity-70">
                <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 150 L100 80 L300 80 L350 150" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
                  <path d="M20 150 L380 150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                  <motion.circle cx="100" cy="150" r="25" stroke="rgba(212,175,55,0.5)" strokeWidth="2" fill="none" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                  <motion.circle cx="300" cy="150" r="25" stroke="rgba(212,175,55,0.5)" strokeWidth="2" fill="none" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                </svg>
             </div>
          </div>
          
          {/* Form Side */}
          <div className="w-full md:w-1/2 p-10 md:p-12">
            <h3 className="text-2xl font-display uppercase tracking-wider mb-8 text-white">Track Your Vehicle</h3>
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-secondary">Vantara Tracking Code</label>
                <input 
                  type="text" 
                  required 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="[ Enter your tracking code ]" 
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-4 font-mono tracking-widest text-sm focus:outline-none focus:border-primary/50 transition-all uppercase placeholder-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-secondary">Registered Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="[ Enter your phone number ]" 
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder-white/20"
                />
              </div>
              <button type="submit" className="w-full bg-surface-200 border border-white/10 hover:border-primary/50 hover:bg-surface-300 text-white font-semibold rounded-lg py-4 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm mt-4 group">
                Check Vehicle Status <ArrowRight size={18} className="text-secondary group-hover:text-primary transition-colors" />
              </button>
            </form>
            <div className="mt-8 flex items-start gap-3 p-4 bg-background border border-white/5 rounded-lg text-secondary">
               <Key size={16} className="shrink-0 mt-0.5" />
               <p className="text-xs leading-relaxed">Your tracking code is private and is provided by your workshop.</p>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    { icon: ClipboardList, title: "Complaints", desc: "Know exactly what the customer reported." },
    { icon: Wrench, title: "Repairs", desc: "Track what has been diagnosed and completed." },
    { icon: IndianRupee, title: "Costs", desc: "Keep parts, labor, and total repair costs visible." },
    { icon: Activity, title: "Progress", desc: "Know exactly where every vehicle stands." },
  ];

  return (
    <section className="py-24 border-t border-white/5 bg-surface-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="max-w-3xl mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold uppercase mb-6">Every vehicle has a story.</h2>
          <p className="text-xl text-secondary leading-relaxed">
            Complaints get written on paper.<br/>
            Repair updates get lost in conversations.<br/>
            Costs change during the job.<br/>
            Customers call to ask what is happening.<br/><br/>
            <span className="text-foreground font-medium">Vantara turns that scattered process into one connected journey.</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((item, i) => (
            <motion.div 
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i}
              className="p-8 border border-white/5 bg-background rounded-xl hover:border-primary/20 transition-colors group"
            >
              <item.icon className="w-8 h-8 text-secondary group-hover:text-primary transition-colors mb-6" />
              <h3 className="text-lg font-medium mb-3 uppercase tracking-wider">{item.title}</h3>
              <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  const stages = [
    { icon: MapPin, title: "Vehicle Arrives" },
    { icon: Search, title: "Inspection" },
    { icon: Activity, title: "Diagnosis" },
    { icon: Wrench, title: "Repair" },
    { icon: CheckCircle, title: "Quality Check" },
    { icon: Eye, title: "Ready" },
    { icon: Truck, title: "Delivered" },
  ];

  return (
    <section id="how-it-works" className="py-32 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold uppercase">
          One vehicle. One journey.
        </motion.h2>
      </div>

      <div className="relative w-full overflow-x-auto pb-12 hide-scrollbar px-6">
        <div className="min-w-[1000px] max-w-7xl mx-auto relative flex items-center justify-between py-10">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 z-0" />
          
          {stages.map((stage, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative z-10 flex flex-col items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-full bg-surface-100 border border-white/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                <stage.icon className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest text-secondary group-hover:text-foreground transition-colors text-center w-24">
                {stage.title}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <section className="py-24 bg-surface-50 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold uppercase mb-6">
          See the whole workshop at a glance.
        </motion.h2>
      </div>

      {/* Dashboard Mockup */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto relative perspective-1000"
      >
        <div className="w-full bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-[#0A0A0A]">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-surface-200 rounded flex items-center justify-center text-xs font-display text-primary">V</div>
              <span className="text-sm font-medium tracking-wide">Workshop Dashboard</span>
            </div>
            <div className="flex items-center gap-4 text-secondary">
              <Search size={16} />
              <Settings size={16} />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 bg-[#0E0E0E] flex flex-col gap-6">
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Vehicles", val: "24", col: "text-foreground" },
                { label: "Active Jobs", val: "11", col: "text-primary" },
                { label: "Awaiting Parts", val: "4", col: "text-accent-rust" },
                { label: "Ready Pickup", val: "5", col: "text-accent-green" },
                { label: "Outstanding", val: "₹86,450", col: "text-accent-steel" },
              ].map((s,i) => (
                <div key={i} className="p-4 bg-surface-50 border border-white/5 rounded-lg flex flex-col gap-1">
                  <span className="text-xs text-secondary uppercase tracking-wider">{s.label}</span>
                  <span className={`text-2xl font-display font-bold ${s.col}`}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Active Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              
              {/* Job Card 1 */}
              <div className="p-5 bg-surface-50 border border-white/5 rounded-xl hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-display font-bold tracking-wide">KL 10 AB 1234</div>
                    <div className="text-sm text-secondary">Toyota Innova • Ameena</div>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] uppercase tracking-widest text-primary font-medium">
                    In Progress
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-foreground/80">
                    <FileText size={16} className="text-secondary shrink-0 mt-0.5" />
                    <span>AC not cooling, Front suspension noise</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="text-xs text-secondary flex items-center gap-1"><CalendarClock size={14}/> Today, 09:30 AM</div>
                  <div className="text-sm font-medium">Est: ₹12,500</div>
                </div>
              </div>

              {/* Job Card 2 */}
              <div className="p-5 bg-surface-50 border border-white/5 rounded-xl hover:border-accent-rust/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-display font-bold tracking-wide">KL 07 CD 4582</div>
                    <div className="text-sm text-secondary">Hyundai Creta • Rahul</div>
                  </div>
                  <div className="px-2 py-1 bg-accent-rust/10 border border-accent-rust/20 rounded text-[10px] uppercase tracking-widest text-accent-rust font-medium">
                    Awaiting Parts
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-foreground/80">
                    <FileText size={16} className="text-secondary shrink-0 mt-0.5" />
                    <span>Brake vibration during high speed</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="text-xs text-secondary flex items-center gap-1"><CalendarClock size={14}/> Yesterday, 14:15</div>
                  <div className="text-sm font-medium">Est: ₹8,400</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </motion.div>

      <div className="mt-16 text-center">
        <Link href="#features" className="inline-flex items-center gap-2 text-primary font-medium uppercase tracking-widest text-sm hover:text-primary/80 transition-colors">
          See How It Works <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { num: "01", title: "Vehicle Intake", desc: "Capture vehicle, VIN, owner, complaints, and arrival details instantly." },
    { num: "02", title: "Repair Tracking", desc: "Follow every repair step from initial diagnosis to final completion." },
    { num: "03", title: "Work Progress", desc: "Maintain a timestamped, immutable history of all work performed." },
    { num: "04", title: "Cost Control", desc: "Separate parts and labor costs with automatic totals and clear margins." },
    { num: "05", title: "Job Sheets", desc: "Generate professional, printable job sheets for technicians and customers." },
    { num: "06", title: "Workshop Overview", desc: "See the complete workshop workload, bottlenecks, and revenue in one place." },
  ];

  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6">
      <div className="mb-16">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold uppercase text-center">
          Everything behind the repair.
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, i) => (
          <motion.div 
            key={i}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i}
            className="p-8 border border-white/5 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all group"
          >
            <div className="font-display text-4xl text-white/10 group-hover:text-primary/30 transition-colors mb-6">{feat.num}</div>
            <h3 className="text-xl font-medium mb-3 uppercase tracking-wider">{feat.title}</h3>
            <p className="text-sm text-secondary leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PeopleSection() {
  return (
    <section className="py-24 bg-surface-50 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold uppercase text-center mb-20">
          Built around the workshop.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-white/10">
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="pt-8 md:pt-0 md:px-8 first:pt-0 first:pl-0 last:pr-0">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-primary">Workshop Owners</h3>
            <p className="text-secondary text-lg leading-relaxed">"See what is happening across your entire workshop, identify bottlenecks, and control costs."</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="pt-8 md:pt-0 md:px-8">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-accent-steel">Service Advisors</h3>
            <p className="text-secondary text-lg leading-relaxed">"Keep every complaint, estimate, and customer communication organized in one place."</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="pt-8 md:pt-0 md:px-8">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-accent-green">Technicians</h3>
            <p className="text-secondary text-lg leading-relaxed">"Know exactly what needs to be done and easily record what was completed on every vehicle."</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function CinematicJourney() {
  const timeline = [
    { time: "09:20", text: "Vehicle received", color: "text-foreground" },
    { time: "10:15", text: "Initial inspection completed", color: "text-foreground" },
    { time: "11:40", text: "Brake issue diagnosed", color: "text-accent-rust" },
    { time: "13:10", text: "Customer approval received", color: "text-primary" },
    { time: "14:30", text: "Repair started", color: "text-accent-steel" },
    { time: "16:45", text: "Parts replaced", color: "text-foreground" },
    { time: "18:00", text: "Quality check", color: "text-accent-green" },
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 text-center mb-20 relative z-10">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-6xl font-display font-bold uppercase mb-6">
          Nothing gets lost<br/> along the way.
        </motion.h2>
        <p className="text-secondary uppercase tracking-widest text-sm">A permanent record of the repair journey.</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 relative z-10">
        <div className="absolute left-[39px] md:left-[50%] top-0 bottom-0 w-px bg-white/10" />
        
        <div className="flex flex-col gap-12">
          {timeline.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex flex-row md:justify-center items-center gap-6 md:gap-12 relative"
            >
              <div className="hidden md:block w-1/2 text-right">
                {i % 2 === 0 ? (
                  <span className={`text-xl font-medium tracking-wide ${item.color}`}>{item.text}</span>
                ) : (
                  <span className="font-mono text-sm text-secondary">{item.time}</span>
                )}
              </div>
              
              <div className="w-4 h-4 rounded-full bg-background border-2 border-primary relative z-10 shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
              
              <div className="w-full md:w-1/2 text-left flex flex-col md:block">
                <span className="md:hidden font-mono text-xs text-secondary mb-1">{item.time}</span>
                {i % 2 === 0 ? (
                  <span className={`md:hidden text-lg font-medium tracking-wide ${item.color}`}>{item.text}</span>
                ) : (
                  <span className={`text-lg md:text-xl font-medium tracking-wide ${item.color}`}>{item.text}</span>
                )}
                {i % 2 !== 0 && <span className="hidden md:block text-lg font-medium tracking-wide invisible">Spacer</span>}
                {i % 2 === 0 && <span className="hidden md:block font-mono text-sm text-secondary">{item.time}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandStatement() {
  return (
    <section id="about" className="py-40 bg-surface-50 border-y border-white/5">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold uppercase leading-tight mb-8"
        >
          Because a repair is<br/> <span className="text-secondary">more than a repair.</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto font-medium"
        >
          It's a journey of diagnosis, decisions, work, and trust.
        </motion.p>
      </div>
    </section>
  );
}

function CustomerCTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-background border-y border-white/5">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold uppercase mb-6">
          Already have a vehicle with us?
        </motion.h2>
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-xl text-secondary mb-10 max-w-2xl mx-auto">
          Follow its journey from inspection to repair to pickup.
        </motion.p>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex justify-center">
          <Link href="/track" className="px-8 py-4 bg-transparent border border-white/20 text-foreground font-semibold rounded hover:bg-white/5 transition-colors shadow-lg">
            Check Vehicle Status
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-6xl font-display font-bold uppercase mb-6">
          Run your workshop with clarity.
        </motion.h2>
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-xl text-secondary mb-12 max-w-2xl mx-auto">
          Manage every vehicle, complaint, repair, estimate, and progress update in one place.
        </motion.p>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex justify-center">
          <Link href="/login" className="px-8 py-4 bg-primary text-black font-semibold rounded hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(212,175,55,0.15)]">
            Workshop Login
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl tracking-widest uppercase">Vantara</span>
          </Link>
          <span className="text-sm text-secondary italic">"The Journey Behind Every Repair."</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="#" className="text-sm text-secondary hover:text-foreground transition-colors">Home</Link>
          <Link href="#how-it-works" className="text-sm text-secondary hover:text-foreground transition-colors">How It Works</Link>
          <Link href="#features" className="text-sm text-secondary hover:text-foreground transition-colors">Features</Link>
          <Link href="#about" className="text-sm text-secondary hover:text-foreground transition-colors">About</Link>
        </nav>
        
        <div className="text-sm text-white/30">
          © 2026 Vantara. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// --- MAIN PAGE ---
export default function Home() {
  return (
    <main className="w-full bg-background min-h-screen text-foreground selection:bg-primary/30">
      <Header />
      <HeroSection />
      <CustomerTracking />
      <ProblemSection />
      <JourneySection />
      <ProductPreview />
      <FeaturesSection />
      <CinematicJourney />
      <CustomerCTASection />
      <CTASection />
      <Footer />
    </main>
  );
}
