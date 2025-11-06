import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

/* ===============================
   1️⃣ ETAPA INICIAL – Mantenibilidad + Costo activados
================================= */
function Stage1() {
  const switches = ["Velocidad", "Mantenibilidad", "Costo"];
  const active = ["Mantenibilidad", "Costo"];

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-slate-900 text-white rounded-2xl shadow-lg h-[400px] justify-center">
      {switches.map((sw) => (
        <motion.div
          key={sw}
          animate={{
            backgroundColor: active.includes(sw) ? "#4ade80" : "#374151",
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-40 h-14 rounded-full flex items-center justify-between p-2"
        >
          <span className="ml-3">{sw}</span>
          <motion.div
            layout
            className={`w-8 h-8 rounded-full ${
              active.includes(sw) ? "bg-white" : "bg-gray-500"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ===============================
   2️⃣ ETAPA DE CONFLICTO – Velocidad encendida, otros tiemblan
================================= */
function Stage2() {
  const controls = useAnimation();

  useEffect(() => {
    const interval = setInterval(() => {
      controls.start({
        x: [0, -8, 8, -8, 8, 0],
        transition: { duration: 0.6 },
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [controls]);

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-slate-900 text-white rounded-2xl shadow-lg h-[400px] justify-center">
      <div className="w-40 h-14 bg-green-400 rounded-full flex items-center justify-between p-2">
        <span className="ml-3">Velocidad</span>
        <div className="w-8 h-8 bg-white rounded-full" />
      </div>

      <motion.div
        animate={controls}
        className="w-40 h-14 bg-green-400 rounded-full flex items-center justify-between p-2"
      >
        <span className="ml-3">Mantenibilidad</span>
        <div className="w-8 h-8 bg-white rounded-full" />
      </motion.div>

      <motion.div
        animate={controls}
        className="w-40 h-14 bg-green-400 rounded-full flex items-center justify-between p-2"
      >
        <span className="ml-3">Costo</span>
        <div className="w-8 h-8 bg-white rounded-full" />
      </motion.div>
    </div>
  );
}

/* ===============================
   3️⃣ ETAPA FINAL – Mantenibilidad cae
================================= */
function Stage3() {
  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-slate-900 text-white rounded-2xl shadow-lg overflow-hidden relative h-[400px] justify-center">
      {/* Velocidad */}
      <div className="w-40 h-14 bg-green-400 rounded-full flex items-center justify-between p-2 z-10">
        <span className="ml-3">Velocidad</span>
        <div className="w-8 h-8 bg-white rounded-full" />
      </div>

      {/* Mantenibilidad – cae */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 300, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeIn" }}
        className="w-40 h-14 bg-green-400 rounded-full flex items-center justify-between p-2 absolute top-1/3 z-0"
      >
        <span className="ml-3">Mantenibilidad</span>
        <div className="w-8 h-8 bg-white rounded-full" />
      </motion.div>

      {/* Costo */}
      <div className="w-40 h-14 bg-green-400 rounded-full flex items-center justify-between p-2 z-10">
        <span className="ml-3">Costo</span>
        <div className="w-8 h-8 bg-white rounded-full" />
      </div>
    </div>
  );
}

/* ===============================
   🎬 MAIN COMPONENT – cambia de etapa automáticamente
================================= */
export default function Main() {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const sequence = [
      { id: 1, duration: 3 },
      { id: 2, duration: 3 },
      { id: 3, duration: 3 },
    ];

    let total = 0;
    sequence.forEach((s) => {
      setTimeout(() => setStage(s.id), total * 1000);
      total += s.duration;
    });
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      {stage === 1 && <Stage1 />}
      {stage === 2 && <Stage2 />}
      {stage === 3 && <Stage3 />}
    </div>
  );
}
