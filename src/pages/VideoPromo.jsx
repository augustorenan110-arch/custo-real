import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import "@/components/promo/promo.css";
import PromoSlide1 from "@/components/promo/PromoSlide1";
import PromoSlide2 from "@/components/promo/PromoSlide2";
import PromoSlide3 from "@/components/promo/PromoSlide3";
import PromoSlide4 from "@/components/promo/PromoSlide4";

const FORMATS = {
  reels: { label: "Reels 9:16", ratio: 9 / 16 },
  feed: { label: "Feed 1:1", ratio: 1 },
};

const HIDE_DELAY = 4000;

export default function VideoPromo() {
  const [format, setFormat] = useState("reels");
  const [runId, setRunId] = useState(0);
  const [chrome, setChrome] = useState(true);
  const timerRef = useRef(null);
  const ratio = FORMATS[format].ratio;

  const restart = () => setRunId((value) => value + 1);

  // A barra de controles sai da tela e o loop reinicia do zero: gravação limpa.
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setChrome(false);
      restart();
    }, HIDE_DELAY);
    return () => clearTimeout(timerRef.current);
  }, []);

  const showChrome = () => {
    clearTimeout(timerRef.current);
    setChrome(true);
    timerRef.current = setTimeout(() => {
      setChrome(false);
      restart();
    }, HIDE_DELAY);
  };

  const stageStyle = {
    width: `min(calc(100vh - 96px) * ${ratio}, 100vw)`,
    height: `min(calc(100vh - 96px), calc(100vw / ${ratio}))`,
  };

  const chromeClass = `flex w-full flex-wrap items-center justify-center gap-2 transition-opacity duration-500 ${
    chrome ? "opacity-100" : "opacity-0"
  }`;

  return (
    <div
      className="vp-root flex min-h-screen flex-col items-center gap-3 px-3 py-4"
      onClick={showChrome}
    >
      <div className={chromeClass}>
        {Object.entries(FORMATS).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFormat(key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              format === key
                ? "border-white/20 bg-white text-black"
                : "border-white/15 text-white/65 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/65 transition hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reiniciar
        </button>
      </div>

      <div className={`vp-stage ${format === "feed" ? "vp-square" : ""}`} style={stageStyle}>
        <div key={runId} className="vp-track">
          <PromoSlide1 />
          <PromoSlide2 />
          <PromoSlide3 />
          <PromoSlide4 />
        </div>
      </div>

      <p
        className={`text-[11px] text-white/35 transition-opacity duration-500 ${
          chrome ? "opacity-100" : "opacity-0"
        }`}
      >
        15s em loop · toque na tela para ver os controles
      </p>
    </div>
  );
}