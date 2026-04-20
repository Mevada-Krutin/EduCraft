import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Facebook, BookOpen, Box, Shield, Zap, Globe, Cpu, Activity, Database } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 relative overflow-hidden border-t border-slate-200" style={{ padding: '6rem 0 3rem' }}>
      {/* Decorative Elements */}
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container-wide px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-16 mb-20">
          {/* Brand Column */}
          <div className="xl:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-xl"></div>
                <div className="relative bg-white p-2.5 rounded-2xl border border-slate-100 group-hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-sm">
                  <Box size={24} className="text-primary relative z-10" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-text-primary uppercase group-hover:text-primary transition-colors">EDUCRAFT</span>
                <span className="text-[9px] font-black tracking-[0.4em] text-primary/80 mt-1 uppercase">Advanced Learning Node</span>
              </div>
            </Link>
            <p className="text-text-secondary text-sm font-medium leading-relaxed max-w-sm">
              Architecting the future of pedagogical exchange through high-fidelity digital environments and tactical curriculum sequences.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Github, url: 'https://github.com/Mevada-Krutin' },
                { Icon: Instagram, url: 'https://www.instagram.com/mkcompany.76?igsh=MWdiZW0xb25oZnh3bQ==' },
                { Icon: Linkedin, url: 'https://www.linkedin.com/in/krutin-mevada-155a7634b/' },
                { Icon: Facebook, url: 'https://www.facebook.com/profile.php?id=61580459840629' }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 hover:bg-slate-50 transition-all group/icon shadow-sm"
                >
                  <social.Icon size={18} className="group-hover/icon:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="xl:col-span-2 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary flex items-center gap-3">
              <div className="w-1 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              ></div> Core Links
            </h4>
            <ul className="flex flex-col gap-4">
              {[
                { name: 'Intelligence Registry', path: '/courses' },
                { name: 'Operational Command', path: '/dashboard' },
                { name: 'Instructor Node', path: '/instructor/dashboard' },
                { name: 'Global Root', path: '/admin/dashboard' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-2 group/link">
                    <div className="w-1 h-1 rounded-full bg-primary/30 group-hover/link:bg-primary transition-colors"></div>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Infrastructure Matrix */}
          <div className="xl:col-span-2 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary flex items-center gap-3">
              <div className="w-1 h-3 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div> Protocols
            </h4>
            <ul className="flex flex-col gap-4">
              {[
                { name: 'Privacy Matrix', path: '#' },
                { name: 'System Terms', path: '#' },
                { name: 'Intel Support', path: '#' },
                { name: 'API Documentation', path: '#' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-secondary transition-colors flex items-center gap-2 group/link">
                    <div className="w-1 h-1 rounded-full bg-secondary/30 group-hover/link:bg-secondary transition-colors"></div>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* System Status Matrix */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 relative overflow-hidden group shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary">Platform Status</h4>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-lg border border-green-100 text-[8px] font-black text-green-600 uppercase tracking-widest animate-pulse">
                  <Activity size={10} /> Operational
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu size={14} className="text-primary/60" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Core Cluster 0xFA</span>
                  </div>
                  <span className="text-[9px] font-black text-text-primary">99.9% Up</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database size={14} className="text-primary/60" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Registry Shards</span>
                  </div>
                  <span className="text-[9px] font-black text-text-primary">Synced</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={14} className="text-secondary/60" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Cipher Integrity</span>
                  </div>
                  <span className="text-[9px] font-black text-text-primary">Verified</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black italic text-text-muted/60 text-center uppercase tracking-widest group-hover:text-primary/40 transition-colors">EduCraft Quantum Engine v2.5.4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Integrity Bar */}
        <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            <span>© {new Date().getFullYear()} EDUCRAFT CORE</span>
            <div className="h-3 w-px bg-slate-200 hidden md:block"></div>
            <span>Authorized Access Only</span>
          </div>
          <div className="flex items-center gap-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">SSL 256 BIT</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">EDGE BUFFERED</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">CDN OPTIMIZED</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
