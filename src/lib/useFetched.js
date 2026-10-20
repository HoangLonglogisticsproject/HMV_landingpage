import { useEffect, useState } from 'react';

// `vite --mode cms` / `vite build --mode cms` (.env.cms) switch CMS-backed content on (EcoNews, About).
// Every other build, production included, renders the bundled content in src/data, and the CMS client is
// tree-shaken out. With the CMS on there is no fallback to bundled content: failures render error states.
export const CMS_CONTENT = import.meta.env.VITE_CMS_CONTENT === 'true';

/** Runs `load` whenever `key` changes; `{ status: 'loading' }` until it settles, aborted when superseded. */
export function useFetched(key, load) {
  const [state, setState] = useState({ key: null });
  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal).then(
      result => { if (!ctrl.signal.aborted) setState({ key, ...result }); },
      error => { if (!ctrl.signal.aborted) setState({ key, status: 'error', error }); },
    );
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` encodes every input of `load`
  }, [key]);
  return state.key === key ? state : { status: 'loading' };
}
