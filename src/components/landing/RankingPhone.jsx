import { motion } from 'framer-motion';
import { ScreenRanking } from '@/components/landing/PhoneMockup';

export default function RankingPhone() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[300px]"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="pointer-events-none absolute inset-0 scale-110 rounded-[3rem] bg-primary/15 blur-2xl" />
      <div className="relative rounded-[2.4rem] border border-white/15 bg-[#0d0d10] p-2 shadow-[0_30px_80px_-24px_rgba(0,123,255,0.5)]">
        <div className="relative h-[350px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#111114] sm:h-[410px]">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
          <div className="h-full pt-8">
            <ScreenRanking />
          </div>
        </div>
      </div>
    </motion.div>
  );
}