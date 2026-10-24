import { CATEGORIES } from '@/assets/categories';
import rawTopics from '@/assets/topics.json';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';
import { usePersistence } from '@/hooks/usePersistence';
import { useReel } from '@/hooks/useReel';
import { ensureAudioContext, playClunk } from '@/lib/sounds';
import type { Topic } from '@/types';
import { Dice5, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import Lever from './Lever';

const topicsByCategory = rawTopics as unknown as Record<string, Topic[]>;

const CATEGORY_LIST = Object.values(CATEGORIES).filter(
  (c) => c.id !== 'random'
);

const triggerClass =
  'inline-flex items-center gap-[6px] rounded-[20px] border-[1.5px] border-[rgba(26,60,52,0.25)] bg-transparent px-6 py-[0.6rem] font-sans text-[1.05rem] font-semibold text-[#1a3c34] cursor-pointer select-none transition-colors hover:border-[rgba(26,60,52,0.5)] hover:bg-[rgba(26,60,52,0.04)] max-md:gap-1 max-md:px-3.5 max-md:py-[0.45rem] max-md:text-[0.95rem] max-[480px]:gap-[3px] max-[480px]:px-[0.55rem] max-[480px]:py-[0.35rem] max-[480px]:text-[0.8rem]';

export interface TopicsPanelProps {
  onStartTimer: (topic: string | null) => void;
}

export default function TopicsPanel({ onStartTimer }: TopicsPanelProps) {
  const { lang, t } = useLanguage();
  const [categoryId, setCategoryId] = usePersistence<string>(
    'impromptu-category',
    'random'
  );
  const [gender, setGender] = usePersistence<string>('impromptu-gender', 'all');

  const pool = useMemo<Topic[]>(() => {
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

    return eligible.map((item) => ({
      ...item,
      topic: lang === 'en' && item.enTopic ? item.enTopic : item.topic,
      hints: lang === 'en' && item.enHints ? item.enHints : item.hints,
    }));
  }, [categoryId, gender, lang]);

  const { windowRef, stripRef, spin, isSpinning, lastLanded } = useReel({
    topics: pool,
  });

  const effectiveTopic = lastLanded;

  const triggerSpin = useCallback(
    (velocity?: number) => {
      ensureAudioContext();
      playClunk();
      spin(velocity);
    },
    [spin]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return;

      const menuOpen = document.querySelector('[role="menu"]');
      const el = e.target as HTMLElement | null;
      const interactive =
        el &&
        typeof el.closest === 'function' &&
        el.closest(
          'button, a, input, [role="menu"], [role="menuitem"], [role="listbox"], [role="combobox"]'
        );
      if (menuOpen || interactive) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isSpinning) triggerSpin(30);
      } else if (!isSpinning && effectiveTopic?.topic) {
        e.preventDefault();
        onStartTimer(effectiveTopic.topic);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSpinning, triggerSpin, effectiveTopic, onStartTimer]);

  const currentCategory = CATEGORIES[categoryId] || CATEGORIES.random;
  const currentCategoryLabel =
    lang === 'en' ? currentCategory.enLabel : currentCategory.label;

  const genderOptions = [
    {
      value: 'all',
      label: t('উরাধুরা (সবাই)', 'All (Wild Mix)'),
    },
    {
      value: 'male',
      label: t('বেডা মানুষ', 'For Boys'),
    },
    {
      value: 'female',
      label: t('বেডি মানুষ', 'For Girls'),
    },
  ];

  const currentGenderLabel =
    genderOptions.find((o) => o.value === gender)?.label ??
    genderOptions[0].label;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] items-center justify-center gap-12 px-12 pt-[calc(2rem+50px)] pb-8 max-md:min-h-fit max-md:flex-col max-md:gap-2 max-md:px-8 max-md:pt-2 max-md:pb-8 portrait:min-[769px]:max-[1024px]:min-h-fit portrait:min-[769px]:max-[1024px]:flex-col portrait:min-[769px]:max-[1024px]:gap-6 portrait:min-[769px]:max-[1024px]:px-8 portrait:min-[769px]:max-[1024px]:pt-2 portrait:min-[769px]:max-[1024px]:pb-8 max-[480px]:px-4 max-[480px]:pb-8">
      {/* ---- left panel ---- */}
      <div className="flex w-[450px] max-w-full shrink-0 flex-col items-center max-md:w-auto max-md:text-center max-md:pt-5 portrait:min-[769px]:max-[1024px]:w-auto portrait:min-[769px]:max-[1024px]:text-center">
        <img
          src="/totapakhi-logo.png"
          alt={t('তোতাপাখি', 'Totapakhi')}
          className="h-auto w-full max-w-[700px] portrait:min-[769px]:max-[1024px]:max-w-[480px] max-md:max-w-[400px] max-[480px]:max-w-[280px]"
        />
        <img
          src={lang === 'en' ? '/header-en.png' : '/header.png'}
          alt={t('তোতাপাখি হেডার', 'Totapakhi Header')}
          className="mt-4 h-auto w-full max-w-[400px] max-md:max-w-[340px] max-[480px]:max-w-[240px]"
        />
      </div>

      {/* ---- right panel ---- */}
      <div className="flex flex-1 flex-col items-center max-md:w-full portrait:min-[769px]:max-[1024px]:w-full">
        {/* dropdowns */}
        <div className="z-20 mb-2 flex translate-x-[-38px] translate-y-5 items-center gap-2 self-center max-md:mt-5 max-md:translate-x-0 max-md:translate-y-0 max-md:gap-1.5 portrait:min-[769px]:max-[1024px]:mt-5 portrait:min-[769px]:max-[1024px]:translate-x-0 portrait:min-[769px]:max-[1024px]:translate-y-0 max-[480px]:gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass}>
              <Dice5 size={18} />
              {currentCategoryLabel}
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
                <span>
                  🎲 {lang === 'en' ? CATEGORIES.random.enLabel : CATEGORIES.random.label}
                </span>
              </DropdownMenuItem>
              {CATEGORY_LIST.map((category) => (
                <DropdownMenuItem
                  className="block rounded-lg p-2 text-left text-[15px] text-[#19483d] focus:bg-[#edf2e9]"
                  key={category.id}
                  onClick={() => setCategoryId(category.id)}
                >
                  {lang === 'en' ? category.enLabel : category.label}
                  <small className="mt-0.5 block text-[11px] text-[#75877f]">
                    {lang === 'en' ? category.enSubtitle : category.subtitle}
                  </small>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass}>
              <UserRound size={18} />
              {currentGenderLabel}
              <span className="ml-auto text-[0.6rem]">▼</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-40 rounded-xl border border-[#d9ddcf] bg-[#f9f5eb] p-1.5 shadow-xl"
            >
              {genderOptions.map((option) => (
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
              className="relative mt-[75px] h-[390px] w-full overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)] max-md:mt-0 max-md:h-[380px] max-md:min-w-0 portrait:min-[769px]:max-[1024px]:mt-0 portrait:min-[769px]:max-[1024px]:h-[380px] portrait:min-[769px]:max-[1024px]:min-w-0 max-[480px]:h-[360px]"
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
                {t('ঘোরান চাকা!', 'Spin the Wheel!')}
              </button>
              <button
                onClick={() => onStartTimer(effectiveTopic?.topic ?? null)}
                className="inline-block rounded-full border-2 border-[#1a3c34] bg-transparent px-9 py-[0.6rem] font-display text-xl font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb]"
              >
                {t('টাইমার →', 'Timer →')}
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
        <div className="mt-5 hidden w-full justify-center gap-3 max-md:mt-12 max-md:flex portrait:min-[769px]:max-[1024px]:mt-12 portrait:min-[769px]:max-[1024px]:flex">
          <button
            onClick={() => triggerSpin(30)}
            disabled={isSpinning}
            className="min-w-0 flex-1 rounded-full border-2 border-[#1a3c34] bg-gradient-to-br from-[#2a5a4e] to-[#1a3c34] px-4 py-[0.75rem] font-display text-[1.15rem] font-bold text-[#f9f5eb] shadow-[0_4px_12px_rgba(26,60,52,0.3)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap tracking-wider max-[480px]:px-2 max-[480px]:py-[0.6rem] max-[480px]:text-[0.95rem] max-[480px]:tracking-wide"
          >
            {t('ঘোরান চাকা!', 'Spin Wheel!')}
          </button>
          <button
            onClick={() => onStartTimer(effectiveTopic?.topic ?? null)}
            className="min-w-0 flex-1 rounded-full border-2 border-[#1a3c34] bg-transparent px-4 py-[0.75rem] font-display text-[1.15rem] font-bold text-[#1a3c34] transition-colors hover:bg-[#1a3c34] hover:text-[#f9f5eb] whitespace-nowrap tracking-wider max-[480px]:px-2 max-[480px]:py-[0.6rem] max-[480px]:text-[0.95rem] max-[480px]:tracking-wide"
          >
            {t('টাইমার →', 'Timer →')}
          </button>
        </div>

        {/* ideas grid: hidden while spinning, shown again after each selection */}
        {!isSpinning && effectiveTopic?.hints && effectiveTopic.hints.length > 0 && (
          <div className="w-full max-w-[620px] translate-x-[-38px] px-4 pt-8 max-md:translate-x-0 portrait:min-[769px]:max-[1024px]:translate-x-0">
            <p className="mb-2 text-center font-[cursive] text-xl font-extrabold text-[#e6a446] max-md:text-lg">
              {t("কথা শুরু করার ভাবনা ('v')", "Talking Points / Hints ('v')")}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {effectiveTopic.hints.map((hint, i) => (
                <div
                  key={i}
                  className="relative flex items-center overflow-hidden rounded-xl bg-[rgba(26,60,52,0.03)] p-3 text-left shadow-sm max-md:py-3 max-md:px-4 sm:min-h-[85px]"
                >
                  <p className="relative z-[1] w-full text-sm leading-snug text-[#1a3c34] pr-10 sm:pr-0 max-md:text-[0.85rem]">
                    {hint}
                  </p>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute font-display font-black leading-none bg-gradient-to-b from-[#e6a446]/35 to-transparent bg-clip-text text-transparent select-none right-1 bottom-0 text-[4.5rem] max-md:right-3 max-md:top-1/2 max-md:bottom-auto max-md:-translate-y-1/2 max-md:text-[2.2rem]"
                  >
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* corner hint: minimal guide like bruno-simon */}
      <div className="pointer-events-none fixed bottom-4 left-6 z-10 flex items-center gap-2 font-sans text-sm font-semibold text-[rgba(26,60,52,0.55)] max-md:hidden portrait:min-[769px]:max-[1024px]:flex">
        {!isSpinning &&
          (effectiveTopic ? (
            <span className="flex items-center gap-2">
              <span className="kg-key kg-key-green">Space</span> {t('আবার ঘোরান', 'Spin again')}
              <span className="text-[rgba(26,60,52,0.3)]">·</span>
              <span className="kg-key kg-key-gold">Enter</span> {t('টাইমার', 'Timer')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="kg-key kg-key-green">Space</span>{' '}
              {t('শর্টকাটে চাকা ঘোরান', 'Spin wheel shortcut')}
            </span>
          ))}
      </div>
    </div>
  );
}
