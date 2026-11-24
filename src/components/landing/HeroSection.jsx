import HeroIntro from '@/components/landing/HeroIntro';
import HeroCalculator from '@/components/landing/HeroCalculator';
import PhoneMockup from '@/components/landing/PhoneMockup';

export default function HeroSection({ startTo, panelTo }) {
  return (
    <section className="landing-hero relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24">
      <HeroIntro startTo={startTo} />
      <div className="min-w-0 space-y-10">
        <HeroCalculator panelTo={panelTo} />
        <PhoneMockup />
      </div>
    </section>
  );
}