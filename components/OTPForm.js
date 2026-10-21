"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Clock, Mail } from "lucide-react";

function OTPForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isExpired, setIsExpired] = useState(false);

  // Timer effect
  React.useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    
    // Only allow single digit
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);
      setErrors("");

      // Auto-focus to next field
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (isExpired) {
      setErrors("OTP has expired. Please request a new one.");
      return;
    }

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrors("Please enter all 6 digits.");
      return;
    }

    // Simulate OTP verification
    if (otpCode === "123456") {
      setSubmitted(true);
    } else {
      setErrors("Invalid OTP. Please try again.");
    }
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setTimeLeft(300);
    setIsExpired(false);
    setErrors("");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (submitted) {
    return (
      <div className="px-6 py-14 text-center sm:px-12 sm:py-20">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream">
          <Check size={25} />
        </span>
        <h2 className="mt-6 font-display text-3xl text-forest">Verification complete.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/65">
          Your account has been verified. Welcome to Haven.
        </p>
        <a href="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream hover:bg-forest/90">
          Open dashboard <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 sm:px-12 sm:py-14">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-clay">Verification</p>
        <h2 className="mt-2 font-display text-3xl text-forest">Enter verification code</h2>
        <p className="mt-2 text-sm text-ink/60">We've sent a 6-digit code to your email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* OTP Input Fields */}
        <div>
          <div className="flex justify-center gap-3 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isExpired}
                className={`h-12 w-12 rounded-lg border text-center text-lg font-semibold sm:h-14 sm:w-14 ${
                  isExpired
                    ? "border-clay/30 bg-clay/5 text-ink/40"
                    : errors
                      ? "border-clay bg-cream text-forest focus:border-clay focus:outline-none"
                      : "border-forest/15 bg-cream text-forest placeholder:text-ink/35 focus:border-gold focus:bg-white focus:outline-none"
                }`}
              />
            ))}
          </div>
          {errors && <p className="mt-3 text-center text-xs text-clay">{errors}</p>}
        </div>

        {/* Timer and Resend */}
        <div className="flex flex-col items-center gap-4">
          <div className={`flex items-center gap-2 text-sm ${isExpired ? "text-clay" : "text-ink/60"}`}>
            <Clock size={16} />
            {isExpired ? (
              <span>Code expired</span>
            ) : (
              <span>Expires in {formatTime(timeLeft)}</span>
            )}
          </div>

          {isExpired && (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-medium text-forest hover:underline"
            >
              Request new code
            </button>
          )}
        </div>

        {/* Email Display */}
        <div className="flex items-center justify-center gap-2 rounded-lg bg-forest/5 px-4 py-3 text-sm text-ink/70">
          <Mail size={16} />
          <span>Didn't receive it? Check your spam folder</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isExpired || otp.some((digit) => !digit)}
          className="w-full rounded-lg bg-forest px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-forest/90 disabled:bg-forest/35 disabled:text-cream/50"
        >
          Verify
        </button>

        {/* Resend Link */}
        {!isExpired && (
          <p className="text-center text-sm text-ink/60">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-forest hover:underline"
            >
              Resend
            </button>
          </p>
        )}
      </form>
    </div>
  );
}

export default OTPForm;
