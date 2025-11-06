import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import "./styles.css";

const BLUE_ON = "#278AB0";
const GRAY_OFF = "#C9CDD2"; // gris suave

// Dimensiones del switch (alargado)
const TRACK_W = 260;
const TRACK_H = 56;
const PADDING = 6;
const KNOB = TRACK_H - PADDING * 2; // 44px
const LEFT_X = PADDING;
const RIGHT_X = TRACK_W - PADDING - KNOB;

function AnimatedSwitch({ label, isOn, onToggle, disabled, shake = false }) {
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
          ? { x: [0, -6, 6, -6, 6, 0] }
          : { x: 0 }
      }
      transition={
        shake
          ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 200, damping: 18 }
      }
    >
      {label && <div className="sw-label">{label}</div>}

      <motion.div
        className="sw-track"
        style={{ width: TRACK_W, height: TRACK_H }}
        animate={{
          backgroundColor: isOn ? BLUE_ON : GRAY_OFF,
          boxShadow: isOn
            ? "inset 0 2px 4px rgba(0,0,0,0.15), 0 8px 18px rgba(39,138,176,0.45)"
            : "inset 0 2px 4px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.15)",
          borderColor: "#FFFFFF",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        role="switch"
        aria-checked={isOn}
        tabIndex={0}
        onClick={() => !disabled && onToggle(!isOn)}
        onKeyDown={handleKey}
      >
        <motion.div
          className="sw-knob"
          style={{ width: KNOB, height: KNOB }}
          animate={{
            x: isOn ? RIGHT_X : LEFT_X,
            backgroundColor: "#FFFFFF",
            boxShadow: isOn
              ? "0 6px 14px rgba(39,138,176,0.35), inset 0 0 0 2px rgba(255,255,255,0.9)"
              : "0 4px 10px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.9)",
          }}
          transition={{ type: "spring", stiffness: 340, damping: 22 }}
          whileTap={{ scale: 0.96 }}
        />

        {/* Reborde blanco del track */}
        <div className="sw-border" />
      </motion.div>
    </motion.div>
  );
}

export default function Switches() {
  // 1: Inicial (Bajo Coste + Mantenible ON, Rápido OFF)
  // 2: Forzar Rápido ON, los otros tiemblan
  // 3: Caída de Mantenible (OFF)
  const [stage, setStage] = useState(1);
  const [state, setState] = useState({
    Rapido: false,
    Mantenible: true,
    BajoCoste: true,
  });

  // Derivar props por stage
  const propsByLabel = useMemo(() => {
    return {
      Rapido: { isOn: state.Rapido, shake: false },
      Mantenible: { isOn: state.Mantenible, shake: stage === 2 },
      BajoCoste: { isOn: state.BajoCoste, shake: stage === 2 },
    };
  }, [state, stage]);

  // Avance automático: a stage 2 pronto y a stage 3 tras ~10s
  useEffect(() => {
    if (stage === 1) {
      const t = setTimeout(() => {
        setStage(2);
        setState((s) => ({ ...s, Rapido: true }));
      }, 1000);
      return () => clearTimeout(t);
    }
    if (stage === 2) {
      const t = setTimeout(() => {
        // pasar a 3, caer Mantenible
        setStage(3);
        setState((s) => ({ ...s, Mantenible: false }));
      }, 10000);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const next = () => {
    if (stage === 1) {
      setStage(2);
      setState((s) => ({ ...s, Rapido: true }));
    } else if (stage === 2) {
      setStage(3);
      setState((s) => ({ ...s, Mantenible: false }));
    }
  };

  const reset = () => {
    setStage(1);
    setState({ Rapido: false, Mantenible: true, BajoCoste: true });
  };

  const disabled = true; // deshabilitar toggles manuales para respetar la secuencia

  return (
    <div className="sw-sequence">
      <div className="sw-vertical">
        {/* Rápido Desarrollo */}
        <AnimatedSwitch
          label="Rápido Desarrollo"
          isOn={propsByLabel.Rapido.isOn}
          onToggle={() => {}}
          disabled={disabled}
        />

        {/* Mantenible (puede caer en stage 3) */}
        <motion.div
          initial={false}
          animate={
            stage === 3
              ? { y: 140, opacity: 0 }
              : { y: 0, opacity: 1 }
          }
          transition={{ duration: 1.1, ease: "easeIn" }}
        >
          <AnimatedSwitch
            label="Mantenible"
            isOn={propsByLabel.Mantenible.isOn}
            shake={propsByLabel.Mantenible.shake}
            onToggle={() => {}}
            disabled={disabled}
          />
        </motion.div>

        {/* Bajo Coste */}
        <AnimatedSwitch
          label="Bajo Coste"
          isOn={propsByLabel.BajoCoste.isOn}
          shake={propsByLabel.BajoCoste.shake}
          onToggle={() => {}}
          disabled={disabled}
        />
      </div>

      <div className="fab-wrap">
        {stage < 3 ? (
          <button className="fab" onClick={next} aria-label="Avanzar secuencia">
            Avanzar
          </button>
        ) : (
          <button className="fab" onClick={reset} aria-label="Reiniciar secuencia">
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
}
