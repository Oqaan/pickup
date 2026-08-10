import { Link } from "react-router-dom";
import { useTitle } from "../useTitle";

export default function NotFoundPage() {
  useTitle("Not found - pickup");
  return (
    <main className="max-w-2xl mx-auto px-6 pt-12 sm:pt-20 pb-0">
      <p className="font-mono text-xs tracking-widest text-ash">404</p>
      <h1 className="font-display text-notice text-sumi mt-3">
        This page does not exist
      </h1>
      <p className="font-body text-base text-sumi/70 mt-4 max-w-md leading-relaxed">
        The link might be broken, or the page may have been moved.
      </p>
      <Link
        to="/"
        className="inline-block mt-8 font-mono text-xs tracking-widest text-sumi hover:text-jump"
      >
        BACK TO SEARCH
      </Link>
    </main>
  );
}
