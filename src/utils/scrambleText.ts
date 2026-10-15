import { reducedMotion } from "@/hook/usePreferences.ts";
import {
  createChaoticScramble,
  type ScrambleFrame
} from "@/utils/chaosText.ts";

const SKIP_SELECTOR = [
  "[data-no-scramble]",
  '[aria-hidden="true"]',
  ".sr-only",
  "script",
  "style",
  "svg"
].join(", ");

const MAX_NODE_LENGTH = 600;
const MAX_TOTAL_LENGTH = 6000;

interface ScrambleItem {
  node: Text;
  final: string;
  written: string;
  next: (now: number) => ScrambleFrame;
  active: boolean;
}

interface ScrambleRun {
  frame: number;
  items: ScrambleItem[];
}

const runs = new Map<Element, ScrambleRun>();

function finish(root: Element) {
  const run = runs.get(root);
  if (!run) return;
  cancelAnimationFrame(run.frame);
  for (const item of run.items) {
    if (item.active && item.node.nodeValue === item.written)
      item.node.nodeValue = item.final;
  }
  runs.delete(root);
}

const isVisible = (element: Element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
};

function collect(root: Element): Text[] {
  const nodes: Text[] = [];
  let total = 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue ?? "";
      const parent = node.parentElement;
      if (!text.trim() || text.length > MAX_NODE_LENGTH || !parent)
        return NodeFilter.FILTER_REJECT;
      // Skip markers count only inside the root: scrambling a marked element directly is allowed
      const skipped = parent.closest(SKIP_SELECTOR);
      if (skipped && skipped !== root && root.contains(skipped))
        return NodeFilter.FILTER_REJECT;
      if (!isVisible(parent)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  while (walker.nextNode() && total < MAX_TOTAL_LENGTH) {
    const node = walker.currentNode as Text;
    nodes.push(node);
    total += node.nodeValue?.length ?? 0;
  }
  return nodes;
}

export function scrambleTextIn(root: Element, ms = 900) {
  finish(root);
  if (reducedMotion()) return;

  const items: ScrambleItem[] = collect(root).map((node) => {
    const final = node.nodeValue ?? "";
    return {
      node,
      final,
      written: final,
      next: createChaoticScramble(final, ms),
      active: true
    };
  });

  if (!items.length) return;
  const run: ScrambleRun = { frame: 0, items };
  runs.set(root, run);

  const step = (now: number) => {
    let running = false;

    for (const item of items) {
      if (!item.active) continue;

      // Vue (or Typed.js, a counter...) changed the node: let its value stand
      if (item.node.nodeValue !== item.written || !item.node.isConnected) {
        item.active = false;
        continue;
      }

      const { value, changed, done } = item.next(now);
      if (changed) {
        item.node.nodeValue = value;
        item.written = value;
      }
      if (done) item.active = false;
      else running = true;
    }

    if (running) run.frame = requestAnimationFrame(step);
    else runs.delete(root);
  };

  run.frame = requestAnimationFrame(step);
}
