"use client";

import { useState, useEffect } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends NextImageProps {
  fallbackSrc?: string;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder.png",
  className,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setImgSrc(typeof src === "string" ? src : fallbackSrc);
  }, [src, fallbackSrc]);

  if (!imgSrc) return null;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <NextImage
        src={imgSrc}
        alt={alt}
        priority={priority}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setLoading(false);
        }}
        loading={priority ? "eager" : "lazy"}
        {...props}
        className={cn(
          "transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          props.className
        )}
      />
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/20"
          aria-hidden="true"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
} 