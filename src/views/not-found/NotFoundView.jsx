// 404 body, shared by both builds: no site chrome, one heading and a link home.
export function NotFoundView({ title, homeHref }) {
  return (
    <div className="not-found">
      <h1>{title}</h1>
      <a href={homeHref}>HMV Global →</a>
    </div>
  );
}
