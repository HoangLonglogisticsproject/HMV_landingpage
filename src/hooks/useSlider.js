import { useCallback, useEffect, useState } from 'react';

/**
 * Logic của slider: chuyển slide vòng tròn + điều khiển bằng phím mũi tên.
 */
export function useSlider(slideCount) {
  const [curSlide, setCurSlide] = useState(0);

  const goToSlide = useCallback(
    slide => setCurSlide(((slide % slideCount) + slideCount) % slideCount),
    [slideCount]
  );
  const nextSlide = useCallback(() => goToSlide(curSlide + 1), [curSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(curSlide - 1), [curSlide, goToSlide]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return { curSlide, goToSlide, nextSlide, prevSlide };
}
