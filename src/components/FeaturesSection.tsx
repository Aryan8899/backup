import { useEffect, useState } from "react";

const FeaturesSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    console.log(scrollPosition);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleMouseMove = (e: any) => {
      if (!isMobile) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setMousePosition({ x, y });
      }
    };

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    // Initial mobile check
    checkMobile();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-gray-950 to-black -z-50">
      {/* Rich, deep background base */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/30 via-transparent to-blue-950/30" />
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-950/20 via-transparent to-violet-950/20" />
      </div>

      {/* Dynamic aurora effect - Desktop only */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"
            style={{
              transform: `translateX(${mousePosition.x * -10}px)`,
              transition: "transform 0.5s ease-out",
            }}
          />
        </div>
      )}

      {/* Gradient spheres - Different for mobile/desktop */}
      <div className="relative w-full h-full">
        {isMobile ? (
          // Mobile version - Static centered spheres
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-sm aspect-square">
              {/* Static main sphere */}
              <div
                className="absolute inset-0 rounded-full
                bg-gradient-to-br from-purple-600/40 via-indigo-600/40 to-blue-600/40
                blur-3xl opacity-30 mix-blend-screen"
              />

              {/* Static secondary sphere */}
              <div
                className="absolute inset-0 translate-y-1/4 rounded-full
                bg-gradient-to-tl from-blue-600/40 via-violet-600/40 to-purple-600/40
                blur-3xl opacity-30 mix-blend-screen"
              />

              {/* Static ring */}
              <div
                className="absolute inset-0 rounded-full
                border border-purple-500/30 opacity-10 blur-sm"
              />
            </div>
          </div>
        ) : (
          // Desktop version - Original animated spheres
          <>
            {/* Primary sphere - top left */}
            <div
              className="absolute -left-32 -top-32 w-[40rem] h-[40rem] rounded-full opacity-30
                bg-gradient-to-br from-purple-600/40 via-indigo-600/40 to-blue-600/40
                blur-3xl animate-pulse mix-blend-screen"
              style={{
                transform: `translate(${mousePosition.x * -25}px, ${
                  mousePosition.y * -25
                }px)`,
                transition: "transform 0.3s ease-out",
              }}
            />

            {/* Secondary sphere - bottom right */}
            <div
              className="absolute -right-32 -bottom-32 w-[45rem] h-[45rem] rounded-full opacity-30
                bg-gradient-to-tl from-blue-600/40 via-violet-600/40 to-purple-600/40
                blur-3xl animate-pulse delay-150 mix-blend-screen"
              style={{
                transform: `translate(${mousePosition.x * 25}px, ${
                  mousePosition.y * 25
                }px)`,
                transition: "transform 0.3s ease-out",
              }}
            />

            {/* Floating accent sphere */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                w-96 h-96 rounded-full opacity-20
                bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500
                blur-3xl animate-pulse delay-300 mix-blend-screen"
              style={{
                transform: `translate(${mousePosition.x * 15}px, ${
                  mousePosition.y * 15
                }px)`,
                transition: "transform 0.4s ease-out",
              }}
            />

            {/* Dynamic accent rings */}
            <div
              className="absolute left-1/4 top-1/4 w-[30rem] h-[30rem] rounded-full opacity-10
                border border-purple-500/30 blur-sm"
              style={{
                transform: `scale(${
                  1 + Math.abs(mousePosition.x) * 0.1
                }) rotate(${mousePosition.x * 10}deg)`,
                transition: "transform 0.5s ease-out",
              }}
            />

            <div
              className="absolute right-1/4 bottom-1/4 w-[25rem] h-[25rem] rounded-full opacity-10
                border border-blue-500/30 blur-sm"
              style={{
                transform: `scale(${
                  1 + Math.abs(mousePosition.y) * 0.1
                }) rotate(${mousePosition.y * -10}deg)`,
                transition: "transform 0.5s ease-out",
              }}
            />
          </>
        )}
      </div>

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            filter: "contrast(200%) brightness(150%)",
          }}
        />
      </div>

      {/* Smooth vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black opacity-60" />
    </div>
  );
};

export default FeaturesSection;
