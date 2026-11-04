"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = "main section, main footer";

export default function SectionRevealProvider({ children }) {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.setAttribute("data-scroll-reveal-visible", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" },
    );

    function observeSections(root) {
      if (!(root instanceof Element)) return;

      const sections = [];
      if (root.matches(REVEAL_SELECTOR)) sections.push(root);
      sections.push(...root.querySelectorAll(REVEAL_SELECTOR));

      sections.forEach((section) => {
        if (section.hasAttribute("data-scroll-reveal-ready")) return;

        section.setAttribute("data-scroll-reveal-ready", "true");
        observer.observe(section);
      });
    }

    observeSections(document.body);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(observeSections);
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return children;
}
