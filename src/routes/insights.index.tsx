import { createFileRoute, redirect } from '@tanstack/react-router';

// Legacy URL, permanently moved to the English locale.
export const Route = createFileRoute('/insights/')({
  beforeLoad: () => { throw redirect({ to: '/$lang/insights', params: { lang: 'en' }, statusCode: 301 }); },
});
