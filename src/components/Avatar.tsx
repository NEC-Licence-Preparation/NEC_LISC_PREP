"use client";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  borderClassName?: string;
  fallbackText?: string;
}

export function Avatar({
  src,
  alt = "Avatar",
  size = 40,
  className = "",
  borderClassName = "border border-[#DCD6F7]",
  fallbackText,
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const initial = (fallbackText || alt || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`overflow-hidden rounded-full bg-primary/10 text-primary flex items-center justify-center ${borderClassName} ${className}`}
      style={{ width: size, height: size }}
    >
      {src && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="font-semibold">{initial}</span>
      )}
    </div>
  );
}
