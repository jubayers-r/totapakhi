import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopicsPanel from '@/components/topics/TopicsPanel';
import InterviewPanel from '@/components/interview/InterviewPanel';
import TimerPanel from '@/components/timer/TimerPanel';
import { usePersistence } from '@/hooks/usePersistence';

export default function App() {
  const [mode, setMode] = usePersistence('impromptu-mode', 'topics');
  const [timerTopic, setTimerTopic] = useState(null);
  const [timerKey, setTimerKey] = useState(0);

  function startTimer(topic) {
    setTimerTopic(topic ?? null);
    setTimerKey((k) => k + 1);
    setMode('timer');
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_61%_50%,#fffdf8_0,#faf6ec_42%,#f7f2e7_100%)] text-[#173f37]">
      <header className="grid h-14 grid-cols-[1fr_auto] items-center border-b border-[#ece6d8] px-5 text-sm font-semibold sm:px-[7.5%] lg:grid-cols-[1fr_auto_1fr]">
        <a
          className="justify-self-start font-display text-xl font-black text-[#075345]"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setMode('topics');
          }}
        >
          তোতাপাখি
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList variant="line" className="gap-2">
              <TabsTrigger value="topics">র‍্যান্ডম টপিক</TabsTrigger>
              <TabsTrigger value="interview">ইন্টারভিউ প্রস্তুতি</TabsTrigger>
              <TabsTrigger value="timer">টাইমার</TabsTrigger>
            </TabsList>
          </Tabs>
        </nav>
        <span className="justify-self-end font-[cursive] text-lg font-extrabold text-[#3f776c] -rotate-3 sm:text-xl">
          say step to the mic
        </span>
      </header>

      <Tabs value={mode} onValueChange={setMode} className="mt-4 px-5 sm:px-[7.5%] lg:mt-0 lg:hidden">
        <TabsList className="mx-auto flex w-full max-w-md">
          <TabsTrigger value="topics">র‍্যান্ডম</TabsTrigger>
          <TabsTrigger value="interview">ইন্টারভিউ</TabsTrigger>
          <TabsTrigger value="timer">টাইমার</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsContent value="topics" className="data-hidden:hidden">
          <TopicsPanel onStartTimer={startTimer} />
        </TabsContent>
        <TabsContent value="interview" className="data-hidden:hidden">
          <InterviewPanel />
        </TabsContent>
        <TabsContent
          value="timer"
          className="data-hidden:hidden data-hidden:pointer-events-none"
        >
          <TimerPanel key={timerKey + (timerTopic ?? '')} topic={timerTopic} initialDuration={60} />
        </TabsContent>
      </Tabs>
    </main>
  );
}