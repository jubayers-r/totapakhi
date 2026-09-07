import { useCallback, useMemo } from 'react';
import { ChevronDown, Dice5, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CATEGORIES } from '@/assets/categories';
import topicsByCategory from '@/assets/topics.json';
import { useReel } from '@/hooks/useReel';
import { usePersistence } from '@/hooks/usePersistence';
import Lever from './Lever';
import { playClunk, ensureAudioContext } from '@/lib/sounds';

const CATEGORY_LIST = Object.values(CATEGORIES).filter((category) => category.id !== 'random');

const selectClass =
  'inline-flex h-11 items-center gap-2 rounded-full border border-[#ccd3c7] bg-[#fbf9f1] px-4 text-sm font-bold text-[#21493f] transition-colors hover:bg-[#f0ecdf] data-[popup-open]:bg-[#f0ecdf]';

export default function TopicsPanel({ onStartTimer }) {
  const [categoryId, setCategoryId] = usePersistence('impromptu-category', 'random');
  const [gender, setGender] = usePersistence('impromptu-gender', 'all');

  const pool = useMemo(() => {
    const source =
      categoryId === 'random'
        ? Object.values(topicsByCategory).flat()
        : topicsByCategory[categoryId] ?? [];
    if (!source.length) return [];
    const allowedGenders =
      gender === 'all' ? ['neutral', 'male', 'female'] : gender === 'male' ? ['neutral', 'male'] : ['neutral', 'female'];
    let eligible = source.filter((item) => allowedGenders.includes(item.gender));
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
    <section
      id="practice"
      className="mx-auto grid w-[calc(100%_-_48px)] max-w-[1130px] grid-cols-1 items-center gap-5 py-9 md:max-w-[600px] lg:max-w-[1130px] lg:grid-cols-[42%_52%_6%] lg:py-0"
    >
      <div className="px-0 text-center lg:pl-5 lg:text-left">
        <p className="mb-1 font-[cursive] text-lg font-extrabold text-[#e6a446] -rotate-8">
          চর্চা শুরু করি
        </p>
        <h1 className="grid font-display text-[clamp(62px,7vw,96px)] font-bold leading-[.68] tracking-[-.05em] text-[#075345] [text-shadow:6px_9px_0_#c7d4cd]">
          <span>কথা</span>
          <span className="ml-5">বলো</span>
        </h1>
        <div className="mx-auto my-6 h-5 w-36 rotate-[-3deg] rounded-[40%_55%] border-t-[9px] border-[#efad4a] lg:mx-0 lg:ml-36 lg:mb-7" />
        <ol className="mb-6 inline-block list-none p-0 text-left font-[cursive] text-[clamp(20px,1.9vw,30px)] font-black leading-[1.48] text-[#41796e]">
          <li>১) র‍্যান্ডম টপিক নাও</li>
          <li>২) ১ মিনিট টাইমার সেট করো</li>
          <li>
            ৩) কথা বলো <span className="text-[#e6a446]">↘</span>
          </li>
        </ol>
        <br />
        <Button className="h-12 rounded-md bg-[#174b40] px-7 text-xs font-extrabold text-[#fffdf5] shadow-md hover:bg-[#103d34] sm:px-10">
          GET SPEECH ANALYSIS
        </Button>
      </div>

      <div className="relative pt-4">
        <div className="mb-4 flex flex-wrap justify-center gap-2 lg:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className={selectClass}>
              <Dice5 size={16} />
              {currentCategory.label}
              <ChevronDown size={13} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[245px] rounded-xl border border-[#d9ddcf] bg-[#fffdf7] p-1.5 shadow-xl">
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
                  <small className="mt-0.5 block text-[11px] text-[#75877f]">{category.subtitle}</small>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className={selectClass}>
              <UserRound size={16} />
              {gender === 'all' ? 'সবার জন্য' : gender === 'male' ? 'পুরুষ' : 'নারী'}
              <ChevronDown size={13} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl border border-[#d9ddcf] bg-[#fffdf7] p-1.5 shadow-xl">
              {[
                { value: 'all', label: 'সবার জন্য' },
                { value: 'male', label: 'পুরুষ' },
                { value: 'female', label: 'নারী' },
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

        <p className="mb-4 text-center font-display text-[15px] font-bold text-[#c7d0c7]">
          আজকের কথার বিষয়
        </p>

        <div className="reel-assembly flex items-start justify-center gap-0 lg:gap-3">
          <div className="topic-col w-full max-w-[620px]">
            <div ref={windowRef} className="tp-reel-window">
              <div ref={stripRef} className="tp-reel-strip" />
              <div className="tp-reel-center-line" />
            </div>
            <div className="desktop-btn-row mt-5 hidden justify-center gap-3 sm:flex">
              <Button
                onClick={() => triggerSpin(30)}
                disabled={isSpinning}
                className="h-11 min-w-24 cursor-pointer rounded-full bg-[#174b40] px-6 text-sm font-extrabold text-[#fffdf5] hover:bg-[#103d34] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Spin!
              </Button>
              <Button
                variant="outline"
                onClick={() => onStartTimer(effectiveTopic)}
                className="h-11 cursor-pointer rounded-full border-[#174b40] bg-transparent px-5 text-sm font-extrabold text-[#174b40] hover:bg-[#eaf0e9] sm:px-7"
              >
                Start Timer →
              </Button>
            </div>
          </div>
          <div className="slot-handle mt-4 hidden lg:flex" aria-hidden="true">
            <Lever onSpin={triggerSpin} disabled={isSpinning} />
          </div>
        </div>

        <div className="mobile-btn-row mt-6 flex justify-center gap-3 sm:hidden">
          <Button
            onClick={() => triggerSpin(30)}
            disabled={isSpinning}
            className="h-11 min-w-24 cursor-pointer rounded-full bg-[#174b40] px-6 text-sm font-extrabold text-[#fffdf5] hover:bg-[#103d34] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Spin!
          </Button>
          <Button
            variant="outline"
            onClick={() => onStartTimer(effectiveTopic)}
            className="h-11 cursor-pointer rounded-full border-[#174b40] bg-transparent px-5 text-sm font-extrabold text-[#174b40] hover:bg-[#eaf0e9]"
          >
            টাইমার →
          </Button>
        </div>

        <p className="mt-6 text-center font-[cursive] text-lg font-extrabold text-[#518174]">
          {effectiveTopic ? (
            <span>
              {currentCategory.id !== 'random' && <span className="text-[#e6a446]">{currentCategory.label}: </span>}
              {effectiveTopic.topic}
            </span>
          ) : (
            <span>লিভার টানো বা Spin চাপো 👇</span>
          )}
        </p>
      </div>

      <div className="hidden lg:block" />
    </section>
  );
}