import { createFileRoute, redirect } from '@tanstack/react-router';

// "/" is a permanent single-hop redirect to the English default; no browser-language or IP redirects.
export const Route = createFileRoute('/')({
  beforeLoad: () => { throw redirect({ to: '/$lang', params: { lang: 'en' }, statusCode: 301 }); },
});
