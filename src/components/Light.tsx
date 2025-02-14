import  { useEffect, useState } from "react";

const PremiumLightBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    console.log(scrollPosition)
    const handleMouseMove = (e: any) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-slate-50 to-white">
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
              radial-gradient(circle at ${50 + mousePosition.x * 10}% ${
              50 + mousePosition.y * 10
            }%, rgba(139, 92, 246, 0.15), transparent 40%),
              radial-gradient(circle at ${40 - mousePosition.x * 15}% ${
              60 - mousePosition.y * 15
            }%, rgba(59, 130, 246, 0.15), transparent 30%),
              radial-gradient(circle at ${60 + mousePosition.y * 12}% ${
              40 + mousePosition.x * 12
            }%, rgba(147, 51, 234, 0.15), transparent 35%)
            `,
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
            transform: `translate(${mousePosition.x * -30}px, ${
              mousePosition.y * -30
            }px) rotate(${mousePosition.x * 5}deg)`,
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Dynamic neon accent spheres */}
        <div
          className="absolute right-0 top-0 w-[40rem] h-[40rem] rounded-full opacity-30
            bg-gradient-to-l from-purple-400 via-violet-400 to-transparent
            blur-3xl mix-blend-soft-light"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${
              mousePosition.y * 20
            }px)`,
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Interactive neon elements */}
        <div className="absolute inset-0">
          {/* Floating neon lines */}
          <div className="absolute inset-0">
            <div
              className="absolute left-1/4 top-1/4 w-64 h-1 bg-gradient-to-r from-blue-400 to-violet-400 opacity-20 blur-sm"
              style={{
                transform: `rotate(${45 + mousePosition.x * 10}deg) scale(${
                  1 + Math.abs(mousePosition.y) * 0.1
                })`,
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <div
              className="absolute right-1/4 bottom-1/4 w-64 h-1 bg-gradient-to-r from-violet-400 to-purple-400 opacity-20 blur-sm"
              style={{
                transform: `rotate(${-45 + mousePosition.y * 10}deg) scale(${
                  1 + Math.abs(mousePosition.x) * 0.1
                })`,
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* Premium glass cards */}
          <div
            className="absolute left-1/3 top-1/3 w-48 h-48 rounded-3xl
              bg-gradient-to-br from-white/80 to-white/40
              backdrop-blur-xl shadow-2xl
              border border-white/50"
            style={{
              transform: `translate(${mousePosition.x * 15}px, ${
                mousePosition.y * 15
              }px) rotate(${mousePosition.x * 8}deg)`,
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-violet-400/10 rounded-3xl" />
          </div>

          <div
            className="absolute right-1/3 bottom-1/3 w-40 h-40 rounded-3xl
              bg-gradient-to-tl from-white/80 to-white/40
              backdrop-blur-xl shadow-2xl
              border border-white/50"
            style={{
              transform: `translate(${mousePosition.x * -15}px, ${
                mousePosition.y * -15
              }px) rotate(${mousePosition.y * -8}deg)`,
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
              radial-gradient(circle at ${60 + mousePosition.x * 40}% ${
              40 + mousePosition.y * 40
            }%, #818cf8 0%, transparent 30%),
              radial-gradient(circle at ${40 - mousePosition.x * 40}% ${
              60 - mousePosition.y * 40
            }%, #6366f1 0%, transparent 30%),
              radial-gradient(circle at ${50 + mousePosition.y * 40}% ${
              50 + mousePosition.x * 40
            }%, #a78bfa 0%, transparent 30%)
            `,
            transition: "background-position 0.3s ease-out",
          }}
        />

        {/* Premium grain texture */}
        <div
          className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            filter: "contrast(150%) brightness(150%)",
          }}
        />
      </div>

      {/* Smooth color blend vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent opacity-40" />
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <>
      <PremiumLightBackground />
      <div className="relative z-10">{/* Your content goes here */}</div>
    </>
  );
};

export default FeaturesSection;
