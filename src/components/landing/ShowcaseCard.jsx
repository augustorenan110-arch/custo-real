import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Images } from 'lucide-react';
import { Image } from '@/components/ui/image';
import ShowcaseSimulatorMockup from '@/components/landing/ShowcaseSimulatorMockup';

export default function ShowcaseCard({ item, index }) {
  const card = useRef(null);
  const [scene, setScene] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('pg2-play');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    observer.observe(card.current);
    return () => observer.disconnect();
  }, []);
  const toggleOnTouch = (event) => {
    if (!event.target.closest('a, button') && window.matchMedia('(hover: none)').matches) setScene((value) => !value);
  };
  return (
    <li className="pg2-item">
      <article ref={card} className={`pg2-card${scene ? ' pg2-is-scene' : ''}`} onClick={toggleOnTouch}>
        <ul className="pg2-pills">
          <li className="pg2-pill pg2-pill--index">{String(index + 1).padStart(2, '0')}</li>
          <li><Link to={item.tagTo} className="pg2-pill">{item.tag}</Link></li>
        </ul>
        <div className="pg2-body">
          <h3 className="pg2-name"><Link to={item.to}>{item.name}</Link></h3>
          <p className="pg2-copy">{item.copy}</p>
          <figure className={`pg2-media pg2-media--${item.kind}`}>
            {item.kind === 'simulator' ? (
              <ShowcaseSimulatorMockup to={item.to} />
            ) : (
              <Link to={item.to} className="pg2-image-link" aria-label={`Conhecer ${item.name}`}>
                <Image src={item.image} alt={item.alt} className="pg2-photo" fittingType="fit" loading="lazy" />
                <Image src={item.scene} alt="" className="pg2-scene" fittingType="fill" loading="lazy" />
              </Link>
            )}
            {item.kind !== 'simulator' && (
              <button type="button" className="pg2-toggle" onClick={() => setScene((value) => !value)} aria-label={`Alternar ilustração de ${item.name}`} aria-pressed={scene}>
                <Images className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </figure>
        </div>
      </article>
    </li>
  );
}