import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto min-h-[70vh] w-[calc(100%-2rem)] max-w-[1100px] py-8 pb-16">
      <div className="rounded-[10px] border-2 border-dashed border-line bg-white px-4 py-12 text-center text-muted">
        <h2>Page not found</h2>
        <p>The page you are looking for does not exist or was moved.</p>
        <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 font-semibold text-white no-underline transition hover:bg-brand-dark">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
