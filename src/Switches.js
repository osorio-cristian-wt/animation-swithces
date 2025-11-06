import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import "./styles.css";

const BLUE_ON = "#278AB0";
const GRAY_OFF = "#C9CDD2"; // gris suave

// Dimensiones del switch (alargado y VERTICAL)
const TRACK_W = 56;
const TRACK_H = 260;
const PADDING = 6;
const KNOB = TRACK_W - PADDING * 2; // diámetro del knob (44px)
const TOP_Y = 0; // isOn
const BOTTOM_Y = TRACK_H - PADDING * 2 - KNOB; // isOff

function AnimatedSwitch({ label, isOn, onToggle, disabled, shake = false, shakeStrong = false }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!disabled) onToggle(!isOn);
      }
    },
    [isOn, onToggle, disabled]
  );

  return (
    <motion.div
      className="sw-item"
      animate={
        shake
          ? { x: [0, -(shakeStrong ? 10 : 6), (shakeStrong ? 10 : 6), -(shakeStrong ? 10 : 6), (shakeStrong ? 10 : 6), 0] }
          : { x: 0 }
      }
      transition={
        shake
          ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 200, damping: 18 }
      }
    >
      <motion.div
        className="sw-track sw-track-vertical"
        style={{ width: TRACK_W, height: TRACK_H }}
        animate={
          shake
            ? { backgroundColor: [isOn ? BLUE_ON : GRAY_OFF, "#B22222", isOn ? BLUE_ON : GRAY_OFF] }
            : { backgroundColor: isOn ? BLUE_ON : GRAY_OFF }
        }
        transition={{
          backgroundColor: shake
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 260, damping: 24 }
        }}
        role="switch"
        aria-checked={isOn}
        tabIndex={0}
        onClick={() => !disabled && onToggle(!isOn)}
        onKeyDown={handleKey}
      >
        <motion.div
          className="sw-knob sw-knob-vertical"
          style={{ width: KNOB, height: KNOB }}
          animate={{
            y: isOn ? TOP_Y : BOTTOM_Y,
            backgroundColor: "#FFFFFF",
            boxShadow: "none",
          }}
          transition={{ type: "spring", stiffness: 340, damping: 22 }}
          whileTap={{ scale: 0.96 }}
        />

        {/* Reborde blanco del track */}
        <div className="sw-border" />
      </motion.div>
      {label && <div className="sw-label sw-label-bottom">{label}</div>}
    </motion.div>
  );
}

// Definimos keys ESTABLES y labels editables desde una sola fuente
const SWITCHES = [
  { key: "BajoCoste", label: "Bajo Coste" },
  { key: "Mantenible", label: "Mantenible" },
  { key: "Rapido", label: "Entrega Rápida" },
];

export default function Switches() {
  // Estado inicial: todo apagado
  const [stage, setStage] = useState(1); // no se usa para UI
  const [state, setState] = useState(
    SWITCHES.reduce((acc, s) => ({ ...acc, [s.key]: false }), {})
  );
  const [order, setOrder] = useState([]); // orden de encendidos actuales
  const [allShake, setAllShake] = useState(false);
  const [forcingKey, setForcingKey] = useState(null);
  const forceRef = useRef(null);
  const offRef = useRef(null);

  // utilidades
  const clearTimers = () => {
    if (forceRef.current) { clearTimeout(forceRef.current); forceRef.current = null; }
    if (offRef.current) { clearTimeout(offRef.current); offRef.current = null; }
  };

  const onToggle = (key) => {
    // Si está en forzado, ignorar interacción sobre ese mismo switch
    if (forcingKey === key) return;

    const isOn = state[key];
    const onCount = Object.values(state).filter(Boolean).length;

    if (!isOn) {
      // Intento de encender
      if (onCount === 2) {
        // es el último -> cuesta prenderse
        setForcingKey(key);
        forceRef.current && clearTimeout(forceRef.current);
        // temblar fuerte el último
        forceRef.current = setTimeout(() => {
          setState((s) => ({ ...s, [key]: true }));
          setForcingKey(null);
          // registrar orden si no está
          setOrder((prev) => (prev.includes(key) ? prev : [...prev, key]));
          // ahora los tres están ON -> tiembla todo y programar apagado del primero
          setAllShake(true);
          setOrder((prev) => {
            const first = prev[0] || key;
            offRef.current && clearTimeout(offRef.current);
            offRef.current = setTimeout(() => {
              setState((s) => ({ ...s, [first]: false }));
              setAllShake(false);
              setOrder((p) => p.filter((k) => k !== first));
            }, 15000);
            return prev;
          });
        }, 1200);
        return;
      }

      // encendido normal
      setState((s) => ({ ...s, [key]: true }));
      setOrder((prev) => (prev.includes(key) ? prev : [...prev, key]));
    } else {
      // Apagar manual cancela forzados/temblores/timers
      clearTimers();
      setAllShake(false);
      setForcingKey(null);
      setState((s) => ({ ...s, [key]: false }));
      setOrder((prev) => prev.filter((k) => k !== key));
    }
  };

  // shakes por elemento
  const propsByLabel = useMemo(() => {
    const base = Object.fromEntries(
      SWITCHES.map(({ key }) => [key, { isOn: state[key], shake: false, shakeStrong: false }])
    );
    if (allShake) {
      Object.keys(base).forEach((k) => (base[k].shake = true));
    }
    if (forcingKey) {
      base[forcingKey].shake = true;
      base[forcingKey].shakeStrong = true;
    }
    return base;
  }, [state, allShake, forcingKey]);

  // Botones auxiliares
  const next = () => {
    // 1) Si hay forzado activo, completar de inmediato
    if (forcingKey) {
      if (forceRef.current) {
        clearTimeout(forceRef.current);
        forceRef.current = null;
      }
      setState((s) => ({ ...s, [forcingKey]: true }));
      setOrder((prev) => (prev.includes(forcingKey) ? prev : [...prev, forcingKey]));
      setForcingKey(null);
      setAllShake(true);
    }

    // 2) Si hay tres ON, apagar inmediatamente el primero (sin esperar)
    const onKeys = Object.entries(state).filter(([, v]) => v).map(([k]) => k);
    if (onKeys.length === 3) {
      const first = order[0];
      if (first) {
        offRef.current && clearTimeout(offRef.current);
        setState((s) => ({ ...s, [first]: false }));
        setAllShake(false);
        setOrder((p) => p.filter((k) => k !== first));
      }
    }
  };

  const reset = () => {
    clearTimers();
    setAllShake(false);
    setForcingKey(null);
    setOrder([]);
    setState({ Rapido: false, Mantenible: false, BajoCoste: false });
  };

  return (
    <div className="sw-sequence">
      <div className="sw-columns">
        {SWITCHES.map(({ key, label }) => (
          <AnimatedSwitch
            key={key}
            label={label}
            isOn={propsByLabel[key].isOn}
            shake={propsByLabel[key].shake}
            shakeStrong={propsByLabel[key].shakeStrong}
            onToggle={() => onToggle(key)}
            disabled={false}
          />
        ))}
      </div>

      <div className="fab-wrap">
        <button className="fab" onClick={next} aria-label="Avanzar">
          Avanzar
        </button>
        &nbsp;
        <button className="fab" onClick={reset} aria-label="Reiniciar">
          Reiniciar
        </button>
      </div>
    </div>
  );
}
