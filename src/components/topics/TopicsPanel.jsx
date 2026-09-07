import { CATEGORIES } from '@/assets/categories';
import topicsByCategory from '@/assets/topics.json';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePersistence } from '@/hooks/usePersistence';
import { useReel } from '@/hooks/useReel';
import { ensureAudioContext, playClunk } from '@/lib/sounds';
import { Dice5, UserRound } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import Lever from './Lever';

const CATEGORY_LIST = Object.values(CATEGORIES).filter(
  (c) => c.id !== 'random'
);

const triggerClass =
  'inline-flex items-center gap-[6px] rounded-[20px] border-[1.5px] border-[rgba(26,60,52,0.25)] bg-transparent px-6 py-[0.6rem] font-sans text-[1.05rem] font-semibold text-[#1a3c34] cursor-pointer select-none transition-colors hover:border-[rgba(26,60,52,0.5)] hover:bg-[rgba(26,60,52,0.04)]';

export default function TopicsPanel({ onStartTimer }) {
  const [categoryId, setCategoryId] = usePersistence(
    'impromptu-category',
    'random'
  );
  const [gender, setGender] = usePersistence('impromptu-gender', 'all');

  const pool = useMemo(() => {
    const source =
      categoryId === 'random'
        ? Object.values(topicsByCategory).flat()
        : (topicsByCategory[categoryId] ?? []);
    if (!source.length) return [];
    const allowedGenders =
      gender === 'all'
        ? ['neutral', 'male', 'female']
        : gender === 'male'
          ? ['neutral', 'male']
          : ['neutral', 'female'];
    let eligible = source.filter((item) =>
      allowedGenders.includes(item.gender)
    );
    if (!eligible.length) eligible = source;
    return eligible;
  }, [categoryId, gender]);

  const { windowRef, stripRef, spin, isSpinning, lastLanded } = useReel({
    topics: pool,
  });

  const effectiveTopic = lastLanded;

  const triggerSpin = useCallback(
    (velocity) => {
      ensureAudioContext();
      playClunk();
      spin(velocity);
    },
    [spin]
  );

  const currentCategory = CATEGORIES[categoryId];

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-12 pb-8 pt-[calc(2rem+50px)] lg:min-h-screen lg:flex-row lg:items-center lg:justify-center lg:gap-12 lg:px-12">
      {/* ---- left panel ---- */}
      <div className="flex w-[450px] max-w-full flex-col items-center text-center">
        <h1 className="font-display text-5xl font-black tracking-tight text-[#075345] sm:text-6xl">
          তোতাপাখি
        </h1>
        <p className="mt-8 font-[cursive] text-[clamp(16px,1.8vw,22px)] font-extrabold leading-relaxed text-[#41796e]">
          ১) টপিক নাও
          <br />
          ২) ১ মিনিট টাইমার সেট করো
          <br />
          ৩) কথা বলো ↘
        </p>
        <a
          href="https://offthecuffspeech.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-[8px] border-2 border-[#1a3c34] bg-gradient-to-br from-[#2a5a4e] to-[#1a3c34] px-12 py-[0.7rem] font-display text-lg font-bold text-[#f9f5eb] shadow-[0_4px_12px_rgba(26,60,52,0.3)] transition-all hover:scale-[1.03] hover:shadow-[0_6px_16px_rgba(26,60,52,0.45)] active:scale-[0.97]"
        >
          GET SPEECH ANALYSIS
        </a>
      </div>

      {/* ---- right panel ---- */}
      <div className="flex flex-1 flex-col items-center">
        {/* dropdowns */}
        <div className="z-20 mb-2 flex flex-wrap items-center justify-center gap-2 translate-x-[-38px] translate-y-[20px]">
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass}>
              <Dice5 size={18} />
              {currentCategory.label}
              <span className="ml-auto text-[0.6rem]">▼</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[245px] rounded-xl border border-[#d9ddcf] bg-[#f9f5eb] p-1.5 shadow-xl"
            >
              <DropdownMenuItem
                className="rounded-lg p-2 text-left text-[15px] text-[#19483d] focus:bg-[#edf2e9]"
                onClick={() => setCategoryId('random')}
              >
                <span>🎲 {CATEGORIES.random.label}</span>
              </DropdownMenuItem>
              {CATEGORY_LIST.map((category) => (
                <DropdownMenuItem
                  className="block rounded-lg p-2 text-left text-[15px] text-[#19483d] focus:bg-[#edf2e9]"
                  key={category.id}
                  onClick={() => setCategoryId(category.id)}
                >
                  {category.label}
                  <small className="mt-0.5 block text-[11px] text-[#75877f]">
                    {category.subtitle}
                  </small>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass}>
              <UserRound size={18} />
              {gender === 'all'
                ? 'উরাধুরা (সবাই)'
                : gender === 'male'
                  ? 'বেডা মানুষ'
                  : 'বেডি মানুষ'}
              <span className="ml-auto text-[0.6rem]">▼</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl border border-[#d9ddcf] bg-[#f9f5eb] p-1.5 shadow-xl"
            >
              {[
                { value: 'all', label: 'উরাধুরা (সবাই)' },
                { value: 'male', label: 'বেডা মানুষ' },
                { value: 'female', label: 'বেডি মানুষ' },
              ].map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="rounded-lg p-2 text-left text-sm focus:bg-[#edf2e9]"
                  onClick={() => setGender(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* reel assembly */}
        <div className="reel-assembly flex w-full items-stretch gap-4">
          <div className="topic-col flex flex-1 flex-col items-center">
            <div ref={windowRef} className="tp-reel-window">
              <div ref={stripRef} className="tp-reel-strip" />
              <div className="tp-reel-center-line" />
            </div>
            <div className="desktop-btn-row mt-8 hidden justify-center gap-3 sm:flex">
              <button
                onClick={() => triggerSpin(30)}
                disabled={isSpinning}
                className="inline-block rounded-full border-2 border-[#1a3c34] bg-gradient-to-br from-[#2a5a4e] to-[#1a3c34] px-9 py-[0.6rem] font-display text-xl font-bold text-[#f9f5eb] shadow-[0_4px_12px_rgba(26,60,52,0.3)] transition-all hover:scale-[1.05] hover:shadow-[0_6px_16px_rgba(26,60,52,0.4)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Spin!
              </button>
              <button
                onClick={() => onStartTimer(effectiveTopic)}
                className="inline-block rounded-full border-2 border-[#1a3c34] bg-transparent px-9 py-[0.6rem] font-display text-xl font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb]"
              >
                Start Timer →
              </button>
            </div>
          </div>

          <div
            className="slot-handle relative hidden w-[60px] shrink-0 flex-col items-center lg:flex"
            aria-hidden="true"
          >
            <Lever onSpin={triggerSpin} disabled={isSpinning} />
          </div>
        </div>

        {/* mobile buttons */}
        <div className="mobile-btn-row mt-6 hidden justify-center gap-3 sm:hidden">
          <button
            onClick={() => triggerSpin(30)}
            disabled={isSpinning}
            className="inline-block rounded-full border-2 border-[#1a3c34] bg-gradient-to-br from-[#2a5a4e] to-[#1a3c34] px-10 py-[0.85rem] font-display text-[1.3rem] font-bold text-[#f9f5eb] shadow-[0_4px_12px_rgba(26,60,52,0.3)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Spin!
          </button>
          <button
            onClick={() => onStartTimer(effectiveTopic)}
            className="inline-block rounded-full border-2 border-[#1a3c34] bg-transparent px-10 py-[0.85rem] font-display text-[1.3rem] font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb]"
          >
            টাইমার
          </button>
        </div>

        {/* ideas grid: shown once a topic lands */}
        {effectiveTopic?.hints?.length > 0 && (
          <div className="w-full max-w-[620px] px-4 pt-2">
            <p className="mb-2 text-center font-[cursive] text-2xl font-extrabold text-[#e6a446]">
              ✦ কথা শুরু করার ভাবনা ✦
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {effectiveTopic.hints.map((hint, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-[rgba(26,60,52,0.12)] bg-[rgba(26,60,52,0.03)] p-3 text-left"
                >
                  <span className="font-display text-lg font-bold text-[#e6a446]">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-snug text-[#1a3c34]">
                    {hint}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
