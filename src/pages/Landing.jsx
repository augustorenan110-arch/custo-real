import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import ModeTabs from '@/components/landing/ModeTabs';
import EscritorioTab from '@/components/landing/EscritorioTab';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import VideoShowcase from '@/components/landing/VideoShowcase';
import PainSection from '@/components/landing/PainSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorks from '@/components/landing/HowItWorks';
import BeforeAfter from '@/components/landing/BeforeAfter';
import SocialProof from '@/components/landing/SocialProof';
import PlansSection from '@/components/landing/PlansSection';
import FaqSection from '@/components/landing/FaqSection';
import LandingFooter from '@/components/landing/LandingFooter';
import LandingBackdrop from '@/components/landing/LandingBackdrop';
import '@/components/landing/landing.css';

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } };

export default function Landing() {
  const [email, setEmail] = useState(null);
  const [tab, setTab] = useState(() =>
    new URLSearchParams(window.location.search).get('aba') === 'escritorio' ? 'escritorio' : 'empresa',
  );

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => setEmail(u?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  const logged = !!email;
  const startTo = logged ? '/painel' : '/entrar';
  const panelTo = logged ? '/rescisao' : '/login';

  return (
    <div className="landing-page tech-shell relative isolate min-h-screen overflow-x-clip">
      <LandingBackdrop />
      <div className="relative">
        <ModeTabs tab={tab} onChange={setTab} />

        {tab === 'empresa' ? (
          <motion.div key="empresa" {...fade}>
            <LandingHeader startTo={startTo} />
            <HeroSection startTo={startTo} panelTo={panelTo} />
            <VideoShowcase />
            <PainSection />
            <FeaturesSection />
            <HowItWorks />
            <BeforeAfter />
            <SocialProof />
            <PlansSection startTo={startTo} />
            <FaqSection />
            <LandingFooter startTo={startTo} />
          </motion.div>
        ) : (
          <motion.div key="escritorio" {...fade}>
            <LandingHeader startTo={startTo} />
            <EscritorioTab />
            <LandingFooter startTo={startTo} />
          </motion.div>
        )}
      </div>
    </div>
  );
}