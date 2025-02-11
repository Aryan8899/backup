import React from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Text, Html } from "@react-three/drei";

// Bar data (height, color, and labels)
const barData = [
  { height: 8, color: "#007BFF", label: "65%", icon: "📧" },
  { height: 12, color: "#FF8C00", label: "100%", icon: "📊" },
  { height: 5, color: "#40C0FB", label: "40%", icon: "📋" },
  { height: 10, color: "#8A2BE2", label: "75%", icon: "➕" },
  { height: 6.5, color: "#20B2AA", label: "55%", icon: "⚠️" },
];

// 3D Bar Component
const Bar = ({ position, height, color, label, icon }: { position: [number, number, number]; height: number; color: string; label: string; icon: string }) => {
  return (
    <group>
      {/* Cubical 3D Bar */}
      <mesh position={position}>
        <boxGeometry args={[1.5, height, 1.5]} /> {/* Increased width & depth for a cube shape */}
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Floating Label Above Each Bar */}
      <Html position={[position[0], position[1] + height / 2 + 0.8, position[2]]} center>
        <div className="text-white font-bold text-xs">{label}</div>
      </Html>

      {/* Floating Icon Above Each Bar */}
      <Html position={[position[0], position[1] + height / 2 + 1.5, position[2]]} center>
        <div className="text-white text-lg">{icon}</div>
      </Html>
    </group>
  );
};

// Static Axes Component (3D Grid + Y Axis)
const Axes = () => {
  return (
    <>
      {/* X-Axis (Bottom) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[15, 0.1, 0.1]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Y-Axis (Vertical) */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[0.1, 10, 0.1]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Y-Axis Labels */}
      {[2, 4, 6, 8, 10].map((y) => (
        <Text key={y} position={[-1.5, y, 0]} fontSize={0.5} color="white">
          {y * 10}
        </Text>
      ))}
    </>
  );
};

const StaticIsometric3DBarChart: React.FC = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-gray-950">
      <Canvas>
        {/* Static Isometric Camera */}
        <PerspectiveCamera makeDefault position={[10, 12, 10]} fov={50} />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        {/* Static Grid & Axes */}
        <Axes />

        {/* 3D Bars with Labels and Icons */}
        {barData.map((bar, index) => (
          <Bar
            key={index}
            position={[index * 2 - 5, bar.height / 2, 0]}
            height={bar.height}
            color={bar.color}
            label={bar.label}
            icon={bar.icon}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default StaticIsometric3DBarChart;
