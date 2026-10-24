import { useLanguage } from '@/context/LanguageContext';

export interface InterviewPanelProps {
  onBack?: () => void;
}

export default function InterviewPanel({ onBack: _onBack }: InterviewPanelProps = {}) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 rounded-full border-2 border-[#e6a446] px-6 py-2 font-display text-lg font-bold uppercase tracking-widest text-[#e6a446]">
        {t('শীঘ্রই আসছে', 'Coming Soon')}
      </div>
      <h2 className="font-display text-[clamp(30px,4vw,48px)] font-bold leading-[1.1] text-[#075345]">
        {t(
          'ইন্টারভিউয়ে গলা ফাটানোর প্রস্তুতি',
          'Mock Interview Prep: Spitfire Mode'
        )}
      </h2>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-[#41796e] sm:text-lg">
        {t(
          'STAR, PREP, PPF ও MECE — কেস স্টাডি থেকে আচরণগত প্রশ্ন পর্যন্ত টপিক ইঞ্জিন ও টাইমার নিয়ে পূর্ণাঙ্গ ইন্টারভিউ প্র্যাকটিস শীঘ্রই আসছে। আপাতত যা তা টপিক ট্যাবে লিভার টেনে চর্চা করুন।',
          'STAR, PREP, PPF & MECE frameworks — comprehensive mock interview drills with dynamic prompts and timers are coming soon. For now, pull the lever in the Wild Impromptu tab and warm up!'
        )}
      </p>
    </div>
  );
}
