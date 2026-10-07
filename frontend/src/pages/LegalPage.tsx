import { useSeo } from "../useSeo";
import { LEGAL_DESCRIPTION, LEGAL_TITLE } from "../seo";

const OWNER = "Okan Altun";
const TOWN = "Vienna";
const EMAIL = "hey@pickup.moe";

const link = "text-sumi hover:text-jump underline underline-offset-4";

export default function LegalPage() {
  useSeo({
    title: LEGAL_TITLE,
    description: LEGAL_DESCRIPTION,
    canonical: "/legal",
    noindex: true,
  });
  return (
    <main className="max-w-2xl mx-auto px-6 pt-12 pb-0">
      <h1 className="font-display text-title text-sumi">Legal</h1>

      <h2 className="font-display text-section text-sumi mt-12">Imprint</h2>
      <p className="font-mono text-xs tracking-widest text-ash mt-2">
        OFFENLEGUNG GEMÄSS § 25 MEDIENGESETZ
      </p>

      <dl className="mt-6 space-y-4 font-body text-base text-sumi/80 leading-relaxed">
        <div>
          <dt className="font-mono text-xs tracking-widest text-ash">
            MEDIA OWNER
          </dt>
          <dd className="mt-1">
            {OWNER}, {TOWN}, Austria
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs tracking-widest text-ash">
            CONTACT
          </dt>
          <dd className="mt-1">
            <a href={`mailto:${EMAIL}`} className={link}>
              {EMAIL}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs tracking-widest text-ash">
            PURPOSE
          </dt>
          <dd className="mt-1">
            A private, non-commercial website that shows where to continue
            reading a manga after its anime adaptation.
          </dd>
        </div>
      </dl>

      <h2 className="font-display text-section text-sumi mt-16">
        Privacy policy
      </h2>

      <div className="mt-6 space-y-6 font-body text-base text-sumi/80 leading-relaxed">
        <p>
          The person responsible for this website is {OWNER}, {TOWN}, Austria.
          You can reach me at{" "}
          <a href={`mailto:${EMAIL}`} className={link}>
            {EMAIL}
          </a>
          .
        </p>

        <p>
          pickup has no accounts, sets no cookies and does not track you across
          sites. Still, any website needs a few services to reach you, and those
          see some data. This is all of it.
        </p>
      </div>

      <h3 className="font-body font-semibold text-base text-sumi mt-10">
        Hosting
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        The site is served by Vercel Inc. (USA). To deliver a page, Vercel
        processes your IP address, your browser and device details and the
        address you requested, and keeps short-lived server logs for security
        and troubleshooting.
      </p>

      <h3 className="font-body font-semibold text-base text-sumi mt-8">
        Series data
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        Your browser loads the series data from api.pickup.moe, which runs on
        Railway (Railway Corporation, USA). To block abuse, your IP address is
        held in memory for up to a minute to count requests. It is not written
        to a database or log.
      </p>

      <h3 className="font-body font-semibold text-base text-sumi mt-8">
        Cover images
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        Covers are delivered by Cloudinary Inc. (USA), which receives your IP
        address and browser details like any image host does.
      </p>

      <h3 className="font-body font-semibold text-base text-sumi mt-8">
        Visitor statistics
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        To see which pages get used, the site runs Vercel Web Analytics. It
        counts page views with the page address, the referring site, your
        country and your browser, operating system and device type. It sets no
        cookies. Visits are told apart by a hash of the request that is thrown
        away after 24 hours, so you can't be recognised on a later day or on
        other websites.
      </p>

      <h3 className="font-body font-semibold text-base text-sumi mt-8">
        Fonts
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        All fonts are served from pickup.moe itself. Nothing is loaded from
        Google or other font services.
      </p>

      <h3 className="font-body font-semibold text-base text-sumi mt-8">
        Browser storage
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        So the list is where you left it when you come back from a series, the
        site saves your scroll position in your browser's session storage. It
        never leaves your device and is gone when you close the tab.
      </p>

      <h3 className="font-body font-semibold text-base text-sumi mt-8">
        Links to other sites
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        Reading links, GitHub, MyAnimeList and MangaDex are only contacted when
        you click a link to them. From then on their own privacy policies apply.
        Issues you open on GitHub are public.
      </p>

      <h3 className="font-body font-semibold text-base text-sumi mt-8">
        Contact
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        If you email me, I use your address and message only to answer you and
        delete them once the conversation is over.
      </p>

      <h3 className="font-body font-semibold text-base text-sumi mt-8">
        Legal basis and transfers
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        The processing above is based on Art. 6(1)(f) GDPR, the legitimate
        interest in running a working and secure website. Transfers to the USA
        rely on the EU-US Data Privacy Framework where the provider is
        certified, and on the European Commission's standard contractual clauses
        otherwise.
      </p>

      <h3 className="font-body font-semibold text-base text-sumi mt-8">
        Your rights
      </h3>
      <p className="mt-2 font-body text-base text-sumi/80 leading-relaxed">
        You have the right to access, rectification, erasure, restriction of
        processing, data portability and to object (Art. 15 to 21 GDPR). Just
        write to{" "}
        <a href={`mailto:${EMAIL}`} className={link}>
          {EMAIL}
        </a>
        . You can also complain to the Austrian Data Protection Authority
        (Datenschutzbehörde, Barichgasse 40-42, 1030 Vienna,{" "}
        <a
          href="https://www.dsb.gv.at"
          target="_blank"
          rel="noreferrer"
          className={link}
        >
          dsb.gv.at
        </a>
        ).
      </p>

      <p className="font-mono text-xs tracking-widest text-ash mt-12">
        LAST UPDATED OCTOBER 2026
      </p>
    </main>
  );
}
