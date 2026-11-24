import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Header from '@/components/landing2/Header';
import Hero from '@/components/landing2/Hero';
import FeatureCards from '@/components/landing2/FeatureCards';
import TrustFooter from '@/components/landing2/TrustFooter';

export default function Landing() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => setLogged(!!u))
      .catch(() => setLogged(false));
  }, []);

  const startTo = logged ? '/painel' : '/entrar';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060E1F] text-white">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute left-0 top-1/3 h-[20rem] w-[20rem] rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative">
        <Header startTo={startTo} />
        <Hero startTo={startTo} />
        <FeatureCards />
        <TrustFooter />
      </div>
    </div>
  );
}