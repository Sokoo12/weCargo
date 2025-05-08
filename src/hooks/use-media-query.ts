"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook that returns whether a media query matches
 * @param query The media query to check
 * @returns A boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // First check on component mount
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    // Create a listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add the listener to media query
    media.addEventListener("change", listener);
    
    // Clean up
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);
  
  return matches;
} 