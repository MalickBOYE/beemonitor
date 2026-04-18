import React, { useState, useEffect } from 'react';

const backgroundImages = [
  "/images/bg1.png", "/images/bg2.png", "/images/bg3.png", "/images/bg4.png", "/images/bg5.png",
  "/images/bg6.png", "/images/bg7.png", "/images/bg8.png", "/images/bg9.png", "/images/bg10.png",
  "/images/bg11.png", "/images/bg12.png", "/images/bg13.png", "/images/bg14.png", "/images/bg15.png"
];

export default function BackgroundSlider() {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <img 
        src={backgroundImages[bgIndex]} 
        className="w-full h-full object-cover opacity-10 transition-opacity duration-1000" 
        alt="Bee Background" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
    </div>
  );
}