import React from 'react';

interface MascotCupProps {
  className?: string;
  size?: number;
  badge?: boolean;
  speechBubbleText?: string;
}

export default function MascotCup({ className = '', size = 180, badge = false, speechBubbleText }: MascotCupProps) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md select-none transition-transform hover:scale-105 duration-300"
      >
        {/* Background Circle Badge if enabled */}
        {badge && (
          <circle cx="150" cy="150" r="140" fill="#2A163B" stroke="#E0A226" strokeWidth="6" />
        )}

        {badge && (
          <circle cx="150" cy="150" r="125" fill="#FAF7F2" opacity="0.08" />
        )}

        {/* Playful Steam rising from the cup */}
        <g className="animate-pulse">
          {/* Steam Strand 1 */}
          <path
            d="M 125 75 C 120 50, 140 40, 130 20 C 125 10, 135 5, 140 10 C 145 20, 130 30, 135 50"
            stroke="#F5EFE6"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Steam Strand 2 */}
          <path
            d="M 155 70 C 150 45, 170 35, 160 15 C 155 5, 165 0, 170 5 C 175 15, 160 25, 165 45"
            stroke="#E0A226"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Steam Strand 3 */}
          <path
            d="M 180 78 C 175 58, 190 48, 182 28"
            stroke="#FAF7F2"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.4"
          />
        </g>

        {/* Cup Shadow */}
        <ellipse cx="155" cy="245" rx="60" ry="10" fill="#2A163B" opacity="0.3" />

        {/* Cup Handle (Right Side) */}
        <path
          d="M 210 120 C 255 120, 260 185, 205 190"
          stroke="#B37C51"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 210 125 C 245 125, 248 180, 208 184"
          stroke="#FAF7F2"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tag on the handle (says "DISCIPLINE IS SEXY" or "NO DISCIPLINE IS SEXY") */}
        <g transform="translate(225, 165) rotate(15)">
          {/* String */}
          <line x1="-15" y1="-25" x2="0" y2="0" stroke="#8B6811" strokeWidth="2" />
          {/* Tag body */}
          <rect x="-10" y="0" width="45" height="28" rx="4" fill="#E0A226" stroke="#2A163B" strokeWidth="2.5" />
          {/* Tiny eyelet */}
          <circle cx="0" cy="6" r="2.5" fill="#FAF7F2" stroke="#2A163B" strokeWidth="1.5" />
          {/* Slogan */}
          <text x="17" y="13" fill="#2A163B" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            NO EXCUSES
          </text>
          <text x="17" y="21" fill="#2A163B" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            BETA!
          </text>
        </g>

        {/* Cup Body Base */}
        <path
          d="M 90 100 L 210 100 C 210 100, 215 210, 150 220 C 85 210, 90 100, 90 100 Z"
          fill="#FAF7F2"
          stroke="#2A163B"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* Cup Inner Rim / Liquid */}
        <ellipse cx="150" cy="100" rx="60" ry="12" fill="#8B5E3C" stroke="#2A163B" strokeWidth="5" />
        <ellipse cx="150" cy="100" rx="48" ry="8" fill="#5F3B20" />

        {/* Face Elements */}

        {/* Confident Sassy Eyebrows */}
        {/* Left Eyebrow - Cocked/Raised slightly */}
        <path
          d="M 105 120 Q 120 110, 132 122"
          stroke="#2A163B"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Eyebrow - Smart Sassy arch */}
        <path
          d="M 160 124 Q 175 112, 190 119"
          stroke="#2A163B"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tiny bindi/tilak for the global cool "aunty vibe" */}
        <circle cx="147" cy="122" r="3.5" fill="#E03E2D" />

        {/* Cool Oversized Black Sunglasses */}
        <g>
          {/* Left Lens */}
          <path
            d="M 95 132 L 142 135 C 145 155, 125 170, 105 165 C 93 162, 92 145, 95 132 Z"
            fill="#1E122A"
            stroke="#2A163B"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Left Lens Highlight */}
          <path
            d="M 102 138 L 130 140 C 120 152, 110 152, 102 138 Z"
            fill="#FAF7F2"
            opacity="0.3"
          />
          {/* Right Lens */}
          <path
            d="M 152 135 L 199 132 C 202 145, 201 162, 189 165 C 169 170, 149 155, 152 135 Z"
            fill="#1E122A"
            stroke="#2A163B"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Right Lens Highlight */}
          <path
            d="M 159 140 L 187 138 C 180 152, 170 152, 159 140 Z"
            fill="#FAF7F2"
            opacity="0.3"
          />
          {/* Glasses Bridge */}
          <rect x="139" y="133" width="16" height="5" rx="2" fill="#2A163B" />
        </g>

        {/* Cheek Blushes */}
        <circle cx="102" cy="180" r="8" fill="#E03E2D" opacity="0.2" />
        <circle cx="192" cy="177" r="8" fill="#E03E2D" opacity="0.2" />

        {/* Confident smirk/smile mouth */}
        <path
          d="M 135 186 Q 152 195, 163 182"
          stroke="#2A163B"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Stylish Purple Scarf (wrapped snugly around the cup base) */}
        <g>
          {/* Scarf Main Wrap */}
          <path
            d="M 80 205 Q 150 225, 215 200 Q 225 215, 210 230 Q 150 242, 85 220 Q 75 210, 80 205 Z"
            fill="#5E2D75"
            stroke="#2A163B"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Scarf Knot/Hanging Tail */}
          <path
            d="M 82 215 C 65 220, 50 245, 62 265 C 75 270, 92 245, 90 225 Z"
            fill="#4F2263"
            stroke="#2A163B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Scarf Gold/Mustard patterns (little crosses/stars) */}
          <circle cx="110" cy="216" r="3" fill="#E0A226" />
          <circle cx="140" cy="222" r="3" fill="#E0A226" />
          <circle cx="170" cy="218" r="3" fill="#E0A226" />
          <circle cx="195" cy="211" r="3" fill="#E0A226" />
          
          <circle cx="70" cy="235" r="2.5" fill="#E0A226" />
          <circle cx="75" cy="250" r="2.5" fill="#E0A226" />
        </g>
      </svg>

      {/* Speech Bubble representation */}
      {speechBubbleText && (
        <div className="mt-4 max-w-xs bg-white rounded-2xl p-4 border-2 border-dark-brown relative shadow-md">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-10" />
          <div className="absolute -top-[14px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[9px] border-r-[9px] border-b-[9px] border-transparent border-b-dark-brown" />
          <p className="text-xs font-serif italic text-dark-brown text-center font-semibold">
            "{speechBubbleText}"
          </p>
        </div>
      )}
    </div>
  );
}
