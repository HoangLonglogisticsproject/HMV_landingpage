import { useEffect, useState } from 'react';

/**
 * Thay cho IntersectionObserver "stickyNav": nav dính lên đầu trang
 * ngay khi header cuộn khỏi màn hình.
 */
export function useStickyNav(headerRef, navHeight = 90) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { root: null, threshold: 0, rootMargin: `-${navHeight}px` }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [headerRef, navHeight]);

  return isSticky;
}
