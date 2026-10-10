/**
 * Toàn bộ nội dung tĩnh của trang được gom về một chỗ,
 * các component chỉ lo phần hiển thị.
 */

export const navLinks = [
  { label: 'Features', href: '#section--1' },
  { label: 'Operations', href: '#section--2' },
  { label: 'Testimonials', href: '#section--3' },
];

export const features = [
  {
    id: 'digital',
    icon: 'monitor',
    title: '100% digital bank',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde alias sint quos? Accusantium a fugiat porro reiciendis saepe quibusdam debitis ducimus.',
    image: { src: '/img/digital.jpg', placeholder: '/img/digital-lazy.jpg', alt: 'Computer' },
    imageFirst: true,
  },
  {
    id: 'grow',
    icon: 'trending-up',
    title: 'Watch your money grow',
    text: 'Nesciunt quos autem dolorum voluptates cum dolores dicta fuga inventore ab? Nulla incidunt eius numquam sequi iste pariatur quibusdam!',
    image: { src: '/img/grow.jpg', placeholder: '/img/grow-lazy.jpg', alt: 'Plant' },
    imageFirst: false,
  },
  {
    id: 'card',
    icon: 'credit-card',
    title: 'Free debit card included',
    text: 'Quasi, fugit in cumque cupiditate reprehenderit debitis animi enim eveniet consequatur odit quam quos possimus assumenda dicta fuga inventore ab.',
    image: { src: '/img/card.jpg', placeholder: '/img/card-lazy.jpg', alt: 'Credit card' },
    imageFirst: true,
  },
];

export const operations = [
  {
    id: 'transfers',
    number: '01',
    label: 'Instant Transfers',
    icon: 'upload',
    iconClassName: 'bg-accent-cyan-soft fill-accent-cyan-dark',
    title: 'Tranfser money to anyone, instantly! No fees, no BS.',
    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    id: 'loans',
    number: '02',
    label: 'Instant Loans',
    icon: 'home',
    iconClassName: 'bg-brand-soft fill-brand',
    title: 'Buy a home or make your dreams come true, with instant loans.',
    text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    id: 'closing',
    number: '03',
    label: 'Instant Closing',
    icon: 'user-x',
    iconClassName: 'bg-accent-navy-soft fill-deep-blue',
    title: 'No longer need your account? No problem! Close it instantly.',
    text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

export const testimonials = [
  {
    id: 'aarav',
    title: 'Best financial decision ever!',
    text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusantium quas quisquam non? Quas voluptate nulla minima deleniti optio ullam nesciunt, numquam corporis et asperiores laboriosam sunt, praesentium suscipit blanditiis. Necessitatibus id alias reiciendis, perferendis facere pariatur dolore veniam autem esse non voluptatem saepe provident nihil molestiae.',
    author: { name: 'Aarav Lynn', location: 'San Francisco, USA', photo: '/img/user-1.jpg' },
  },
  {
    id: 'miyah',
    title: 'The last step to becoming a complete minimalist',
    text: 'Quisquam itaque deserunt ullam, quia ea repellendus provident, ducimus neque ipsam modi voluptatibus doloremque, corrupti laborum. Incidunt numquam perferendis veritatis neque repellendus. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo deserunt exercitationem deleniti.',
    author: { name: 'Miyah Miles', location: 'London, UK', photo: '/img/user-2.jpg' },
  },
  {
    id: 'francisco',
    title: 'Finally free from old-school banks',
    text: 'Debitis, nihil sit minus suscipit magni aperiam vel tenetur incidunt commodi architecto numquam omnis nulla autem, necessitatibus blanditiis modi similique quidem. Odio aliquam culpa dicta beatae quod maiores ipsa minus consequatur error sunt, deleniti saepe aliquid quos inventore sequi. Necessitatibus id alias reiciendis, perferendis facere.',
    author: { name: 'Francisco Gomes', location: 'Lisbon, Portugal', photo: '/img/user-3.jpg' },
  },
];

export const footerLinks = [
  'About',
  'Pricing',
  'Terms of Use',
  'Privacy Policy',
  'Careers',
  'Blog',
  'Contact Us',
].map(label => ({ label, href: '#' }));
