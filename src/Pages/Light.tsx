import { useEffect, useState } from "react";

const Light = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setMousePosition({ x, y });
      }
    };

    checkMobile();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile]);

  // Very simple static mobile version
  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-white">
        {/* Simple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        
        {/* Static centered cards */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 flex flex-col items-center">
          {/* Top card */}
          <div className="w-64 h-64 rounded-3xl bg-white shadow-lg border border-slate-200">
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50" />
          </div>
          
          {/* Bottom card */}
          <div className="w-56 h-56 -mt-32 rounded-3xl bg-white shadow-lg border border-slate-200">
            <div className="w-full h-full rounded-3xl bg-gradient-to-tl from-violet-50 to-purple-50" />
          </div>
        </div>
      </div>
    );
  }

  // Desktop version remains unchanged with all animations
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden bg-gradient-to-b from-slate-50 to-white -z-50">
      {/* Rest of your desktop code remains exactly the same */}
      {/* Premium layered background */}
      <div className="absolute inset-0">
        {/* Base gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-50 via-white to-blue-50 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-bl from-cyan-50 via-white to-purple-50 opacity-60" />

        {/* Animated neon glow effects */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, rgba(139, 92, 246, 0.15), transparent 40%),
              radial-gradient(circle at ${40 - mousePosition.x * 15}% ${60 - mousePosition.y * 15}%, rgba(59, 130, 246, 0.15), transparent 30%),
              radial-gradient(circle at ${60 + mousePosition.y * 12}% ${40 + mousePosition.x * 12}%, rgba(147, 51, 234, 0.15), transparent 35%)
            `
          }}
        />
      </div>

      {/* Premium design elements */}
      <div className="relative w-full h-full">
        {/* Large floating neon ring */}
        <div
          className="absolute -left-96 -top-96 w-[80rem] h-[80rem] rounded-full opacity-20
            bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400
            blur-3xl mix-blend-soft-light"
          style={{
            transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px) rotate(${mousePosition.x * 5}deg)`,
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />

        {/* Dynamic neon accent spheres */}
        <div
          className="absolute right-0 top-0 w-[40rem] h-[40rem] rounded-full opacity-30
            bg-gradient-to-l from-purple-400 via-violet-400 to-transparent
            blur-3xl mix-blend-soft-light"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />

        {/* Interactive neon elements */}
        <div className="absolute inset-0">
          {/* Floating neon lines */}
          <div className="absolute inset-0">
            <div
              className="absolute left-1/4 top-1/4 w-64 h-1 bg-gradient-to-r from-blue-400 to-violet-400 opacity-20 blur-sm"
              style={{
                transform: `rotate(${45 + mousePosition.x * 10}deg) scale(${1 + Math.abs(mousePosition.y) * 0.1})`,
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            />
            <div
              className="absolute right-1/4 bottom-1/4 w-64 h-1 bg-gradient-to-r from-violet-400 to-purple-400 opacity-20 blur-sm"
              style={{
                transform: `rotate(${-45 + mousePosition.y * 10}deg) scale(${1 + Math.abs(mousePosition.x) * 0.1})`,
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            />
          </div>

          {/* Premium glass cards */}
          <div
            className="absolute left-1/3 top-1/3 w-48 h-48 rounded-3xl
              bg-gradient-to-br from-white/80 to-white/40
              backdrop-blur-xl shadow-2xl border border-white/50"
            style={{
              transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px) rotate(${mousePosition.x * 8}deg)`,
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-violet-400/10 rounded-3xl" />
          </div>

          <div
            className="absolute right-1/3 bottom-1/3 w-40 h-40 rounded-3xl
              bg-gradient-to-tl from-white/80 to-white/40
              backdrop-blur-xl shadow-2xl border border-white/50"
            style={{
              transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px) rotate(${mousePosition.y * -8}deg)`,
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tl from-violet-400/10 to-purple-400/10 rounded-3xl" />
          </div>
        </div>

        {/* Animated mesh gradient */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at ${60 + mousePosition.x * 40}% ${40 + mousePosition.y * 40}%, #818cf8 0%, transparent 30%),
              radial-gradient(circle at ${40 - mousePosition.x * 40}% ${60 - mousePosition.y * 40}%, #6366f1 0%, transparent 30%),
              radial-gradient(circle at ${50 + mousePosition.y * 40}% ${50 + mousePosition.x * 40}%, #a78bfa 0%, transparent 30%)
            `,
            transition: "background-position 0.3s ease-out"
          }}
        />
      </div>
    </div>
  );
};

export default Light;