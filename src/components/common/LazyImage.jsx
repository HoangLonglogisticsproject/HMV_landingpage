import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Lazy loading ảnh: hiện ảnh placeholder đã làm mờ, chỉ tải ảnh thật
 * khi sắp lọt vào viewport (rootMargin 200px), rồi bỏ blur khi load xong.
 */
export function LazyImage({ src, placeholder, alt, className, ...props }) {
  const imgRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        obs.unobserve(entry.target);
      },
      { root: null, threshold: 0, rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={shouldLoad ? src : placeholder}
      alt={alt}
      onLoad={() => shouldLoad && setIsLoaded(true)}
      className={cn('w-full transition-[filter] duration-500', !isLoaded && 'blur-[20px]', className)}
      {...props}
    />
  );
}
