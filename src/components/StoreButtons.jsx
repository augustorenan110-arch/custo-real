import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AnimatedIcon from '@/components/ui/AnimatedIcon';

const LOJAS = [
  {
    nome: 'Google Play',
    alt: 'Disponível no Google Play',
    src: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg',
    aviso: 'App Android em homologação, use a versão web que já tem ponto facial',
  },
  {
    nome: 'App Store',
    alt: 'Baixar na App Store',
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg',
    aviso: 'App iOS em homologação, use a versão web que já tem ponto facial',
  },
];

export default function StoreButtons() {
  return (
    <section className="lazy-section mx-auto max-w-3xl px-5 py-12 text-center sm:px-8">
      <h2 className="font-tech text-xl font-bold sm:text-2xl">Baixe o app e faça ponto facial</h2>
      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        {LOJAS.map((loja) => (
          <motion.a
            key={loja.nome}
            href="#"
            title={loja.alt}
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.preventDefault();
              toast({ title: 'Em breve', description: loja.aviso });
            }}
            className="block w-[180px] shrink-0"
          >
            <img
              src={loja.src}
              alt={loja.alt}
              loading="lazy"
              className="h-14 w-[180px] rounded-lg object-contain"
            />
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/40 bg-[#052e16] px-2.5 py-1 text-left text-[10px] font-semibold text-[#22C55E]">
              <AnimatedIcon icon={Check} size={16} color="#22C55E" />
              FUNCIONANDO 100% NO NAVEGADOR - Ponto facial + GPS
            </span>
          </motion.a>
        ))}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Ou continue usando no navegador com ponto facial e GPS funcionando 100%
      </p>
    </section>
  );
}