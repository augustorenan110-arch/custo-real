import { motion } from 'framer-motion';

const FACES = [
  { transform: 'translateZ(56px)' },
  { transform: 'rotateY(180deg) translateZ(56px)' },
  { transform: 'rotateY(90deg) translateZ(56px)' },
  { transform: 'rotateY(-90deg) translateZ(56px)' },
  { transform: 'rotateX(90deg) translateZ(56px)' },
  { transform: 'rotateX(-90deg) translateZ(56px)' },
];

export default function GlassCube({ className = '' }) {
  return (
    <div className={className} style={{ perspective: '800px' }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: [0, 360], rotateX: [10, 22, 10] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      >
        {FACES.map((f, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-xl border border-[#2a2a2e] bg-primary/5 shadow-[inset_0_0_28px_rgba(37,99,235,0.35)] backdrop-blur-sm"
            style={{ transform: f.transform }}
          />
        ))}
        <div className="absolute inset-6 rounded-full bg-primary/25 blur-2xl" />
      </motion.div>
    </div>
  );
}