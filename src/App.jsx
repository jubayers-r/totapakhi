import InterviewPanel from '@/components/interview/InterviewPanel';
import TimerPanel from '@/components/timer/TimerPanel';
import TopicsPanel from '@/components/topics/TopicsPanel';
import { usePersistence } from '@/hooks/usePersistence';
import { useState } from 'react';

export default function App() {
  const [mode, setMode] = usePersistence('impromptu-mode', 'topics');
  const [timerTopic, setTimerTopic] = useState(null);
  const [timerKey, setTimerKey] = useState(0);

  function goTo(m) {
    setMode(m);
  }

  function startTimer(topic) {
    setTimerTopic(topic ?? null);
    setTimerKey((k) => k + 1);
    setMode('timer');
  }

  const tabs = [
    { id: 'topics', label: 'Random Topics' },
    { id: 'interview', label: 'Interview Prep' },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f9f5eb] text-[#1a3c34]">
      {/* fixed tab bar, original style */}
      <div className="fixed top-4 left-1/2 z-15 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-[50px] bg-[rgba(26,60,52,0.08)] p-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => goTo(tab.id)}
            className={`relative whitespace-nowrap rounded-[50px] px-7 py-[0.6rem] font-sans text-[1.05rem] font-semibold transition-colors ${
              mode === tab.id
                ? 'bg-[#f9f5eb] text-[#1a3c34] shadow-[0_2px_6px_rgba(26,60,52,0.14)]'
                : 'bg-transparent text-[#1a3c34] hover:bg-[rgba(26,60,52,0.06)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* copyright badge, same as original top-right */}
      <a
        href="https://www.instagram.com/babystepstothemic/?hl=en"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Baby Steps to the Mic ©"
      >
        <img
          src="/brand-badge.png"
          alt="Baby Steps to the Mic ©"
          className="fixed right-1.5 top-4 z-10 hidden h-auto w-[330px] max-w-[26vw] opacity-80 md:block"
        />
      </a>

      {/* copyright badge, mobile (inline at bottom, like the original) */}
      <a
        href="https://www.instagram.com/babystepstothemic/?hl=en"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Baby Steps to the Mic ©"
        className="mx-auto mt-6 block w-[180px] opacity-80 md:hidden"
      >
        <img
          src="/brand-badge.png"
          alt="Baby Steps to the Mic ©"
          className="w-full max-w-[180px] max-[480px]:max-w-[120px]"
        />
      </a>

      {mode === 'topics' && <TopicsPanel onStartTimer={startTimer} />}
      {mode === 'interview' && (
        <InterviewPanel onBack={() => setMode('topics')} />
      )}
      {mode === 'timer' && (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-16">
          <button
            onClick={() => setMode('topics')}
            className="mb-4 cursor-pointer rounded-full border-2 border-[#1a3c34] bg-transparent px-6 py-2 font-display text-lg font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb]"
          >
            ← র‍্যান্ডম টপিক
          </button>
          <TimerPanel
            key={timerKey + (timerTopic ?? '')}
            topic={timerTopic}
            initialDuration={60}
          />
        </div>
      )}
    </main>
  );
}
