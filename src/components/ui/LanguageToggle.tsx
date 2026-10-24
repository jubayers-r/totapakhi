import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selector"
      className="inline-flex items-center rounded-full bg-[rgba(26,60,52,0.08)] p-[3px] text-xs font-semibold text-[#1a3c34] shadow-[inset_0_1px_2px_rgba(26,60,52,0.08)]"
    >
      <button
        type="button"
        onClick={() => setLang('bn')}
        className={`rounded-full px-2.5 py-1 transition-all ${
          lang === 'bn'
            ? 'bg-[#f9f5eb] text-[#1a3c34] shadow-[0_1px_4px_rgba(26,60,52,0.18)] font-bold'
            : 'text-[#1a3c34]/70 hover:text-[#1a3c34]'
        }`}
      >
        বাং
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`rounded-full px-2.5 py-1 transition-all ${
          lang === 'en'
            ? 'bg-[#f9f5eb] text-[#1a3c34] shadow-[0_1px_4px_rgba(26,60,52,0.18)] font-bold'
            : 'text-[#1a3c34]/70 hover:text-[#1a3c34]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
