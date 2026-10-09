import { createFileRoute, redirect } from '@tanstack/react-router';

// Legacy URL, permanently moved to the English locale.
export const Route = createFileRoute('/insights/$slug')({
  beforeLoad: ({ params }) => { throw redirect({ to: '/$lang/insights/$slug', params: { lang: 'en', slug: params.slug }, statusCode: 301 }); },
});
