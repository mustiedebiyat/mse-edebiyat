import React from 'react';

interface MseEmblemProps {
  className?: string;
}

export const MseEmblem: React.FC<MseEmblemProps> = ({
  className = 'w-16 h-16 sm:w-20 sm:h-20',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`${className} rounded-xl bg-white/90 border border-[#DFD1EA] p-1 flex items-center justify-center shrink-0 shadow-2xs`}
    >
      <svg
        viewBox="0 0 80 80"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="76" height="76" rx="16" fill="#4B2E6B" />
        <rect
          x="6"
          y="6"
          width="68"
          height="68"
          rx="13"
          stroke="#E0823D"
          strokeWidth="1.5"
          strokeOpacity="0.65"
        />
        <path
          d="M40 12l6.5 12-3 7.5h-7l-3-7.5L40 12z"
          fill="#E0823D"
          stroke="#FFF7F0"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <line
          x1="40"
          y1="13"
          x2="40"
          y2="22"
          stroke="#FFF7F0"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="40" cy="24" r="1.5" fill="#FFF7F0" />
        <path
          d="M17 34c7-3 15-3 23 1 8-4 16-4 23-1"
          stroke="#E8D8F5"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <text
          x="40"
          y="56"
          textAnchor="middle"
          fill="#FFF8F2"
          fontFamily="Fraunces, Georgia, serif"
          fontSize="21"
          fontWeight="700"
          letterSpacing="0.5"
        >
          MŞE
        </text>
        <rect x="20" y="62" width="40" height="2.6" rx="1.3" fill="#E0823D" />
      </svg>
    </div>
  );
};
