import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircleQuestion } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';

const navLinks = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Abogados', to: '/directorio' },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const onLanding = location.pathname === '/';

  // On the landing the photograph starts at the very top of the page, so the bar
  // rides on it until the first scroll instead of cutting it with a white strip.
  useEffect(() => {
    if (!onLanding) return;
    const read = () => setScrolled(window.scrollY > 12);
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, [onLanding]);

  const overHero = onLanding && !scrolled && !menuOpen;
  const linkClass = overHero
    ? 'text-sm font-medium text-white/85 hover:text-white'
    : 'text-sm font-medium text-[#334155] hover:text-ink';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
          overHero ? 'border-transparent bg-transparent' : 'border-[#E2E8F0] bg-white/95 backdrop-blur'
        }`}
      >
        <div className="page-shell flex h-16 items-center justify-between">
          <Link to="/" className="shrink-0">
            <Logo variant={overHero ? 'light' : 'default'} />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) =>
              link.to ? (
                <Link key={link.label} to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              ) : onLanding ? (
                <a key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={`/${link.href}`} className={linkClass}>
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/ingresar">
              <Button
                variant="ghost"
                size="sm"
                className={overHero ? '!text-white hover:!bg-white/15' : ''}
              >
                Ingresar
              </Button>
            </Link>
            <Link to="/ingresar">
              <Button
                variant="primary"
                size="sm"
                className={overHero ? '!bg-white !text-ink hover:!bg-[#E2E8F0]' : ''}
              >
                Crear cuenta
              </Button>
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex h-11 w-11 items-center justify-center rounded-[10px] lg:hidden ${
              overHero ? 'text-white' : 'text-ink'
            }`}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#E2E8F0] bg-white py-4 lg:hidden">
            <nav className="page-shell flex flex-col gap-3">
              {navLinks.map((link) =>
                link.to ? (
                  <Link key={link.label} to={link.to} className="py-2 text-sm font-medium text-[#334155]" onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={onLanding ? link.href : `/${link.href}`} className="py-2 text-sm font-medium text-[#334155]" onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </a>
                )
              )}
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/ingresar">
                  <Button variant="secondary" className="w-full">
                    Ingresar
                  </Button>
                </Link>
                <Link to="/ingresar">
                  <Button variant="primary" className="w-full">
                    Crear cuenta
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <Footer />

      <Link
        to="/madre/asistente"
        className={`fixed right-5 z-20 flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-[0_6px_24px_rgba(15,23,42,0.16)] ring-1 ring-[#E2E8F0] transition-colors hover:bg-[#F8FAFC] ${
          location.pathname === '/directorio' ? 'bottom-24' : 'bottom-5'
        }`}
      >
        <MessageCircleQuestion className="h-4 w-4 text-brand" />
        Pregúntame
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-canvas">
      <div className="page-shell grid grid-cols-2 gap-8 py-12 md:grid-cols-3">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-[#475569]">Abogados de alimentos verificados en Arequipa.</p>
        </div>
        <div>
          <h2 className="eyebrow">Navegar</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-[#475569]">
            <li><a href="#como-funciona" className="hover:text-ink">Cómo funciona</a></li>
            <li><Link to="/directorio" className="hover:text-ink">Abogados</Link></li>
            <li><Link to="/ingresar" className="hover:text-ink">Ingresar</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="eyebrow">Confianza</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-[#475569]">
            <li>Supervisión humana en cada escrito</li>
            <li>Colegio de Abogados de Arequipa</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#E2E8F0]">
        <div className="page-shell flex flex-col gap-1 py-4 text-xs text-[#475569] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Syloop · Arequipa, Perú</span>
          <span>Demo con datos ficticios · no ingreses información real.</span>
        </div>
      </div>
    </footer>
  );
}
