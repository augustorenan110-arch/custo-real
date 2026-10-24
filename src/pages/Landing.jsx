import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import PainSection from '@/components/landing/PainSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorks from '@/components/landing/HowItWorks';
import BeforeAfter from '@/components/landing/BeforeAfter';
import SocialProof from '@/components/landing/SocialProof';
import PlansSection from '@/components/landing/PlansSection';
import FaqSection from '@/components/landing/FaqSection';
import LandingFooter from '@/components/landing/LandingFooter';
import GlassCube from '@/components/landing/GlassCube';

const PARTICLES = [
  { left: '8%', top: '18%', size: 3, color: 'bg-primary', delay: 0 },
  { left: '22%', top: '62%', size: 2, color: 'bg-success', delay: 0.6 },
  { left: '38%', top: '12%', size: 2, color: 'bg-primary', delay: 1.2 },
  { left: '55%', top: '78%', size: 3, color: 'bg-success', delay: 0.3 },
  { left: '71%', top: '26%', size: 2, color: 'bg-primary', delay: 1.5 },
  { left: '86%', top: '58%', size: 3, color: 'bg-primary', delay: 0.9 },
  { left: '94%', top: '14%', size: 2, color: 'bg-success', delay: 1.8 },
];

export default function Landing() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => setEmail(u?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  const logged = !!email;
  const startTo = logged ? '/painel' : '/register';
  const panelTo = logged ? '/rescisao' : '/login';

  return (
    <div className="tech-shell relative min-h-screen overflow-hidden">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[22rem] w-[22rem] rounded-full bg-success/10 blur-[120px]" />

      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={`pointer-events-none absolute rounded-full ${p.color}`}
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -26, 0], opacity: [0.25, 0.85, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      <GlassCube className="pointer-events-none absolute right-[6%] top-[42%] hidden h-28 w-28 opacity-60 lg:block" />

      <div className="relative">
        <LandingHeader startTo={startTo} />
        <HeroSection startTo={startTo} panelTo={panelTo} />
        <PainSection />
        <FeaturesSection />
        <HowItWorks />
        <BeforeAfter />
        <SocialProof />
        <PlansSection startTo={startTo} />
        <FaqSection />
        <LandingFooter startTo={startTo} />
      </div>
    </div>
  );
}