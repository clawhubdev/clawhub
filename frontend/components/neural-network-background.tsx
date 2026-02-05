'use client';

import { useEffect, useState } from 'react';

export function NeuralNetworkBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(255, 0, 255, 0.1) 0%, transparent 40%)
            `,
            animation: 'pulse 8s ease-in-out infinite',
          }}
        />
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: [
                  'rgba(255, 107, 53, 0.6)',
                  'rgba(0, 255, 255, 0.6)',
                  'rgba(255, 0, 255, 0.6)',
                  'rgba(0, 255, 136, 0.6)',
                ][Math.floor(Math.random() * 4)],
                boxShadow: `0 0 ${Math.random() * 20 + 10}px currentColor`,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(255, 107, 53, 0.05) 25%, rgba(255, 107, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(255, 107, 53, 0.05) 25%, rgba(255, 107, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite',
          }}
        />
      </div>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0) translateX(-10px); }
          75% { transform: translateY(20px) translateX(5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}
