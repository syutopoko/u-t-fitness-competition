"use client";

import { t } from "@/lib/constants";
import { useAuth } from "./auth-provider";

export function LanguageToggle() {
  const { language, setLanguage } = useAuth();

  return (
    <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-xs font-bold">
      <button
        className={`rounded-md px-3 py-2 transition ${
          language === "ja" ? "bg-white text-sport-dark shadow-sm" : "text-slate-500"
        }`}
        onClick={() => void setLanguage("ja")}
        type="button"
      >
        {t.japanese[language]}
      </button>
      <button
        className={`rounded-md px-3 py-2 transition ${
          language === "en" ? "bg-white text-sport-dark shadow-sm" : "text-slate-500"
        }`}
        onClick={() => void setLanguage("en")}
        type="button"
      >
        {t.english[language]}
      </button>
    </div>
  );
}
