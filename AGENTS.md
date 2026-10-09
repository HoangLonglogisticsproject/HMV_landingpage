<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep commercial catalog data and specification fields in a shared browser-safe module so visible product details and structured data stay consistent.
- Keep the scroll-driven Three.js experience lazy-loaded and client-only while the commercial landing page remains server-rendered for search accessibility.
- RFQs are insert-only for public visitors, with validation and a database submission limit; never expose customer inquiries through public reads.
- Mount the shared site header in the root layout so home and editorial pages share navigation.
- Keep editorial content in a browser-safe module with topic tabs and individual slug routes so each article is linkable, server-rendered and has matching metadata.
- Use a sticky client-only world scene with shared scroll progress and chapter data so the farming-to-global journey preserves readable server-rendered trading content.
