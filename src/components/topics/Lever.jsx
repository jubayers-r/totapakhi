import { useCallback, useEffect, useRef, useState } from 'react';
import { playClunk, ensureAudioContext } from '@/lib/sounds';

const MAX_ANGLE = 180;
const DRAG_SENSITIVITY = 280;

export default function Lever({ onSpin, disabled }) {
  const armRef = useRef(null);
  const knobRef = useRef(null);
  const hintRef = useRef(null);

  const dragRef = useRef({ isDragging: false, startY: 0, currentAngle: 0, hasMoved: false });
  const [hintShown, setHintShown] = useState(true);

  useEffect(() => {
    const arm = armRef.current;
    if (!arm) return;
    arm.classList.add('hint');
    const onAnimationEnd = () => arm.classList.remove('hint');
    arm.addEventListener('animationend', onAnimationEnd, { once: true });
    return () => arm.removeEventListener('animationend', onAnimationEnd);
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      const arm = armRef.current;
      const knob = knobRef.current;
      if (!arm || !knob) return;
      if (disabled) return;

      e.preventDefault();
      try {
        knob.setPointerCapture(e.pointerId);
      } catch {
        // ignore capture failures
      }
      const drag = dragRef.current;
      drag.isDragging = true;
      drag.hasMoved = false;
      drag.startY = e.clientY;
      drag.currentAngle = 0;

      arm.classList.add('grabbing');
      arm.classList.remove('hint', 'spring-back');
      arm.style.transition = '';
      if (hintRef.current) hintRef.current.classList.add('hidden');
      setHintShown(false);

      ensureAudioContext();
    },
    [disabled]
  );

  const handlePointerMove = useCallback((e) => {
    const arm = armRef.current;
    const knob = knobRef.current;
    const drag = dragRef.current;
    if (!arm || !knob || !drag.isDragging) return;

    const deltaY = Math.max(0, e.clientY - drag.startY);
    if (deltaY > 3) drag.hasMoved = true;
    drag.currentAngle = Math.min(deltaY * (MAX_ANGLE / DRAG_SENSITIVITY), MAX_ANGLE);

    arm.style.transform = `rotate(${drag.currentAngle}deg)`;

    const progress = drag.currentAngle / MAX_ANGLE;
    const shadowBlur = 6 + progress * 14;
    const shadowY = 2 + progress * 6;
    knob.style.boxShadow = `0 ${shadowY}px ${shadowBlur}px rgba(26, 60, 52, ${0.2 + progress * 0.2})`;
  }, []);

  const handleRelease = useCallback(() => {
    const arm = armRef.current;
    const knob = knobRef.current;
    const drag = dragRef.current;
    if (!arm || !knob || !drag.isDragging) return;
    drag.isDragging = false;
    arm.classList.remove('grabbing');

    const normalizedPull = drag.currentAngle / MAX_ANGLE;

    knob.style.boxShadow = '';
    arm.classList.add('spring-back');
    arm.style.transform = 'rotate(0deg)';
    window.setTimeout(() => {
      arm.classList.remove('spring-back');
    }, 600);

    if (drag.hasMoved || drag.currentAngle > 0) {
      playClunk();
      const mappedVelocity = 20 + Math.min(normalizedPull, 1) * 35;
      onSpin?.(mappedVelocity);
    } else {
      playClunk();
      onSpin?.(25);
    }

    drag.currentAngle = 0;
    drag.hasMoved = false;
  }, [onSpin]);

  useEffect(() => {
    const handleGlobalUp = () => {
      const drag = dragRef.current;
      if (drag.isDragging) handleRelease();
    };
    document.addEventListener('pointerup', handleGlobalUp);
    return () => document.removeEventListener('pointerup', handleGlobalUp);
  }, [handleRelease]);

  return (
    <>
      <div
        ref={hintRef}
        className={`tp-pull-hint -rotate-12 font-[cursive] text-xl font-extrabold text-[#518174] ${hintShown ? '' : 'tp-hidden'}`}
      >
        pull lever
      </div>
      <div
        ref={armRef}
        className={`tp-handle-arm ${disabled ? 'disabled' : ''}`}
        aria-hidden="true"
      >
        <div
          ref={knobRef}
          className="tp-handle-knob cursor-grab touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handleRelease}
          onPointerCancel={handleRelease}
          role="button"
          tabIndex={-1}
          aria-label="টপিক নিতে লিভার টানুন"
        >
          <div className="tp-handle-knob-grip" />
        </div>
        <div className="tp-handle-shaft" />
      </div>
      <div className="tp-handle-pivot" />
    </>
  );
}