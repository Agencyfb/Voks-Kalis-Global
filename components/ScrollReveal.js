"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({ children, className = "" }) {
  const elementRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    setIsReady(true);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      data-ready={isReady}
      data-visible={isVisible}
      className={`mobile-scroll-reveal ${className}`}
    >
      {children}
    </div>
  );
}
