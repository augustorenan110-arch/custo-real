import { Component, useMemo } from 'react';
import Lottie from 'lottie-react';
import { pulseRing, scanLine } from '@/lib/lottie';

const BUILDERS = { pulse: pulseRing, scan: scanLine };

// Se a animação não puder ser renderizada, o ícone continua aparecendo.
class AnimacaoSegura extends Component {
  state = { falhou: false };

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  render() {
    return this.state.falhou ? null : this.props.children;
  }
}

/**
 * Ícone profissional animado: animação Lottie (loop suave) atrás do ícone lucide.
 * size: 16 | 18 | 20 | 24 (máximo 24) · animation: 'pulse' | 'scan'
 */
export default function AnimatedIcon({
  icon: Icon,
  size = 18,
  color = '#22C55E',
  animation = 'pulse',
  strokeWidth = 2.4,
  className = '',
}) {
  const data = useMemo(() => (BUILDERS[animation] || pulseRing)(color), [animation, color]);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <AnimacaoSegura>
        <Lottie animationData={data} loop autoplay className="absolute inset-0 h-full w-full" />
      </AnimacaoSegura>
      <Icon size={Math.round(size * 0.66)} strokeWidth={strokeWidth} color={color} className="relative" />
    </span>
  );
}