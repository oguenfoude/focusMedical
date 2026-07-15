import * as React from "react";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      fill="none"
    >
      {/* Outer thick circle */}
      <circle cx="50" cy="50" r="40" stroke="#059669" strokeWidth="6" />
      
      {/* Inner dashed circle */}
      <circle cx="50" cy="50" r="30" stroke="#38bdf8" strokeWidth="3" strokeDasharray="10 6" />
      
      {/* Green Medical Cross (thick and rounded) */}
      <path
        d="M65 40 H55 V30 C55 27 53 25 50 25 C47 25 45 27 45 30 V40 H35 C32 40 30 42 30 45 C30 48 32 50 35 50 H45 V60 C45 63 47 65 50 65 C53 65 55 63 55 60 V50 H65 C68 50 70 48 70 45 C70 42 68 40 65 40 Z"
        fill="#059669"
      />
    </svg>
  );
}
