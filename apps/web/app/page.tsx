import { DashboardPreview } from './dashboard-preview';
import { FooterWordmark } from './footer-wordmark';
import { HeaderBorder } from './header-border';
import { HeroVideo } from './hero/video/hero-video';
import { Wordmark } from './logo';

// Under xl the copy column would leave the video too narrow to read, so it stacks below instead
const heroVideoPlacement = 'mx-auto max-w-hero-video-stacked xl:max-w-hero-video';
const footerLink = 'dispatch-transition text-meta text-text-secondary hover:text-text-primary';

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-chip bg-text-primary px-4 py-2 text-meta text-text-inverse focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-10 bg-canvas">
        <nav className="mx-auto flex h-16 max-w-marketing-wide items-center px-5 lg:px-6">
          <a href="/" aria-label="Dispatch home">
            <Wordmark className="w-28 text-text-primary" />
          </a>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/login"
              className="dispatch-transition flex h-control-sm items-center whitespace-nowrap rounded-chip px-3 text-body text-text-secondary hover:text-text-primary"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="dispatch-transition dispatch-cta flex items-center whitespace-nowrap rounded-lg px-3 py-1 text-body font-medium"
            >
              Sign up
            </a>
          </div>
        </nav>
        <HeaderBorder />
      </header>

      <main id="main">
        <section className="mx-auto max-w-marketing-wide px-5 pt-6 pb-24 lg:px-8 xl:px-22 xl:pt-0">
          <div className="grid items-center gap-12 xl:min-h-hero xl:grid-cols-hero xl:py-6">
            <div>
              <h1 className="dispatch-display-gradient dispatch-display-stretch font-serif text-display-2xl-m lg:text-display-2xl">
                Email for developers
              </h1>
              <p className="mt-2 max-w-reading text-body text-text-secondary">
                The best way to reach humans instead of spam folders other than Resend. A portfolio
                project to deliver emails like the pros.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="/signup"
                  className="dispatch-transition dispatch-cta flex items-center rounded-2xl px-4 py-2 text-body font-medium"
                >
                  Get an API key
                </a>
              </div>
            </div>
            <HeroVideo className={heroVideoPlacement} />
          </div>

          <DashboardPreview className="mt-16" />
        </section>
      </main>

      <FooterWordmark />

      <footer className="relative">
        <span aria-hidden="true" className="dispatch-glow absolute inset-x-0 top-0 h-40" />
        <span aria-hidden="true" className="dispatch-rule absolute inset-x-0 top-0 h-px" />
        <div className="relative mx-auto flex max-w-marketing-wide flex-wrap items-center gap-x-8 gap-y-4 px-5 pt-16 pb-16 lg:px-6">
          <div className="flex items-center gap-6">
            <a href="/terms" className={footerLink}>
              Terms
            </a>
            <a href="/privacy" className={footerLink}>
              Privacy
            </a>
          </div>
          <span className="ml-auto text-caption text-text-muted">© 2026 Dispatch</span>
        </div>
      </footer>
    </>
  );
}
