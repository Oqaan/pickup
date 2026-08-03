import { Link } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-tone">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-xl text-sumi hover:text-jump"
          >
            pickup
          </Link>
          <a
            href="https://github.com/Oqaan/pickup"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs tracking-widest text-tone hover:text-jump"
          >
            GITHUB
          </a>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-tone mt-32">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div>
              <p className="font-body text-sm text-sumi leading-relaxed">
                pickup tells you which manga chapter to start from once you stop
                watching the anime.
              </p>
              <p className="font-mono text-xs text-tone mt-4">
                Built by{" "}
                <a
                  href="https://github.com/Oqaan"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sumi hover:text-jump"
                >
                  Okan
                </a>
              </p>
            </div>

            <div>
              <p className="font-mono text-xs tracking-widest text-tone">
                SOURCES
              </p>
              <ul className="mt-3 space-y-2 font-body text-sm text-sumi/70">
                <li>Chapter data checked by hand against series wikis</li>
                <li>
                  Cover art from{" "}
                  <a
                    href="https://mangadex.org"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sumi hover:text-jump"
                  >
                    MangaDex
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs tracking-widest text-tone">
                CONTRIBUTE
              </p>
              <ul className="mt-3 space-y-2 font-body text-sm">
                <li>
                  <a
                    href="https://github.com/Oqaan/pickup/issues/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sumi hover:text-jump"
                  >
                    Report a wrong chapter
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Oqaan/pickup/issues/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sumi hover:text-jump"
                  >
                    Suggest a series
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <p className="font-mono text-xs text-tone mt-12 pt-6 border-t border-tone/50">
            © 2026 pickup · No manga content is hosted here
          </p>
        </div>
      </footer>
    </div>
  );
}
