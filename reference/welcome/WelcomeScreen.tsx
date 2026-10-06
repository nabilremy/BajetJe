// WelcomeScreen.tsx: reference implementation (React + CSS). Adapt to the project's stack, keep behaviour identical.
import { useLayoutEffect, useRef, useState } from "react";
import { WelcomeDoodle } from "./WelcomeDoodle";
import "./welcome.css";
// import LogoMark from "../brand/logo/bajetje-mark-on-dark.svg?react";   // or your SVG loader
// import InfoIcon / ShieldIcon from brand/icons (fill currentColor)

type Lang = "en" | "ms";
const T = {
  en: { title: "Know what your gaji can do.", lede: "Enter your salary once. BajetJe works out your daily budget, checks your commitments, and shows what car or home fits.",
        discTitle: "Estimates only, not financial advice",
        disc: "BajetJe is a planning tool, not a licensed financial adviser. Numbers are estimates based on public guidelines (EPF, LHDN, BNM). Check big decisions with your bank or a licensed financial planner.",
        cta: "I understand, let's start", privacy: "Your salary never leaves this phone", lang: "Language",
        doodle: "Three young workers thinking about their salary, budget and savings" },
  ms: { title: "Tengok gaji awak boleh buat apa.", lede: "Isi gaji sekali je. BajetJe kira bajet harian, semak komitmen, dan tunjuk kereta atau rumah yang padan.",
        discTitle: "Anggaran je, bukan nasihat kewangan",
        disc: "BajetJe ni alat merancang, bukan penasihat kewangan berlesen. Semua nombor anggaran ikut garis panduan awam (KWSP, LHDN, BNM). Keputusan besar, tanya bank atau perancang kewangan berlesen dulu ya.",
        cta: "Faham, jom mula!", privacy: "Gaji awak tak pernah keluar dari telefon ni", lang: "Bahasa",
        doodle: "Tiga pekerja muda fikir pasal gaji, bajet dan simpanan" },
} as const;

export function WelcomeScreen({ lang, onLangChange, onStart }: { lang: Lang; onLangChange: (l: Lang) => void; onStart: () => void }) {
  const t = T[lang];
  const root = useRef<HTMLDivElement>(null);
  const [swap, setSwap] = useState(false);
  const first = useRef(true);
  useLayoutEffect(() => {                      // language changed: header stays, rest fades up
    if (first.current) { first.current = false; return; }
    setSwap(false); requestAnimationFrame(() => setSwap(true));
    const id = setTimeout(() => setSwap(false), 1000); return () => clearTimeout(id);
  }, [lang]);
  return (
    <main ref={root} className={`welcome${swap ? " lang-swap" : ""}`}>
      <div className="top keep" data-r style={{ ["--i" as any]: 0 }}>
        {/* <LogoMark width={34} height={34} aria-hidden /> */}
        <span className="wordmark">Bajet<b>Je</b></span>
        <span className="grow" />
        <div className="lang" role="group" aria-label={t.lang} style={{ ["--i" as any]: lang === "ms" ? 1 : 0 }}>
          <button aria-pressed={lang === "en"} onClick={() => onLangChange("en")}>EN</button>
          <button aria-pressed={lang === "ms"} onClick={() => onLangChange("ms")}>BM</button>
        </div>
      </div>
      <div className="doodle" data-r style={{ ["--i" as any]: 1 }}><WelcomeDoodle title={t.doodle} /></div>
      <section data-r style={{ ["--i" as any]: 2 }}><h1>{t.title}</h1><p className="lede">{t.lede}</p></section>
      <div className="disclaimer" data-r style={{ ["--i" as any]: 3 }}>
        {/* <InfoIcon aria-hidden /> */}
        <div><div className="title">{t.discTitle}</div><div className="body">{t.disc}</div></div>
      </div>
      <div className="grow" />
      <div className="cta" data-r style={{ ["--i" as any]: 4 }}>
        <button className="btn-primary" onClick={onStart}>{t.cta}</button>
        <div className="privacy">{/* <ShieldIcon width={14} height={14} aria-hidden /> */}<span>{t.privacy}</span></div>
      </div>
    </main>
  );
}
