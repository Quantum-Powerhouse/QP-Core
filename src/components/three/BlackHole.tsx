"use client";

/**
 * The black hole as an ink plate: the classic lensed accretion drawing on
 * paper. A true black event horizon, a thin photon ring, the accretion
 * ellipse passing behind the top and in front of the bottom, and the lensed
 * halo arcs above and below the disk. Pure SVG; the only motion is dust
 * drifting along the accretion band, and reduced motion stills it.
 * (This replaced a three.js scene; the export and its usage are unchanged.)
 */
export function BlackHole() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden>
      <svg viewBox="0 0 640 640" className="bh-plate h-[min(62vmin,560px)] w-[min(62vmin,560px)]">
        <defs>
          <radialGradient id="bh-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14161a" stopOpacity="0.16" />
            <stop offset="55%" stopColor="#14161a" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#14161a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bh-band" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#46617c" stopOpacity="0" />
            <stop offset="18%" stopColor="#46617c" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#7d8ea3" stopOpacity="1" />
            <stop offset="82%" stopColor="#46617c" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#46617c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gravitational dimming of the paper around the hole */}
        <circle cx="320" cy="320" r="300" fill="url(#bh-shadow)" />

        {/* accretion ellipse, back half: rises behind the disk */}
        <path d="M 68 320 A 252 74 0 0 1 572 320" fill="none" stroke="url(#bh-band)" strokeWidth="3" opacity="0.55" />

        {/* lensed halo: the far side of the disk bent over and under */}
        <path d="M 232 320 A 88 118 0 0 1 408 320" fill="none" stroke="#7d8ea3" strokeWidth="2" opacity="0.7" />
        <path d="M 240 320 A 80 104 0 0 0 400 320" fill="none" stroke="#7d8ea3" strokeWidth="1.5" opacity="0.45" />

        {/* photon ring, then the horizon itself */}
        <circle cx="320" cy="320" r="92" fill="none" stroke="#9fb4cc" strokeWidth="1.5" opacity="0.9" />
        <circle cx="320" cy="320" r="86" fill="#101215" />

        {/* accretion ellipse, front half: passes before the disk */}
        <path d="M 68 320 A 252 74 0 0 0 572 320" fill="none" stroke="url(#bh-band)" strokeWidth="4.5" opacity="0.95" />

        {/* dust drifting along the band; the dash offset animates */}
        <path
          className="bh-dust"
          d="M 68 320 A 252 74 0 0 0 572 320"
          fill="none"
          stroke="#46617c"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="1 46"
          opacity="0.5"
        />
        <path
          className="bh-dust-slow"
          d="M 76 320 A 244 66 0 0 1 564 320"
          fill="none"
          stroke="#7d8ea3"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="1 64"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
