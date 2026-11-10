import logo from '@/assets/logohmv.webp';
import Image from '@/lib/image';
// In the first viewport: eager, but low priority, so React 19 does not preload it and it is requested after the page's
// LCP image (measured: lazy started it 180 ms later; eager at normal priority started it together with the LCP image).
export function BrandLogo(){return <Image className="brand-logo" src={logo} alt="HMV Global" width={1536} height={1024} sizes="118px" loading="eager" fetchPriority="low"/>;}
