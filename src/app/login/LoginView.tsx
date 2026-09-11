"use client";

import { useLogin } from "./hooks/useLogin";
import type { LoginViewProps } from "./types";

export const LoginView = ({ steps }: LoginViewProps) => {
  const { handleGoogleLogin, loading, error } = useLogin();

  return (
    <main className="flex min-h-screen flex-col md:flex-row" style={{ background: "var(--ab-bg)" }}>
      <div className="flex flex-1 flex-col justify-center gap-5 px-6 py-14 md:gap-[26px] md:px-16 md:py-16">
        <div className="flex items-center gap-[11px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" className="h-8 w-8 md:h-[38px] md:w-[38px]" />
          <span
            className="text-[15px] font-extrabold tracking-[-0.01em] md:text-[17px]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ab-ink)" }}
          >
            ART BATTLE
          </span>
        </div>

        <h1
          className="text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] md:text-[40px] md:leading-[1.08] md:tracking-[-0.03em]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ab-ink)" }}
        >
          Заходи —
          <br />
          <span style={{ color: "var(--ab-mint)" }}>будем рисовать.</span>
        </h1>

        <p
          className="max-w-[400px] text-[15px] font-medium leading-[1.55]"
          style={{ color: "rgba(255,246,238,.62)" }}
        >
          Один аккаунт на всё: рейтинг, ваши работы и уровень. Регистрация не нужна — просто
          войдите через Google.
        </p>

        <div className="flex flex-col items-start gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="ab-btn ab-btn-primary w-full md:w-auto md:self-start"
            style={loading ? { opacity: 0.7 } : undefined}
          >
            {loading ? "Открываем Google…" : "Войти через Google"}
          </button>

          {error && (
            <div className="flex flex-wrap items-center gap-3 rounded-[14px] px-4 py-3" style={{ background: "rgba(255,47,126,.12)", border: "2px solid rgba(255,47,126,.35)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--ab-ink)" }}>
                Не получилось войти. Попробуйте ещё раз.
              </span>
              <button
                onClick={handleGoogleLogin}
                className="ab-btn ab-btn-secondary !px-4 !py-2 text-[13px]"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </div>

        <p
          className="max-w-[380px] text-[13px] font-medium leading-[1.5]"
          style={{ color: "rgba(255,246,238,.58)" }}
        >
          Входя, вы соглашаетесь с правилами игры. Мы берём только имя и аватар.
        </p>
      </div>

      <div className="flex flex-col justify-center gap-4 border-t-2 border-[rgba(255,255,255,.1)] px-6 py-10 md:w-[520px] md:gap-[22px] md:border-l-2 md:border-t-0 md:px-12 md:py-16">
        <span
          className="w-fit -rotate-2 rounded-full px-3.5 py-[7px] text-[11px] font-extrabold tracking-[0.12em] text-white"
          style={{ background: "var(--ab-violet)", fontFamily: "var(--font-sans)" }}
        >
          КАК ЭТО РАБОТАЕТ
        </span>

        {steps.map((step) => (
          <div
            key={step.n}
            className="flex items-center gap-4 rounded-[18px] px-4 py-3.5 md:px-[18px] md:py-4"
            style={step.card}
          >
            <div
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[14px] text-[17px] font-extrabold md:h-10 md:w-10"
              style={{ background: step.tile, color: step.tileText, fontFamily: "var(--font-display)" }}
            >
              {step.n}
            </div>
            <div>
              <p className="text-[15px] font-extrabold" style={{ color: "var(--ab-ink)" }}>
                {step.title}
              </p>
              <p className="mt-[7px] text-[13px] font-semibold leading-[1.4]" style={{ color: "rgba(255,246,238,.5)" }}>
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
