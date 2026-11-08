"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/Icon";
import styles from "./Header.module.css";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [solid, setSolid] = useState(!isHome);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const lastY = useRef(0);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const searchBtn = useRef<HTMLButtonElement>(null);

  // Transparent over the home film; solid elsewhere or once the film is passed.
  // Hides while scrolling down through content, returns on the way up.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const threshold = isHome ? window.innerHeight * 0.72 : 8;
      setSolid(!isHome || y > threshold);
      const delta = y - lastY.current;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > Math.max(threshold, 480));
        lastY.current = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isHome]);

  // Let sticky elements (e.g. the shop filter bar) follow the header.
  const isHidden = hidden && !menuOpen && !searchOpen;
  useEffect(() => {
    document.documentElement.toggleAttribute("data-header-hidden", isHidden);
  }, [isHidden]);

  // Close overlays on navigation.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuBtn.current?.focus({ preventScroll: true });
  }, []);
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    searchBtn.current?.focus({ preventScroll: true });
  }, []);

  // "/" opens search, like most premium catalogues.
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const overHero = isHome && !solid && !menuOpen;
  const cls = [
    styles.header,
    overHero ? styles.overHero : styles.solid,
    isHidden ? styles.hidden : "",
  ].join(" ");

  const isActive = (href: string) => (href === "/shop" ? pathname.startsWith("/shop") : pathname === href);

  return (
    <>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <header className={cls} data-over-hero={overHero || undefined}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <button
              ref={menuBtn}
              type="button"
              className={styles.menuBtn}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            >
              <span className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`} aria-hidden>
                <i />
                <i />
              </span>
              <span className={styles.menuLabel} aria-hidden>
                {menuOpen ? "Close" : "Menu"}
              </span>
            </button>
            <nav aria-label="Primary" className={styles.desktopNav}>
              <Link href="/shop" className="link-line" aria-current={isActive("/shop") ? "page" : undefined}>
                Shop
              </Link>
              <Link href="/#collections" className="link-line">
                Collections
              </Link>
            </nav>
          </div>

          <Link href="/" className={styles.wordmark} aria-label="VIIRAA, home">
            <span>VIIRAA</span>
          </Link>

          <div className={styles.right}>
            <nav aria-label="Secondary" className={styles.desktopNav}>
              <Link href="/#craft" className="link-line">
                Our Craft
              </Link>
              <Link href="/contact" className="link-line" aria-current={isActive("/contact") ? "page" : undefined}>
                Contact
              </Link>
            </nav>
            <button
              ref={searchBtn}
              type="button"
              className={styles.iconBtn}
              aria-label="Search the collection"
              aria-expanded={searchOpen}
              aria-controls="site-search"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}
