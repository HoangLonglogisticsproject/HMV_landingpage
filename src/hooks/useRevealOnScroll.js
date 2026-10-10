import { useEffect, useRef, useState } from 'react';

/**
 * Thay cho IntersectionObserver "revealSection" trong script.js:
 * phần tử mờ + trượt lên khi cuộn tới, chỉ chạy một lần.
 */
export function useRevealOnScroll({ threshold = 0.15 } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        obs.unobserve(entry.target);
      },
      { root: null, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
