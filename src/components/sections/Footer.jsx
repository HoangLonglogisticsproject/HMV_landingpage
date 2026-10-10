import { footerLinks } from '@/data/site';

export function Footer() {
  return (
    <footer className="bg-surface-dark px-[30px] py-[100px]">
      <ul className="mb-[50px] flex flex-wrap list-none justify-center">
        {footerLinks.map(link => (
          <li key={link.label} className="mr-[40px] last:mr-0">
            <a href={link.href} className="text-[16px] text-[#eee] no-underline hover:underline">
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <img src="/img/icon.png" alt="Logo" className="mx-auto mb-[50px] block h-[50px]" />

      <p className="text-center text-[14px] text-[#aaa]">
        &copy; Copyright by{' '}
        <a
          href="https://twitter.com/jonasschmedtman"
          target="_blank"
          rel="noreferrer"
          className="text-[14px] text-[#eee] no-underline hover:underline"
        >
          Cody Le
        </a>
      
      </p>
    </footer>
  );
}
