/** Cuộn mượt tới một section theo selector (#section--1, ...). */
export function scrollToSection(href) {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
}
