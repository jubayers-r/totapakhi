import InterviewPanel from '@/components/interview/InterviewPanel';
import TimerPanel from '@/components/timer/TimerPanel';
import TopicsPanel from '@/components/topics/TopicsPanel';
import { usePersistence } from '@/hooks/usePersistence';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== 'Escape') return;
      if (mode === 'timer') setMode('topics');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, setMode]);

  const tabs = [
    { id: 'topics', label: 'যা তা টপিক' },
    { id: 'interview', label: 'ইন্টারভিউয়ে গলা ফাটানো' },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f9f5eb] text-[#1a3c34]">
      {/* fixed tab bar, original style */}
      {mode !== 'timer' && (
        <div className="fixed top-4 left-1/2 z-[15] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-[50px] bg-[rgba(26,60,52,0.08)] p-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:static max-md:top-auto max-md:left-auto max-md:z-auto max-md:mx-auto max-md:mt-4 max-md:w-full max-md:max-w-[calc(100vw-2rem)] max-md:translate-x-0 portrait:min-[769px]:max-[1024px]:static portrait:min-[769px]:max-[1024px]:top-auto portrait:min-[769px]:max-[1024px]:left-auto portrait:min-[769px]:max-[1024px]:z-auto portrait:min-[769px]:max-[1024px]:mx-auto portrait:min-[769px]:max-[1024px]:mt-4 portrait:min-[769px]:max-[1024px]:w-full portrait:min-[769px]:max-[1024px]:max-w-[calc(100vw-2rem)] portrait:min-[769px]:max-[1024px]:translate-x-0 max-md:gap-1.5 max-md:px-1 max-[480px]:gap-1 max-[480px]:px-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => goTo(tab.id)}
              className={`relative whitespace-nowrap rounded-[50px] px-7 py-[0.6rem] font-sans text-[1.05rem] font-semibold transition-colors ${
                mode === tab.id
                  ? 'bg-[#f9f5eb] text-[#1a3c34] shadow-[0_2px_6px_rgba(26,60,52,0.14)]'
                  : 'bg-transparent text-[#1a3c34] hover:bg-[rgba(26,60,52,0.06)]'
              } text-center max-md:flex-1 max-md:px-1 portrait:min-[769px]:max-[1024px]:flex-1 portrait:min-[769px]:max-[1024px]:px-1 max-md:py-2 max-md:text-[0.92rem] max-[480px]:py-[0.45rem] max-[480px]:text-[0.78rem]`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* copyright badge, same as original top-right */}
      {mode !== 'timer' && (
        <a
          href="https://linktr.ee/aatagache.totapakhi"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="আতা গাছে তোতা পাখি ©"
        >
          <img
            src="/brand-badge.png"
            alt="আতা গাছে তোতা পাখি ©"
            className="fixed top-4 right-6 z-10 w-[330px] opacity-80 max-[1080px]:hidden"
          />
        </a>
      )}

      {mode === 'topics' && <TopicsPanel onStartTimer={startTimer} />}
      {mode === 'interview' && (
        <InterviewPanel onBack={() => setMode('topics')} />
      )}
      {mode === 'timer' && (
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pt-2 max-md:pt-2 portrait:min-[769px]:max-[1024px]:pt-2">
          <button
            onClick={() => setMode('topics')}
            className="fixed top-4 left-1/2 z-10 -translate-x-1/2 cursor-pointer rounded-full border-2 border-[#1a3c34] bg-transparent px-6 py-2 font-display text-lg font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb] max-md:top-3 max-md:px-4 max-md:py-1.5 max-md:text-base"
          >
            ← যা তা টপিক
          </button>
          <TimerPanel
            key={timerKey + (timerTopic ?? '')}
            topic={timerTopic}
            initialDuration={60}
          />
          <div className="pointer-events-none fixed bottom-4 left-6 z-10 flex items-center gap-2 font-sans text-sm font-semibold text-[rgba(26,60,52,0.55)] max-md:hidden portrait:min-[769px]:max-[1024px]:flex">
            <span className="text-base leading-none">✦</span>
            <span className="kg-key kg-key-pink">Esc</span> পিছনে ফেরত যান
          </div>
        </div>
      )}

      {/* copyright badge, mobile (inline at bottom, like the original) */}
      {mode !== 'timer' && (
        <a
          href="https://linktr.ee/aatagache.totapakhi"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="আতা গাছে তোতা পাখি ©"
          className="mx-auto mt-6 hidden w-[180px] opacity-80 max-[1080px]:block max-[480px]:w-[120px]"
        >
          <img
            src="/brand-badge.png"
            alt="আতা গাছে তোতা পাখি ©"
            className="w-full"
          />
        </a>
      )}
    </main>
  );
}
