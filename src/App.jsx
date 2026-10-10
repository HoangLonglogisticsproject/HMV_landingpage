import { useRef } from 'react';
import { Header } from '@/components/sections/Header';
import { Features } from '@/components/sections/Features';
import { Operations } from '@/components/sections/Operations';
import { Testimonials } from '@/components/sections/Testimonials';
import { SignUp } from '@/components/sections/SignUp';
import { Footer } from '@/components/sections/Footer';
import { SignupModal } from '@/components/sections/SignupModal';
import { ModalProvider } from '@/context/ModalContext';
import { useStickyNav } from '@/hooks/useStickyNav';

export default function App() {
  const headerRef = useRef(null);
  const isSticky = useStickyNav(headerRef);

  return (
    <ModalProvider>
      <Header ref={headerRef} isSticky={isSticky} />
      <Features />
      <Operations />
      <Testimonials />
      <SignUp />
      <Footer />
      <SignupModal />
    </ModalProvider>
  );
}
