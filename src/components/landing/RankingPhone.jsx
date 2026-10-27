import { motion } from 'framer-motion';
import { ScreenRanking } from '@/components/landing/PhoneMockup';

export default function RankingPhone() {
  return (
    <motion.div
      className="relative w-[300px] max-w-full"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="absolute -inset-6 rounded-[3rem] bg-primary/15 blur-3xl" />
      <div className="relative rounded-[2.6rem] border border-white/15 bg-[#0d0d10] p-2 shadow-[0_30px_80px_-24px_rgba(0,123,255,0.5)]">
        <div className="relative h-[432px] overflow-hidden rounded-[2.1rem] border border-white/10 bg-[#111114]">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
          <div className="h-full pt-8">
            <ScreenRanking />
          </div>
        </div>
      </div>
    </motion.div>
  );
}