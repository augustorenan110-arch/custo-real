export default function LandingBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg className="landing-circuits absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="landing-connections" width="320" height="320" patternUnits="userSpaceOnUse">
            <path d="M0 56h62l30 30h70l46-46h112M0 242h40l42-42h76l40 40h122M112 0v46l-34 34v72l38 38v130M270 0v102l-42 42v72l36 36v68M162 86v56l36 36h122" />
            <circle cx="62" cy="56" r="3" /><circle cx="162" cy="86" r="3" />
            <circle cx="78" cy="152" r="3" /><circle cx="228" cy="144" r="3" />
            <circle cx="158" cy="200" r="3" /><circle cx="264" cy="252" r="3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#landing-connections)" />
      </svg>
      <div className="landing-glow landing-glow--top" />
      <div className="landing-glow landing-glow--middle" />
    </div>
  );
}