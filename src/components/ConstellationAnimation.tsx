"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const numStars = 50;

const generateStars = () => {
  return Array.from({ length: numStars }, () => ({
    id: Math.random().toString(36).substr(2, 9),
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 5,
    delay: Math.random() * 5,
    vx: Math.random() * 0.1 - 0.05, // Horizontal velocity
    vy: Math.random() * 0.1 - 0.05, // Vertical velocity
    opacity: Math.random() * 0.1 + 0.5, // Random initial opacity
  }));
};

const ConstellationAnimation = () => {
  // Start with an empty array to avoid hydration mismatch
  const [stars, setStars] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize stars only on the client side
  useEffect(() => {
    setIsClient(true);
    setStars(generateStars());
    
    const interval = setInterval(() => {
      setStars((prevStars) =>
        prevStars.map((star) => ({
          ...star,
          x: (star.x + star.vx + 100) % 100, // Wrap around horizontally
          y: (star.y + star.vy + 100) % 100, // Wrap around vertically
        }))
      );
    }, 50); // Update star positions every 50ms

    // Randomly fade and regenerate stars
    const fadeInterval = setInterval(() => {
      setStars((prevStars) => {
        const newStars = prevStars.map((star) => {
          if (Math.random() < 0.02) {
            // 2% chance to fade and regenerate
            return {
              ...star,
              x: Math.random() * 100,
              y: Math.random() * 100,
              opacity: Math.random() * 0.8 + 0.2,
            };
          }
          return star;
        });
        return newStars;
      });
    }, 1000); // Check for fading every 1 second

    return () => {
      clearInterval(interval);
      clearInterval(fadeInterval);
    };
  }, []);

  // Only render content on the client to avoid hydration mismatch
  if (!isClient) {
    return <div className="absolute inset-0 overflow-hidden"></div>;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Moonlight */}
      <motion.div
        className="absolute bg-primary rounded-full shadow-lg"
        style={{
          width: "150px",
          height: "150px",
          top: "10%",
          left: "10%",
          opacity: 0.5,
          filter: "blur(50px)",
        }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

<motion.div
        className="absolute bg-primary rounded-full shadow-lg"
        style={{
          width: "300px",
          height: "300px",
          bottom: "-150px",
          right: "-150px",
          opacity: 1,
          filter: "blur(50px)",
        }}
        animate={{ opacity: [0.2, 0.3, 0.2] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-primary rounded-full shadow-lg"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: `${star.y}%`,
            left: `${star.x}%`,
            opacity: star.opacity,
          }}
          animate={{ opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5] }}
          transition={{
            duration: Math.random() * 4 + 2, // Random duration between 2 and 6 seconds
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
};

export default ConstellationAnimation;