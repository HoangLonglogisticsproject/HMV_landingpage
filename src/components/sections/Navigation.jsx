import { Button } from '@/components/ui/button';
import { useModal } from '@/context/ModalContext';
import { navLinks } from '@/data/site';
import { scrollToSection } from '@/lib/scroll';
import { cn } from '@/lib/utils';

/**
 * Thanh điều hướng: cuộn mượt tới section (event delegation trước đây
 * nay chỉ là onClick trên từng link), hiệu ứng mờ các mục còn lại khi
 * hover (class .nav-fade trong index.css) và trạng thái sticky.
 */
export function Navigation({ isSticky }) {
  const { openModal } = useModal();

  const handleClick = (e, href) => {
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <nav
      className={cn(
        'nav-fade z-100 flex h-[90px] w-full items-center justify-between px-[30px] lg:px-[60px]',
        isSticky && 'fixed top-0 bg-white/95'
      )}
    >
      <img
        src="/img/logo.png"
        alt="Bankist logo"
        className="nav-fade-item h-[45px] transition-all duration-300"
      />

      <ul className="flex list-none items-center">
        {navLinks.map(link => (
          <li key={link.href} className="ml-[20px] lg:ml-[40px]">
            <a
              href={link.href}
              onClick={e => handleClick(e, link.href)}
              className="nav-fade-item block text-[17px] font-normal text-inherit no-underline transition-all duration-300"
            >
              {link.label}
            </a>
          </li>
        ))}

        <li className="ml-[20px] lg:ml-[40px]">
          <Button
            variant="brand"
            size="pill-sm"
            onClick={openModal}
            className="nav-fade-item transition-all duration-300"
          >
            Open account
          </Button>
        </li>
      </ul>
    </nav>
  );
}
