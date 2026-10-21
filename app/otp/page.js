import { ArrowLeft, Home, Lock, Zap } from "lucide-react";
import OTPForm from "@/components/OTPForm";

export const metadata = {
  title: "Verify your account | Haven",
  description: "Enter your verification code to complete your Haven account setup.",
};

export default function OTPPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[0.85fr_1.15fr]">
        <section className="relative hidden overflow-hidden bg-forest p-10 text-cream lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute inset-0 bg-grain opacity-10" />
          <div className="relative">
            <a href="/" className="flex items-center gap-2" aria-label="Haven home">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-forest-dark"><Home size={18} /></span>
              <span className="font-display text-xl font-medium">Haven</span>
            </a>
            <div className="mt-24 max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-gold-light">Secure access</p>
              <h1 className="mt-5 font-display text-5xl leading-[1.08] text-cream xl:text-6xl">Your account is protected with verification.</h1>
              <p className="mt-6 text-sm leading-relaxed text-cream/65">We've sent a verification code to your email. This keeps your Haven account and saved properties secure.</p>
            </div>
          </div>
          <div className="relative grid gap-5 border-t border-cream/15 pt-6 text-sm text-cream/70">
            <div className="flex items-center gap-3"><Lock size={18} className="text-gold" /> Quick and secure verification</div>
            <div className="flex items-center gap-3"><Zap size={18} className="text-gold" /> Instant access once verified</div>
          </div>
        </section>

        <section className="flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <a href="/" className="flex items-center gap-2 text-forest"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-cream"><Home size={18} /></span><span className="font-display text-xl font-medium">Haven</span></a>
            <a href="/register" className="flex items-center gap-1 text-sm text-ink/60"><ArrowLeft size={15} /> Back</a>
          </div>
          <div className="mx-auto w-full max-w-2xl">
            <div className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_24px_70px_-35px_rgba(23,57,46,0.45)]">
              <OTPForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
