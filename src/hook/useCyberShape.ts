import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  toValue,
  type MaybeRefOrGetter
} from "vue";

export type CyberShape =
  | "default"
  | "none"
  | "rectangle"
  | "all-corners"
  | "top-corners"
  | "bottom-corners"
  | "bottom-corners-no-top"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "diagonal-tl-br"
  | "diagonal-tr-bl"
  | "cyber-image-bottom";

export interface CyberShapeOptions {
  /** Predefined shape variant */
  variant?: CyberShape;
  /** Size of the slanted corners in pixels */
  cornerSize?: number;
  /** Width of the border stroke */
  borderWidth?: number;
}

interface ShapePoint {
  x: number;
  y: number;
}

const DEFAULT_CORNER_SIZE = 20;
const DEFAULT_BORDER_WIDTH = 2;

// Which corners get slanted for each shape variant
const CUT_TOP_LEFT: CyberShape[] = ["all-corners", "top-corners", "top-left", "diagonal-tl-br"];
const CUT_TOP_RIGHT: CyberShape[] = ["all-corners", "top-corners", "top-right", "diagonal-tr-bl", "default"];
const CUT_BOTTOM_RIGHT: CyberShape[] = ["all-corners", "bottom-corners", "bottom-corners-no-top", "bottom-right", "diagonal-tl-br", "default"];
const CUT_BOTTOM_LEFT: CyberShape[] = ["all-corners", "bottom-corners", "bottom-corners-no-top", "bottom-left", "diagonal-tr-bl", "default"];

/**
 * Calculates SVG paths and CSS clip-paths for cyber-brutalist shapes.
 * Automatically recalculates when the observed container is resized.
 *
 * @param options reactive shape configuration (plain object, ref or getter)
 * @returns containerRef, width, height, and computed path/clip-path strings
 */
export function useCyberShape(options: MaybeRefOrGetter<CyberShapeOptions> = {}) {
  const containerRef = ref<HTMLElement | null>(null);
  const width = ref(0);
  const height = ref(0);

  let resizeObserver: ResizeObserver | null = null;

  const updateDimensions = () => {
    if (containerRef.value) {
      width.value = containerRef.value.offsetWidth;
      height.value = containerRef.value.offsetHeight;
    }
  };

  onMounted(() => {
    nextTick(() => {
      updateDimensions();
      if (containerRef.value) {
        resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(containerRef.value);
      }
    });
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
  });

  // Polygon of the shape outline, clockwise from the top-left corner
  const getPoints = computed<ShapePoint[]>(() => {
    const w = width.value;
    const h = height.value;
    if (w === 0 || h === 0) return [];

    const { variant = "default", cornerSize = DEFAULT_CORNER_SIZE, borderWidth = DEFAULT_BORDER_WIDTH } = toValue(options);
    if (variant === "none") return [];

    const c = cornerSize;
    const b = borderWidth / 2;

    // Special case: only the bottom-right corner is cut
    if (variant === "cyber-image-bottom") {
      return [
        { x: 0, y: 0 },
        { x: w, y: 0 },
        { x: w, y: h - c },
        { x: w - c, y: h },
        { x: 0, y: h }
      ];
    }

    const cut = (shapes: CyberShape[]) => shapes.includes(variant);
    const points: ShapePoint[] = [];

    // Top-left
    if (cut(CUT_TOP_LEFT)) {
      points.push({ x: c, y: b }, { x: b, y: c });
    } else {
      points.push({ x: b, y: b });
    }

    // Bottom-left
    if (cut(CUT_BOTTOM_LEFT)) {
      points.push({ x: b, y: h - c }, { x: c, y: h - b });
    } else {
      points.push({ x: b, y: h - b });
    }

    // Bottom-right
    if (cut(CUT_BOTTOM_RIGHT)) {
      points.push({ x: w - c, y: h - b }, { x: w - b, y: h - c });
    } else {
      points.push({ x: w - b, y: h - b });
    }

    // Top-right
    if (cut(CUT_TOP_RIGHT)) {
      points.push({ x: w - b, y: c }, { x: w - c, y: b });
    } else {
      points.push({ x: w - b, y: b });
    }

    return points;
  });

  const getPath = computed(() => {
    const points = getPoints.value;
    if (points.length === 0) return "";

    const [start, ...rest] = points;
    const path = [`M ${start.x},${start.y}`, ...rest.map((p) => `L ${p.x},${p.y}`)].join(" ");

    // The "no-top" variant is an open U-shaped stroke
    const { variant = "default" } = toValue(options);
    return variant === "bottom-corners-no-top" ? path : `${path} Z`;
  });

  const getClipPath = computed(() => {
    const points = getPoints.value;
    if (points.length === 0) return "none";

    const polyPoints = points.map((p) => `${p.x}px ${p.y}px`).join(", ");
    return `polygon(${polyPoints})`;
  });

  return {
    containerRef,
    width,
    height,
    getPath,
    getClipPath
  };
}
