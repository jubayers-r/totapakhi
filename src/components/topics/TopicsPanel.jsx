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
  'inline-flex items-center gap-[6px] rounded-[20px] border-[1.5px] border-[rgba(26,60,52,0.25)] bg-transparent px-6 py-[0.6rem] font-sans text-[1.05rem] font-semibold text-[#1a3c34] cursor-pointer select-none transition-colors hover:border-[rgba(26,60,52,0.5)] hover:bg-[rgba(26,60,52,0.04)] max-md:gap-1 max-md:px-3.5 max-md:py-[0.45rem] max-md:text-[0.95rem] max-[480px]:gap-[3px] max-[480px]:px-[0.55rem] max-[480px]:py-[0.35rem] max-[480px]:text-[0.8rem]';

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
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] items-center justify-center gap-12 px-12 pt-[calc(2rem+50px)] pb-8 max-md:min-h-fit max-md:flex-col max-md:gap-2 max-md:px-8 max-md:pt-2 max-md:pb-8 portrait:min-[769px]:max-[1024px]:min-h-fit portrait:min-[769px]:max-[1024px]:flex-col portrait:min-[769px]:max-[1024px]:gap-6 portrait:min-[769px]:max-[1024px]:px-8 portrait:min-[769px]:max-[1024px]:pt-2 portrait:min-[769px]:max-[1024px]:pb-8 max-[480px]:px-4 max-[480px]:pb-8">
      {/* ---- left panel ---- */}
      <div className="flex w-auto max-w-full shrink-0 flex-col items-center max-md:w-auto max-md:text-center max-md:pt-5 portrait:min-[769px]:max-[1024px]:w-auto portrait:min-[769px]:max-[1024px]:text-center">
        <img
          src="/totapakhi-logo.png"
          alt="তোতাপাখি"
          className="h-auto w-full max-w-[700px] max-[480px]:max-w-[280px]"
        />
        <p className="mt-8 font-[cursive] text-[clamp(16px,1.8vw,22px)] font-extrabold leading-relaxed text-[#41796e]">
          ১) যা তা টপিক ধরেন
          <br />
          ২) ১ মিনিট টাইমার সেট করেন
          <br />
          ৩) রেকর্ডার চেপে লেগে পরেন তোতাপাখির মতো :)
        </p>
      </div>

      {/* ---- right panel ---- */}
      <div className="flex flex-1 flex-col items-center max-md:w-full portrait:min-[769px]:max-[1024px]:w-full">
        {/* dropdowns */}
        <div className="z-20 mb-2 flex translate-x-[-38px] translate-y-5 items-center gap-2 self-center max-md:mt-5 max-md:translate-x-0 max-md:translate-y-0 max-md:gap-1.5 portrait:min-[769px]:max-[1024px]:mt-5 portrait:min-[769px]:max-[1024px]:translate-x-0 portrait:min-[769px]:max-[1024px]:translate-y-0 max-[480px]:gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass}>
              <Dice5 size={18} />
              {currentCategory.label}
              <span className="ml-auto text-[0.6rem]">▼</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
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
              align="center"
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
        <div className="flex w-full items-stretch gap-4 max-[480px]:-mx-4">
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <div
              ref={windowRef}
              className="relative mt-[75px] h-[390px] w-full overflow-hidden shadow-[inset_0_20px_30px_-20px_rgba(0,0,0,0.06),inset_0_-20px_30px_-20px_rgba(0,0,0,0.06)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)] max-md:mt-0 max-md:h-[380px] max-md:min-w-0 portrait:min-[769px]:max-[1024px]:mt-0 portrait:min-[769px]:max-[1024px]:h-[380px] portrait:min-[769px]:max-[1024px]:min-w-0 max-[480px]:h-[360px]"
            >
              <div
                ref={stripRef}
                className="tp-reel-strip absolute left-0 top-0 w-full will-change-transform"
              />
              <div className="pointer-events-none absolute top-1/2 left-1/2 z-[2] h-[130px] w-[80%] -translate-x-1/2 -translate-y-1/2 border-y border-[rgba(26,60,52,0.08)] max-md:h-[130px] portrait:min-[769px]:max-[1024px]:h-[130px] max-[480px]:h-[120px]" />
            </div>
            <div className="mt-[30px] flex justify-center gap-3 max-md:hidden portrait:min-[769px]:max-[1024px]:hidden">
              <button
                onClick={() => triggerSpin(30)}
                disabled={isSpinning}
                className="inline-block rounded-full border-2 border-[#1a3c34] bg-gradient-to-br from-[#2a5a4e] to-[#1a3c34] px-9 py-[0.6rem] font-display text-xl font-bold text-[#f9f5eb] shadow-[0_4px_12px_rgba(26,60,52,0.3)] transition-all hover:scale-[1.05] hover:shadow-[0_6px_16px_rgba(26,60,52,0.4)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ঘোরান চাকা!
              </button>
              <button
                onClick={() => onStartTimer(effectiveTopic?.topic ?? null)}
                className="inline-block rounded-full border-2 border-[#1a3c34] bg-transparent px-9 py-[0.6rem] font-display text-xl font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb]"
              >
                টাইমার →
              </button>
            </div>
          </div>

          <div
            className="relative w-[60px] shrink-0 overflow-visible max-md:hidden portrait:min-[769px]:max-[1024px]:hidden"
            aria-hidden="true"
          >
            <Lever onSpin={triggerSpin} disabled={isSpinning} />
          </div>
        </div>

        {/* mobile buttons */}
        <div className="mt-5 hidden justify-center gap-3 max-md:mt-12 max-md:flex portrait:min-[769px]:max-[1024px]:mt-12 portrait:min-[769px]:max-[1024px]:flex">
          <button
            onClick={() => triggerSpin(30)}
            disabled={isSpinning}
            className="inline-block rounded-full border-2 border-[#1a3c34] bg-gradient-to-br from-[#2a5a4e] to-[#1a3c34] px-9 py-[0.75rem] font-display text-[1.15rem] font-bold text-[#f9f5eb] shadow-[0_4px_12px_rgba(26,60,52,0.3)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ঘোরান চাকা!
          </button>
          <button
            onClick={() => onStartTimer(effectiveTopic?.topic ?? null)}
            className="inline-block rounded-full border-2 border-[#1a3c34] bg-transparent px-9 py-[0.75rem] font-display text-[1.15rem] font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb]"
          >
            টাইমার →
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
