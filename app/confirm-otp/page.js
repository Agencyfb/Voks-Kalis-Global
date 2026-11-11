import { ArrowLeft, Home, LockKeyhole, ShieldCheck } from "lucide-react";
import ConfirmOTPForm from "@/components/ConfirmOTPForm";

export const metadata = {
  title: "Confirm reset code | Voks-Kalis Global",
  description: "Verify your password reset code and set a new password.",
};

export default function ConfirmOTPPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[0.85fr_1.15fr]">
        <section className="relative hidden overflow-hidden bg-forest p-10 text-cream lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute inset-0 bg-grain opacity-10" />
          <div className="relative">
            <a href="/" className="flex items-center gap-2" aria-label="Voks-Kalis Global home">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-forest-dark"><Home size={18} /></span>
              <span className="font-display text-xl font-medium">Voks-Kalis Global</span>
            </a>
            <div className="mt-24 max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-gold-light">Secure access</p>
              <h1 className="mt-5 font-display text-5xl leading-[1.08] text-cream xl:text-6xl">A quick check, then you&apos;re back in.</h1>
              <p className="mt-6 text-sm leading-relaxed text-cream/65">Confirm the one-time code from your email, then choose a new password.</p>
            </div>
          </div>
          <div className="relative grid gap-5 border-t border-cream/15 pt-6 text-sm text-cream/70">
            <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-gold" /> A time-limited verification code</div>
            <div className="flex items-center gap-3"><LockKeyhole size={18} className="text-gold" /> A secure password reset</div>
          </div>
        </section>

        <section className="flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <a href="/" className="flex items-center gap-2 text-forest">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-cream"><Home size={18} /></span>
              <span className="font-display text-xl font-medium">Voks-Kalis Global</span>
            </a>
            <a href="/forgot-password" className="flex items-center gap-1 text-sm text-ink/60"><ArrowLeft size={15} /> Back</a>
          </div>
          <div className="mx-auto w-full max-w-lg">
            <div className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_24px_70px_-35px_rgba(23,57,46,0.45)]">
              <ConfirmOTPForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
