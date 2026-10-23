import { playAlarm, playClick, playStartChime } from '@/lib/sounds';
import { Pause, Play, RotateCcw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const CIRCUMFERENCE = 2 * Math.PI * 115;

export interface TimerPanelProps {
  topic?: string | null;
  initialDuration?: number;
}

export default function TimerPanel({ topic, initialDuration = 60 }: TimerPanelProps) {
  const [remaining, setRemaining] = useState(initialDuration);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const totalRef = useRef(initialDuration);
  const minuteRef = useRef<HTMLSpanElement>(null);
  const secondRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (minuteRef.current)
      minuteRef.current.textContent = String(Math.floor(remaining / 60));
    if (secondRef.current) {
      const secs = remaining % 60;
      secondRef.current.textContent = secs < 10 ? '0' + secs : String(secs);
    }
    if (ringRef.current) {
      const progress = totalRef.current > 0 ? remaining / totalRef.current : 0;
      ringRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
    }
  }, [remaining, running]);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setRemaining((previous) => {
        const next = previous - 1;
        if (next <= 0) {
          window.clearInterval(id);
          setRunning(false);
          setFinished(true);
          playAlarm();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function parseTimeFromDisplay() {
    const mins = Math.max(
      0,
      Math.min(99, parseInt(minuteRef.current?.textContent || '0', 10) || 0)
    );
    const secs = Math.max(
      0,
      Math.min(59, parseInt(secondRef.current?.textContent || '0', 10) || 0)
    );
    return mins * 60 + secs;
  }

  function handleDigitKeydown(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
      return;
    }
    if (
      [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Home',
        'End',
      ].includes(e.key)
    )
      return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  function handleDigitBlur() {
    const seconds = parseTimeFromDisplay();
    totalRef.current = Math.max(1, seconds);
    setRemaining(seconds);
  }

  function handleDigitFocus(e: React.FocusEvent<HTMLSpanElement>) {
    const range = document.createRange();
    range.selectNodeContents(e.target as Node);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLSpanElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const digits = text.replace(/\D/g, '');
    document.execCommand('insertText', false, digits);
  }

  function updatePendingEdit() {
    const edited = parseTimeFromDisplay();
    if (edited !== remaining) {
      totalRef.current = Math.max(totalRef.current, edited);
      setRemaining(edited);
    }
  }

  function doPlay() {
    if (finished) {
      doReset();
      return;
    }
    if (running) {
      setRunning(false);
      return;
    }
    updatePendingEdit();
    if (parseTimeFromDisplay() > 0) {
      playStartChime();
      setRunning(true);
    }
  }

  function doReset() {
    setRunning(false);
    setFinished(false);
    totalRef.current = initialDuration;
    setRemaining(initialDuration);
  }

  const digitsEditable = !running && !finished;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 max-md:gap-3 pt-2">
      <div className="flex min-h-[44px] items-center justify-center">
        {topic && (
          <div className="text-center">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[#81928a] max-md:text-[0.6rem] max-md:mb-0.5">
              যা যা নিয়ে কথা বলবেন
            </div>
            <div className="font-display text-xl font-bold text-[#1a3c34] max-md:text-lg">
              {topic}
            </div>
          </div>
        )}
      </div>

      <div
        className={`relative h-[425px] w-[425px] max-w-[88vw] transition-all sm:h-[500px] sm:w-[500px] max-md:h-[min(78vw,46vh)] max-md:w-[min(78vw,46vh)] ${running ? '' : ''}`}
      >
        <svg className="h-full w-full -rotate-90" viewBox="0 0 260 260">
          <circle className="tp-ring-track" cx="130" cy="130" r="115" />
          <circle
            ref={ringRef}
            className={`tp-ring-progress ${finished ? 'finished' : ''}`}
            cx="130"
            cy="130"
            r="115"
          />
        </svg>

        <div
          className={`tp-time-display absolute left-1/2 flex -translate-x-1/2 items-baseline font-display leading-none text-[#1a3c34] text-[3.5rem] sm:text-7xl max-md:text-[clamp(2rem,14vw,3.5rem)] ${
            running ? 'top-1/2 -translate-y-1/2' : 'top-[42%]'
          } ${finished ? 'finished' : ''}`}
        >
          <span
            ref={minuteRef}
            key="min"
            className={`tp-time-digit ${digitsEditable ? 'editable' : ''}`}
            contentEditable={digitsEditable}
            suppressContentEditableWarning
            onKeyDown={handleDigitKeydown}
            onBlur={handleDigitBlur}
            onFocus={handleDigitFocus}
            onPaste={handlePaste}
            spellCheck={false}
          >
            {Math.floor(remaining / 60)}
          </span>
          <span className="tp-time-colon select-none">:</span>
          <span
            ref={secondRef}
            key="sec"
            className={`tp-time-digit ${digitsEditable ? 'editable' : ''}`}
            contentEditable={digitsEditable}
            suppressContentEditableWarning
            onKeyDown={handleDigitKeydown}
            onBlur={handleDigitBlur}
            onFocus={handleDigitFocus}
            onPaste={handlePaste}
            spellCheck={false}
          >
            {String(remaining % 60).padStart(2, '0')}
          </span>
        </div>

        <div
          className={`absolute left-1/2 top-[58%] flex -translate-x-1/2 gap-4 max-md:gap-2 transition-opacity ${running ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          <button
            type="button"
            disabled={running}
            onClick={() => {
              playClick();
              const current = parseTimeFromDisplay();
              const newTotal = Math.max(1, totalRef.current - 30);
              const diff = totalRef.current - newTotal;
              totalRef.current = newTotal;
              setRemaining(Math.max(1, current - diff));
            }}
            className="cursor-pointer rounded-full border-2 border-[#1a3c34] px-6 py-2.5 font-display text-lg font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb] disabled:cursor-not-allowed disabled:opacity-35 max-md:border max-md:px-3.5 max-md:py-1.5 max-md:text-sm"
          >
            −0:30
          </button>
          <button
            type="button"
            disabled={running}
            onClick={() => {
              playClick();
              totalRef.current = parseTimeFromDisplay() + 30;
              setRemaining(totalRef.current);
            }}
            className="cursor-pointer rounded-full border-2 border-[#1a3c34] px-6 py-2.5 font-display text-lg font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb] disabled:cursor-not-allowed disabled:opacity-35 max-md:border max-md:px-3.5 max-md:py-1.5 max-md:text-sm"
          >
            +0:30
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 max-md:gap-4">
        <button
          type="button"
          title={running ? 'বিরতি' : finished ? 'আবার শুরু' : 'শুরু'}
          onClick={doPlay}
          className="flex size-[76px] items-center justify-center rounded-full bg-gradient-to-br from-[#d4c0f9] to-[#b89ee8] shadow-[0_4px_12px_rgba(184,158,232,0.4)] transition-transform hover:scale-105 active:scale-95 sm:size-[76px] max-md:size-[64px]"
        >
          {running ? (
            <Pause className="size-8 fill-[#f9f5eb] text-[#f9f5eb] max-md:size-7" />
          ) : (
            <Play className="ml-1 size-8 fill-[#f9f5eb] text-[#f9f5eb] max-md:size-7" />
          )}
        </button>
        <button
          type="button"
          title="রিসেট"
          onClick={() => {
            playClick();
            doReset();
          }}
          className="group flex size-14 items-center justify-center rounded-full border-2 border-[#1a3c34] bg-transparent transition-colors hover:bg-[#1a3c34] max-md:size-12"
        >
          <RotateCcw className="size-6 text-[#1a3c34] transition-colors group-hover:text-[#f9f5eb] max-md:size-5" />
        </button>
      </div>

      <p className="text-center text-xs font-semibold text-[#81928a] max-md:text-[0.7rem]">
        {running && '⏱ চলছে…'}
        {finished && '🕐 সময় শেষ! আবার শুনুন — আবার চেষ্টা করুন।'}
        {!running &&
          !finished &&
          'সময় বাড়াতে ঘড়ির সংখ্যা ক্লিক করে বদলান, অথবা ±0:30 ব্যবহার করুন।'}
      </p>
    </div>
  );
}
