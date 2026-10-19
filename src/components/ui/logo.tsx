import * as React from "react";

export function Logo({
  className = "w-6 h-6",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      aria-label="SMS Logo"
      {...props}
    >
      <g>
        {/* Upper Ribbon: Mortarboard Apex flowing into Central 'S' Spine */}
        <path d="M 256 64 L 448 160 L 400 184 L 256 112 L 136 172 L 384 296 L 384 368 L 256 432 L 128 368 L 128 320 L 168 340 L 168 346 L 256 390 L 344 346 L 344 318 L 64 178 L 64 160 Z" />

        {/* Detached Upper-Right Tassel / Balancing Chevron */}
        <path d="M 408 212 L 448 192 L 448 304 L 408 324 Z" />
      </g>
    </svg>
  );
}
