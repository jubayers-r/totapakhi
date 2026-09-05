import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Dice5, Target, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/assets/categories';
import topicsByCategory from '@/assets/topics.json';

const CATEGORY_LIST = Object.values(CATEGORIES).filter((category) => category.id !== 'random');

export default function App() {
  const [categoryId, setCategoryId] = useState('random');
  const [gender, setGender] = useState('all');
  const [topic, setTopic] = useState(() => chooseTopic('random', 'all'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenderMenuOpen, setIsGenderMenuOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const currentCategory = useMemo(() => CATEGORIES[categoryId], [categoryId]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((previous) => {
      if (previous <= 1) { setIsRunning(false); return 0; }
      return previous - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  function chooseTopic(category, selectedGender) {
    const categoryTopics = category === 'random' ? Object.values(topicsByCategory).flat() : topicsByCategory[category] ?? [];
    const allowedGenders = selectedGender === 'all' ? ['neutral', 'male', 'female'] : ['neutral', selectedGender];
    const eligibleTopics = categoryTopics.filter((item) => allowedGenders.includes(item.gender));
    return eligibleTopics[Math.floor(Math.random() * eligibleTopics.length)];
  }

  function spin(nextCategoryId = categoryId, nextGender = gender) { setTopic(chooseTopic(nextCategoryId, nextGender)); setSecondsLeft(60); setIsRunning(false); }
  function selectCategory(nextCategoryId) { setCategoryId(nextCategoryId); setIsMenuOpen(false); spin(nextCategoryId); }
  function selectGender(nextGender) { setGender(nextGender); setIsGenderMenuOpen(false); spin(categoryId, nextGender); }
  const timerLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  const selectClass = 'inline-flex h-10 items-center gap-2 rounded-full border border-[#ccd3c7] bg-[#fbf9f1] px-4 text-sm font-bold text-[#21493f] transition-colors hover:bg-[#f0ecdf]';

  return <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_61%_50%,#fffdf8_0,#faf6ec_42%,#f7f2e7_100%)] text-[#173f37]">
    <header className="grid h-14 grid-cols-[1fr_auto] items-center border-b border-[#ece6d8] px-5 text-sm font-semibold sm:px-[7.5%] lg:grid-cols-[1fr_auto_1fr]">
      <a className="justify-self-start font-serif text-xl font-black" href="#top">টোটাপাখি</a>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation"><a className="rounded-full bg-[#faf7ef] px-6 py-2.5 shadow-[0_0_0_4px_#e1e3db]" href="#practice">Random Topics</a><a className="px-6 py-2.5" href="#interview">Interview Prep</a><a className="px-6 py-2.5" href="#vocab">Learn Vocab</a><a className="px-6 py-2.5" href="#research">Deep Research</a></nav>
      <span className="justify-self-end font-[cursive] text-lg font-extrabold text-[#3f776c] -rotate-3 sm:text-xl">say step to the mic</span>
    </header>
    <section className="mx-auto grid min-h-[735px] w-[calc(100%_-_48px)] max-w-[1130px] grid-cols-1 items-center gap-5 py-9 md:max-w-[600px] lg:max-w-[1130px] lg:grid-cols-[42%_48%_10%] lg:py-0" id="practice">
      <div className="px-0 text-center lg:pl-5 lg:text-left"><p className="mb-1 font-[cursive] text-lg font-extrabold text-[#e6a446] -rotate-8">Let&apos;s practise</p><h1 className="grid font-serif text-[clamp(72px,8vw,112px)] font-bold leading-[.68] tracking-[-.09em] text-[#075345] [text-shadow:6px_9px_0_#c7d4cd]"><span>Speak</span><span className="ml-5">Fact</span></h1><div className="mx-auto my-6 h-5 w-36 rotate-[-3deg] rounded-[40%_55%] border-t-[9px] border-[#efad4a] lg:mx-0 lg:ml-36 lg:mb-7" /><ol className="mb-6 inline-block list-none p-0 text-left font-[cursive] text-[clamp(25px,2.4vw,37px)] font-black leading-[1.48] text-[#41796e]"><li>1) Get random topic</li><li>2) Set 1 min timer</li><li>3) Record &amp; speak <span className="text-[#e6a446]">↘</span></li></ol><br /><Button className="h-12 rounded-md bg-[#174b40] px-7 text-xs font-extrabold text-[#fffdf5] shadow-md hover:bg-[#103d34] sm:px-10">GET SPEECH ANALYSIS</Button></div>
        <div className="relative pt-4"><div className="mb-14 flex flex-wrap justify-center gap-2 lg:mb-[92px] lg:justify-end"><div className="relative"><button className={selectClass} type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}><Dice5 size={16} /> {currentCategory.label} <ChevronDown size={13} /></button>{isMenuOpen && <div className="absolute left-0 top-12 z-10 w-[245px] rounded-xl border border-[#d9ddcf] bg-[#fffdf7] p-1.5 shadow-xl"><button className="w-full rounded-lg p-2 text-left text-[15px] text-[#19483d] hover:bg-[#edf2e9]" type="button" onClick={() => selectCategory('random')}>🎲 {CATEGORIES.random.label}</button>{CATEGORY_LIST.map((category) => <button className="w-full rounded-lg p-2 text-left text-[15px] text-[#19483d] hover:bg-[#edf2e9]" key={category.id} type="button" onClick={() => selectCategory(category.id)}>{category.label}<small className="mt-0.5 block text-[11px] text-[#75877f]">{category.subtitle}</small></button>)}</div>}</div><div className="relative"><button className={selectClass} type="button" onClick={() => setIsGenderMenuOpen(!isGenderMenuOpen)}><UserRound size={16} /> {gender === 'all' ? 'সবার জন্য' : gender === 'male' ? 'পুরুষ' : 'নারী'} <ChevronDown size={13} /></button>{isGenderMenuOpen && <div className="absolute right-0 top-12 z-10 w-40 rounded-xl border border-[#d9ddcf] bg-[#fffdf7] p-1.5 shadow-xl"><button className="w-full rounded-lg p-2 text-left text-sm hover:bg-[#edf2e9]" type="button" onClick={() => selectGender('all')}>সবার জন্য</button><button className="w-full rounded-lg p-2 text-left text-sm hover:bg-[#edf2e9]" type="button" onClick={() => selectGender('male')}>পুরুষ</button><button className="w-full rounded-lg p-2 text-left text-sm hover:bg-[#edf2e9]" type="button" onClick={() => selectGender('female')}>নারী</button></div>}</div><button className={selectClass} type="button" onClick={() => spin()}><Target size={16} /> নতুন টপিক</button></div>
        <p className="mb-9 text-center font-serif text-[15px] font-bold text-[#c7d0c7]">আজকের কথার বিষয়</p><article className="min-h-[250px] border-y border-[#e7e7de] px-4 py-7 text-center sm:px-9"><p className="mb-3 font-[cursive] text-lg font-extrabold text-[#e5a94f]">{currentCategory.label}</p><h2 className="mx-auto mb-5 max-w-lg font-serif text-[clamp(23px,2vw,29px)] font-bold leading-[1.14] text-[#193f37]">{topic?.topic}</h2><ul className="m-0 grid list-none justify-center gap-2 p-0 text-xs text-[#81928a] sm:flex sm:gap-3">{topic?.hints.map((hint, index) => <li className={index ? 'max-w-[130px] sm:border-l sm:border-[#d6ddd5] sm:pl-3' : 'max-w-[130px]'} key={hint}>{hint}</li>)}</ul></article><div className="mt-10 flex flex-wrap justify-center gap-3"><Button onClick={() => spin()} className="h-11 min-w-24 rounded-full bg-[#174b40] px-6 text-xs font-extrabold text-[#fffdf5] hover:bg-[#103d34]">Spin!</Button><Button variant="outline" onClick={() => isRunning ? setIsRunning(false) : setIsRunning(true)} className="h-11 rounded-full border-[#174b40] bg-transparent px-5 text-xs font-extrabold text-[#174b40] hover:bg-[#eaf0e9] sm:px-7">{isRunning ? `Pause · ${timerLabel}` : secondsLeft === 0 ? 'সময় শেষ — আবার শুরু' : `Start Timer → ${timerLabel}`}</Button></div>
      </div>
      <aside className="mt-20 hidden flex-col items-center self-center font-[cursive] text-lg font-extrabold text-[#518174] lg:flex" aria-label={`Timer: ${timerLabel}`}><span>pull lever</span><b className="leading-none">↓</b><div className="relative mt-2 h-[105px] w-9 before:absolute before:left-[17px] before:top-0 before:h-[88px] before:w-[3px] before:bg-[#1d4b41]"><i className={`absolute -top-px left-0 size-10 rounded-full border border-[#193d36] bg-[linear-gradient(135deg,#f0dbff,#b899ed)] shadow-md transition-transform ${isRunning ? 'translate-y-3.5' : ''}`} /><em className="absolute bottom-0 left-2 size-5 rounded-full border-[3px] border-[#174b40] bg-[#245f51]" /></div><strong className="mt-1 font-sans text-xs text-[#174b40]">{timerLabel}</strong></aside>
    </section>
  </main>;
}
