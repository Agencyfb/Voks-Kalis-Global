"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star, ThumbsUp } from "lucide-react";

const TESTIMONIALS = [
  {
    image: "/testimonial-jennifer.jpg",
    imageAlt: "Mrs Jennifer seated at her desk",
    name: "Mrs Jennifer",
    detail: "Acquired 2 lots through us",
    quote:
      "Buying my first home was easier than I imagined. The team was professional, supportive, and guided me through every step. I’m grateful for their excellent service!",
  },
  {
    image: "/testimonial-ebuka.jpg",
    imageAlt: "Mr Ebuka wearing a red cap",
    name: "Mr Ebuka",
    detail: "Bought land",
    quote:
      "I never thought finding my dream home could be this seamless. Their team made the experience enjoyable, stress-free, and memorable.",
  },
  {
    image: "/testimonial-tony.jpg",
    imageAlt: "Engr. Tony smiling for a portrait",
    name: "Engr. Tony",
    detail: "Bought land",
    quote:
      "Their attention to detail and commitment to customer satisfaction were impressive. They understood exactly what I wanted and helped me find the perfect property.",
  },
];

export default function Testimonials() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  function showPrevious() {
    setHasNavigated(true);
    setActiveIndex((index) => (index - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  function showNext() {
    setHasNavigated(true);
    setActiveIndex((index) => (index + 1) % TESTIMONIALS.length);
  }

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-label="Client testimonials"
      data-visible={isInView}
      className="overflow-hidden bg-white px-5 py-8 sm:px-8 lg:px-0 lg:py-0"
    >
      <div
        className="relative mx-auto w-full max-w-[1200px] overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
      >
        <div
          className="flex transition-transform duration-500 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <article
              key={testimonial.name}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${TESTIMONIALS.length}`}
              aria-hidden={index !== activeIndex}
              data-slide-entered={hasNavigated && index === activeIndex}
              className="relative h-auto min-h-[790px] w-full shrink-0 overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_55%,#dedede_100%)] sm:h-[820px] lg:h-[675px]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 540 675"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[45%] lg:block"
              >
                <path
                  d="M0 0H270C360 0 425 115 405 260C387 390 290 545 150 635C120 654 90 675 60 675H0Z"
                  fill="#303030"
                />
              </svg>
              <span
                aria-hidden="true"
                className="absolute right-[8%] top-[73px] hidden select-none font-serif text-[190px] font-normal leading-none text-[#F8F1EB] lg:block"
              >
                “
              </span>

              <div               className="absolute left-[5%] top-[48px] z-20 flex h-[82px] w-[205px] items-center bg-[#CB843F] px-7 text-xs font-semibold uppercase leading-tight tracking-wide text-white max-sm:h-[52px] max-sm:w-[170px] max-sm:px-4 max-sm:text-[10px] sm:left-[7%] sm:top-[65px] sm:h-[96px] sm:w-[236px] sm:px-8 lg:left-[5%] lg:top-[100px]">
                What our clients say about us
              </div>

              <img
                src={testimonial.image}
                alt={testimonial.imageAlt}
                className="testimonial-portrait absolute left-[15%] top-[48px] h-[300px] w-[72%] object-cover object-center max-sm:relative max-sm:left-auto max-sm:top-auto max-sm:mx-auto max-sm:mt-[56px] max-sm:block max-sm:h-[260px] max-sm:w-[82%] sm:left-[18%] sm:top-[65px] sm:h-[430px] sm:w-[55%] lg:left-[18.75%] lg:top-[51px] lg:h-[574px] lg:w-[29.7%]"
              />

              <div className="absolute left-[5%] top-[325px] z-10 w-[90%] bg-white px-6 py-7 shadow-[0_18px_50px_rgba(0,0,0,.12)] max-sm:relative max-sm:left-auto max-sm:top-auto max-sm:mx-auto max-sm:mt-0 sm:left-[10%] sm:top-[450px] sm:w-[80%] sm:px-9 sm:py-8 lg:left-[44.75%] lg:top-[164px] lg:min-h-[368px] lg:w-[36.6%] lg:px-10 lg:py-10">
                <h2 className="text-[30px] font-semibold leading-tight text-black sm:text-4xl">
                  {testimonial.name}
                </h2>
                <p className="mt-1 text-sm text-[#666666]">{testimonial.detail}</p>
                <blockquote className="mt-7 text-base leading-relaxed text-[#171717] sm:mt-10 sm:text-lg lg:text-xl">
                  {testimonial.quote}
                </blockquote>
              </div>
            </article>
          ))}
        </div>
        <div className="absolute inset-x-0 top-[690px] flex flex-col items-center gap-4 max-sm:relative max-sm:inset-auto max-sm:mt-12 sm:top-[748px] lg:left-[62.5%] lg:right-[3%] lg:top-[523px] lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <div
            aria-label="Rated 5 out of 5 stars"
            className="flex h-[60px] w-[228px] items-center justify-center gap-1 bg-white text-[#FF7918] sm:h-[75px] sm:w-[228px]"
          >
            {Array.from({ length: 5 }, (_, starIndex) => (
              <Star
                key={starIndex}
                size={29}
                strokeWidth={1.5}
                fill="currentColor"
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="flex w-full items-center justify-between px-5 sm:px-8 lg:w-auto lg:justify-end lg:gap-8 lg:px-0">
            <span className="flex items-center gap-2 text-base font-semibold text-[#242424]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#CB843F] text-white">
                <ThumbsUp size={15} fill="currentColor" aria-hidden="true" />
              </span>
              Testimonial
            </span>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Show previous testimonial"
                className="p-1 text-[#777777] transition-colors hover:text-brand-copper-dark"
              >
                <ArrowLeft size={23} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Show next testimonial"
                className="p-1 text-brand-copper-dark transition-colors hover:text-[#CB843F]"
              >
                <ArrowRight size={23} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          Testimonial {activeIndex + 1} of {TESTIMONIALS.length}
        </p>
      </div>
    </section>
  );
}
