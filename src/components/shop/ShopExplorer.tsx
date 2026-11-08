"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { CloseIcon, SearchIcon } from "@/components/ui/Icon";
import { collectionById, collections } from "@/data/collections";
import { colourById, colours } from "@/data/colours";
import type { ColourId } from "@/data/types";
import { filterProducts } from "@/lib/catalog";
import { EditorialTile } from "./EditorialTile";
import styles from "./ShopExplorer.module.css";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/** Update the URL without a server round-trip; useSearchParams stays in sync. */
function writeParams(next: Record<string, string | null>) {
  const params = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(next)) {
    if (v) params.set(k, v);
    else params.delete(k);
  }
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `/shop?${qs}` : "/shop");
}

export function ShopExplorer() {
  const params = useSearchParams();
  const collection = params.get("collection");
  const colour = params.get("colour") as ColourId | null;
  const urlQ = params.get("q") ?? "";
  const [query, setQuery] = useState(urlQ);
  const reduce = useReducedMotion();
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep the input in step when the URL changes from elsewhere (header search).
  const [syncedQ, setSyncedQ] = useState(urlQ);
  if (syncedQ !== urlQ) {
    setSyncedQ(urlQ);
    setQuery(urlQ);
  }

  const validCollection = collection && collectionById(collection) ? collection : null;
  const validColour = colour && colours.some((c) => c.id === colour) ? colour : null;

  const results = useMemo(
    () => filterProducts({ collection: validCollection, colour: validColour, q: query }),
    [validCollection, validColour, query],
  );
  const filtered = Boolean(validCollection || validColour || query.trim());

  const onQuery = (v: string) => {
    setQuery(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => writeParams({ q: v.trim() || null }), 300);
  };

  const clearAll = () => {
    setQuery("");
    writeParams({ collection: null, colour: null, q: null });
  };

  const transition = reduce ? { duration: 0 } : { duration: 0.6, ease: EASE };

  return (
    <LayoutGroup>
      <div className={styles.bar}>
        <div className={`container ${styles.barInner}`}>
          <div className={styles.tabs} role="group" aria-label="Collection">
            {[{ id: null, name: "All" }, ...collections].map((c) => {
              const on = validCollection === c.id;
              return (
                <button
                  key={c.id ?? "all"}
                  type="button"
                  aria-pressed={on}
                  className={`${styles.tab} ${on ? styles.tabOn : ""}`}
                  onClick={() => writeParams({ collection: c.id })}
                >
                  {c.name}
                  {on && <motion.span layoutId="tab-underline" className={styles.underline} transition={transition} />}
                </button>
              );
            })}
          </div>

          <div className={styles.tools}>
            <div className={styles.swatches} role="group" aria-label="Colour">
              {colours.map((c) => {
                const on = validColour === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    aria-label={c.name}
                    title={c.name}
                    className={`${styles.swatch} ${on ? styles.swatchOn : ""}`}
                    onClick={() => writeParams({ colour: on ? null : c.id })}
                  >
                    <span style={{ background: c.swatch }} />
                  </button>
                );
              })}
            </div>

            <label className={`${styles.search} ${query ? styles.searchOpen : ""}`}>
              <SearchIcon aria-hidden />
              <span className="sr-only">Search the collection</span>
              <input
                type="search"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Search"
                autoComplete="off"
                enterKeyHint="search"
              />
              {query && (
                <button type="button" onClick={() => onQuery("")} aria-label="Clear search" className={styles.clearQ}>
                  <CloseIcon />
                </button>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.status}>
          <p aria-live="polite">
            <span className={styles.count}>{results.length}</span> {results.length === 1 ? "piece" : "pieces"}
            {validCollection && <> in <em>{collectionById(validCollection)?.name}</em></>}
            {validColour && <> · <em>{colourById(validColour).name}</em></>}
            {query.trim() && <> matching <em>&ldquo;{query.trim()}&rdquo;</em></>}
          </p>
          {filtered && (
            <button type="button" className={`${styles.clear} link-line link-line--always`} onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <motion.div className={styles.empty} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
            <p className={styles.emptyTitle}>
              No pieces match, <em>yet.</em>
            </p>
            <p>Try another colour or collection, or browse everything we make.</p>
            <button type="button" className="btn" onClick={clearAll}>
              Show all pieces
            </button>
          </motion.div>
        ) : (
          <motion.ul className={styles.grid} layout={!reduce}>
            <AnimatePresence mode="popLayout" initial={false}>
              {results.flatMap((p, i) => {
                const card = (
                  <motion.li
                    key={p.id}
                    layout={!reduce}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: reduce ? 0 : 0.3 } }}
                    transition={{ ...transition, delay: reduce ? 0 : Math.min(i, 8) * 0.04 }}
                    className={styles.cell}
                  >
                    <ProductCard product={p} index={i} eager={i < 4} headingLevel="h2" />
                  </motion.li>
                );
                // An editorial pause after the first row, only on the full view.
                if (!filtered && i === 3) {
                  return [
                    card,
                    <motion.li
                      key="editorial"
                      layout={!reduce}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={transition}
                      className={styles.editorial}
                    >
                      <EditorialTile />
                    </motion.li>,
                  ];
                }
                return [card];
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </LayoutGroup>
  );
}
