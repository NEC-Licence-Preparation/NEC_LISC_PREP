"use client";

import { useEffect, useRef } from "react";

const DEFAULT_AD_SNIPPET = `
<script>
  atOptions = {
    key: "add676d9dbf07c71ad8d42f5e1605d01",
    format: "iframe",
    height: 250,
    width: 300,
    params: {}
  };
</script>
<script src="https://www.highperformanceformat.com/add676d9dbf07c71ad8d42f5e1605d01/invoke.js"></script>`;

const LEADERBOARD_AD_SNIPPET = `
<script>
  atOptions = {
    key: "28117ca9d867cac37050fb6256f58350",
    format: "iframe",
    height: 90,
    width: 728,
    params: {}
  };
</script>
<script src="https://www.highperformanceformat.com/28117ca9d867cac37050fb6256f58350/invoke.js"></script>`;

const AD_SNIPPETS: Record<"rectangle" | "leaderboard", string> = {
  rectangle: DEFAULT_AD_SNIPPET,
  leaderboard: LEADERBOARD_AD_SNIPPET,
};

type AdSlotProps = {
  title?: string;
  description?: string;
  adHtml?: string; // optional override per-slot
  minHeight?: number;
  size?: "rectangle" | "leaderboard";
};

export default function AdSlot({
  title = "Sponsored",
  description = "Add your ad provider's embed code below.",
  adHtml,
  minHeight,
  size = "rectangle",
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Resolve ad snippet by priority:
  // 1) Explicit prop override (adHtml)
  // 2) Size-specific env var (NEXT_PUBLIC_ADS_SNIPPET_LEADERBOARD / NEXT_PUBLIC_ADS_SNIPPET_RECTANGLE)
  // 3) Generic env var (NEXT_PUBLIC_ADS_SNIPPET)
  // 4) Built-in defaults per size
  const envGeneric = process.env.NEXT_PUBLIC_ADS_SNIPPET?.trim();
  const envBySize = (
    size === "leaderboard"
      ? process.env.NEXT_PUBLIC_ADS_SNIPPET_LEADERBOARD
      : process.env.NEXT_PUBLIC_ADS_SNIPPET_RECTANGLE
  )?.trim();

  const chosenSnippet = (adHtml?.trim())
    || envBySize
    || envGeneric
    || AD_SNIPPETS[size] 
    || DEFAULT_AD_SNIPPET;

  const isPlaceholder = chosenSnippet?.includes("<your_ad_embed_html_or_script_here>");
  const adMarkup = !chosenSnippet || isPlaceholder ? AD_SNIPPETS[size] ?? DEFAULT_AD_SNIPPET : chosenSnippet;

  const computedMinHeight = minHeight ?? (size === "leaderboard" ? 90 : 250);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";
    if (!adMarkup) return;

    // Inject scripts directly into the host document to preserve provider expectations
    const temp = document.createElement("div");
    temp.innerHTML = adMarkup;

    const appendedNodes: ChildNode[] = [];
    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const oldScript = node as HTMLScriptElement;
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }

        el.appendChild(newScript);
        appendedNodes.push(newScript);
      } else {
        const cloned = node.cloneNode(true) as ChildNode;
        el.appendChild(cloned);
        appendedNodes.push(cloned);
      }
    });

    return () => {
      appendedNodes.forEach((node) => {
        if (node.parentNode === el) {
          el.removeChild(node);
        }
      });
    };
  }, [adMarkup]);

  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {title}
          </p>
          {description && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">
          Ad slot
        </span>
      </div>

      <div
        ref={containerRef}
        className="w-full rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-sm"
        style={{ minHeight: `${computedMinHeight}px` }}
        aria-label="Advertisement"
        suppressHydrationWarning
      >
        {!adMarkup && "Paste your ad snippet into NEXT_PUBLIC_ADS_SNIPPET"}
      </div>
    </section>
  );
}
