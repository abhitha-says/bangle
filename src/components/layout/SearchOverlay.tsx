"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useId, useRef, useState } from "react";
import { CloseIcon, SearchIcon, ArrowRight } from "@/components/ui/Icon";
import { collectionName, searchProducts } from "@/lib/catalog";
import styles from "./SearchOverlay.module.css";
import { useEscape, useScrollLock } from "./useScrollLock";

const SUGGESTIONS = ["Ruby", "Emerald", "Sapphire", "Rani pink", "Multicolour", "Jugalbandi"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const listId = useId();
  useScrollLock(open);
  useEscape(open, onClose);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => input.current?.focus({ preventScroll: true }), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  const trimmed = deferred.trim();
  const results = trimmed ? searchProducts(trimmed) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  return (
    <div
      id="site-search"
      className={`${styles.overlay} ${open ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search the collection"
      aria-hidden={!open}
      inert={!open}
    >
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Close search" tabIndex={-1} />
      <div className={styles.sheet}>
        <div className={styles.inner}>
          <form role="search" onSubmit={submit} className={styles.form}>
            <SearchIcon className={styles.searchIcon} />
            <label htmlFor="site-search-input" className="sr-only">
              Search bangles by name, colour or collection
            </label>
            <input
              id="site-search-input"
              ref={input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by colour, name or collection"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              aria-controls={listId}
            />
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close search">
              <CloseIcon />
            </button>
          </form>

          <div className={styles.body} id={listId} aria-live="polite">
            {!trimmed && (
              <div className={styles.suggest}>
                <p className="eyebrow">Try</p>
                <ul>
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => setQ(s)} className={styles.chip}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {trimmed && results.length === 0 && (
              <p className={styles.empty}>
                Nothing matches <em>“{trimmed}”</em> yet. Try a colour such as <button type="button" onClick={() => setQ("red")}>red</button> or{" "}
                <button type="button" onClick={() => setQ("green")}>green</button>.
              </p>
            )}

            {results.length > 0 && (
              <>
                <p className="eyebrow">
                  {results.length} {results.length === 1 ? "piece" : "pieces"}
                </p>
                <ul className={styles.results}>
                  {results.slice(0, 6).map((p, i) => (
                    <li key={p.id} style={{ "--i": i } as React.CSSProperties}>
                      <Link href={`/shop/${p.slug}`} onClick={onClose} className={styles.result}>
                        <span className={`${styles.thumb} ${p.images.primary.kind === "cutout" ? "studio" : ""}`}>
                          <Image
                            src={p.images.primary.src}
                            alt=""
                            fill
                            sizes="96px"
                            quality={72}
                            style={{
                              objectFit: p.images.primary.kind === "cutout" ? "contain" : "cover",
                              objectPosition: p.images.primary.focus,
                            }}
                          />
                        </span>
                        <span>
                          <span className={styles.rName}>{p.name}</span>
                          <span className={styles.rMeta}>
                            {p.colour} · {collectionName(p)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button type="submit" className={`${styles.all} link-line link-line--always`} onClick={submit}>
                  View all results <ArrowRight />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
