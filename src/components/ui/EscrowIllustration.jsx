export default function EscrowIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 360 190"
      fill="none"
      className={className}
      role="img"
      aria-label="Tokens move from the requester to escrow and then to the provider"
    >
      <path d="M100 90H260" stroke="white" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 6" />

      {/* Requester */}
      <rect x="8" y="40" width="92" height="100" rx="18" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" />
      <circle cx="54" cy="74" r="14" fill="white" fillOpacity="0.28" />
      <rect x="28" y="100" width="52" height="8" rx="4" fill="white" fillOpacity="0.35" />
      <rect x="36" y="115" width="36" height="6" rx="3" fill="white" fillOpacity="0.2" />
      <text x="54" y="168" textAnchor="middle" fontSize="12" fill="white" fillOpacity="0.8">Requester</text>

      {/* Escrow */}
      <circle cx="180" cy="90" r="42" fill="#e8a500" fillOpacity="0.18" />
      <circle cx="180" cy="90" r="30" fill="#e8a500" />
      <rect x="168" y="88" width="24" height="18" rx="4" fill="#19233b" />
      <path d="M173 88v-5a7 7 0 0 1 14 0v5" stroke="#19233b" strokeWidth="3.5" strokeLinecap="round" />
      <text x="180" y="168" textAnchor="middle" fontSize="12" fill="white" fillOpacity="0.8">Escrow</text>

      {/* Provider */}
      <rect x="260" y="40" width="92" height="100" rx="18" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" />
      <circle cx="306" cy="74" r="14" fill="white" fillOpacity="0.28" />
      <rect x="280" y="100" width="52" height="8" rx="4" fill="white" fillOpacity="0.35" />
      <rect x="288" y="115" width="36" height="6" rx="3" fill="white" fillOpacity="0.2" />
      <text x="306" y="168" textAnchor="middle" fontSize="12" fill="white" fillOpacity="0.8">Provider</text>

      {/* Floating coins */}
      <g className="motion-safe:animate-float">
        <circle cx="136" cy="64" r="11" fill="#e8a500" />
        <text x="136" y="68" textAnchor="middle" fontSize="11" fontWeight="700" fill="#19233b">T</text>
      </g>
      <g className="motion-safe:animate-float" style={{ animationDelay: '-3s' }}>
        <circle cx="226" cy="116" r="11" fill="#e8a500" />
        <text x="226" y="120" textAnchor="middle" fontSize="11" fontWeight="700" fill="#19233b">T</text>
      </g>
    </svg>
  );
}