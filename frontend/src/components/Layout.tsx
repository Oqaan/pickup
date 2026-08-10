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
            aria-label="GitHub repository"
            className="text-ash hover:text-jump"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.41 1.02 0 2.04.14 3 .41 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
            </svg>
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
              <p className="font-mono text-xs text-ash mt-4">
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
              <p className="font-mono text-xs tracking-widest text-ash">
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
                <li>
                  Popularity from{" "}
                  <a
                    href="https://anilist.co"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sumi hover:text-jump"
                  >
                    AniList
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs tracking-widest text-ash">
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
                <li>
                  <a
                    href="mailto:hey@pickup.moe"
                    className="text-sumi hover:text-jump"
                  >
                    Contact me
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="font-mono text-xs text-ash mt-12 pt-6 border-t border-tone/50 flex flex-wrap gap-x-3 gap-y-2">
            <span>© 2026 pickup</span>
            <span>·</span>
            <Link to="/about" className="hover:text-jump">
              About
            </Link>
            <span>·</span>
            <span>No manga content is hosted here</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
