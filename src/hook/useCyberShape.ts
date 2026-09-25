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
  // Default and rectangular
  | "default"
  | "none"
  | "rectangle"
  | "square"
  | "no-corners"
  // All 4 corners
  | "all-corners"
  | "all"
  // 1 cut corner
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "tl"
  | "tr"
  | "bl"
  | "br"
  // 2 cut corners
  | "top-corners"
  | "top"
  | "top-left-top-right"
  | "bottom-corners"
  | "bottom"
  | "bottom-left-bottom-right"
  | "left-corners"
  | "left"
  | "top-left-bottom-left"
  | "right-corners"
  | "right"
  | "top-right-bottom-right"
  | "diagonal-tl-br"
  | "diagonal-main"
  | "diagonal-tr-bl"
  | "diagonal-secondary"
  // 3 cut corners
  | "no-top-left"
  | "without-top-left"
  | "three-corners-no-tl"
  | "no-top-right"
  | "without-top-right"
  | "three-corners-no-tr"
  | "no-bottom-left"
  | "without-bottom-left"
  | "three-corners-no-bl"
  | "no-bottom-right"
  | "without-bottom-right"
  | "three-corners-no-br"
  // Open strokes / specialized shapes
  | "bottom-corners-no-top"
  | "top-corners-no-bottom"
  | "cyber-image-bottom";

export interface CyberCornersConfig {
  topLeft?: boolean;
  topRight?: boolean;
  bottomLeft?: boolean;
  bottomRight?: boolean;
}

export interface CyberCornerSizesConfig {
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
}

export interface CyberShapeOptions {
  /** Predefined shape variant */
  variant?: CyberShape;
  /** Size of the slanted corners in pixels (scalar, tuple or per-corner object) */
  cornerSize?: number | CyberCornerSizesConfig | [number, number, number, number];
  /** Width of the border stroke */
  borderWidth?: number;
  /** Custom corner bevel toggles */
  corners?: CyberCornersConfig;
  /** Individual corner bevel overrides */
  cutTopLeft?: boolean;
  cutTopRight?: boolean;
  cutBottomLeft?: boolean;
  cutBottomRight?: boolean;
  /** Individual corner size overrides */
  topLeftCornerSize?: number;
  topRightCornerSize?: number;
  bottomLeftCornerSize?: number;
  bottomRightCornerSize?: number;
}

interface ShapePoint {
  x: number;
  y: number;
}

const DEFAULT_CORNER_SIZE = 20;
const DEFAULT_BORDER_WIDTH = 2;

// Which corners get slanted for each shape variant
const CUT_TOP_LEFT_VARIANTS: CyberShape[] = [
  "all-corners",
  "all",
  "top-corners",
  "top",
  "top-left-top-right",
  "left-corners",
  "left",
  "top-left-bottom-left",
  "top-left",
  "tl",
  "diagonal-tl-br",
  "diagonal-main",
  "no-top-right",
  "without-top-right",
  "three-corners-no-tr",
  "no-bottom-left",
  "without-bottom-left",
  "three-corners-no-bl",
  "no-bottom-right",
  "without-bottom-right",
  "three-corners-no-br"
];

const CUT_TOP_RIGHT_VARIANTS: CyberShape[] = [
  "all-corners",
  "all",
  "top-corners",
  "top",
  "top-left-top-right",
  "right-corners",
  "right",
  "top-right-bottom-right",
  "top-right",
  "tr",
  "diagonal-tr-bl",
  "diagonal-secondary",
  "default",
  "no-top-left",
  "without-top-left",
  "three-corners-no-tl",
  "no-bottom-left",
  "without-bottom-left",
  "three-corners-no-bl",
  "no-bottom-right",
  "without-bottom-right",
  "three-corners-no-br"
];

const CUT_BOTTOM_RIGHT_VARIANTS: CyberShape[] = [
  "all-corners",
  "all",
  "bottom-corners",
  "bottom",
  "bottom-left-bottom-right",
  "bottom-corners-no-top",
  "right-corners",
  "right",
  "top-right-bottom-right",
  "bottom-right",
  "br",
  "diagonal-tl-br",
  "diagonal-main",
  "default",
  "no-top-left",
  "without-top-left",
  "three-corners-no-tl",
  "no-top-right",
  "without-top-right",
  "three-corners-no-tr",
  "no-bottom-left",
  "without-bottom-left",
  "three-corners-no-bl"
];

const CUT_BOTTOM_LEFT_VARIANTS: CyberShape[] = [
  "all-corners",
  "all",
  "bottom-corners",
  "bottom",
  "bottom-left-bottom-right",
  "bottom-corners-no-top",
  "left-corners",
  "left",
  "top-left-bottom-left",
  "bottom-left",
  "bl",
  "diagonal-tr-bl",
  "diagonal-secondary",
  "default",
  "no-top-left",
  "without-top-left",
  "three-corners-no-tl",
  "no-top-right",
  "without-top-right",
  "three-corners-no-tr",
  "no-bottom-right",
  "without-bottom-right",
  "three-corners-no-br"
];

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

  // Polygon of the shape outline, clockwise/counter-clockwise from the top-left corner
  const getPoints = computed<ShapePoint[]>(() => {
    const w = width.value;
    const h = height.value;
    if (w === 0 || h === 0) return [];

    const opts = toValue(options);
    const {
      variant = "default",
      borderWidth = DEFAULT_BORDER_WIDTH,
      corners,
      cutTopLeft,
      cutTopRight,
      cutBottomLeft,
      cutBottomRight,
      topLeftCornerSize,
      topRightCornerSize,
      bottomLeftCornerSize,
      bottomRightCornerSize
    } = opts;

    if (variant === "none") return [];

    const b = borderWidth / 2;

    // Resolve corner sizes
    let baseTL = DEFAULT_CORNER_SIZE;
    let baseTR = DEFAULT_CORNER_SIZE;
    let baseBR = DEFAULT_CORNER_SIZE;
    let baseBL = DEFAULT_CORNER_SIZE;

    if (typeof opts.cornerSize === "number") {
      baseTL = baseTR = baseBR = baseBL = opts.cornerSize;
    } else if (Array.isArray(opts.cornerSize)) {
      baseTL = opts.cornerSize[0] ?? DEFAULT_CORNER_SIZE;
      baseTR = opts.cornerSize[1] ?? DEFAULT_CORNER_SIZE;
      baseBR = opts.cornerSize[2] ?? DEFAULT_CORNER_SIZE;
      baseBL = opts.cornerSize[3] ?? DEFAULT_CORNER_SIZE;
    } else if (opts.cornerSize && typeof opts.cornerSize === "object") {
      baseTL = opts.cornerSize.topLeft ?? DEFAULT_CORNER_SIZE;
      baseTR = opts.cornerSize.topRight ?? DEFAULT_CORNER_SIZE;
      baseBR = opts.cornerSize.bottomRight ?? DEFAULT_CORNER_SIZE;
      baseBL = opts.cornerSize.bottomLeft ?? DEFAULT_CORNER_SIZE;
    }

    const cTL = topLeftCornerSize ?? baseTL;
    const cTR = topRightCornerSize ?? baseTR;
    const cBR = bottomRightCornerSize ?? baseBR;
    const cBL = bottomLeftCornerSize ?? baseBL;

    // Special case: cyber-image-bottom (bottom-right only)
    if (variant === "cyber-image-bottom") {
      return [
        { x: 0, y: 0 },
        { x: w, y: 0 },
        { x: w, y: h - cBR },
        { x: w - cBR, y: h },
        { x: 0, y: h }
      ];
    }

    // Determine cut status for each of 4 corners
    const isCutTL = cutTopLeft ?? corners?.topLeft ?? CUT_TOP_LEFT_VARIANTS.includes(variant);
    const isCutTR = cutTopRight ?? corners?.topRight ?? CUT_TOP_RIGHT_VARIANTS.includes(variant);
    const isCutBR = cutBottomRight ?? corners?.bottomRight ?? CUT_BOTTOM_RIGHT_VARIANTS.includes(variant);
    const isCutBL = cutBottomLeft ?? corners?.bottomLeft ?? CUT_BOTTOM_LEFT_VARIANTS.includes(variant);

    // If rectangle / no cuts
    if (variant === "rectangle" || variant === "square" || variant === "no-corners") {
      if (cutTopLeft === undefined && cutTopRight === undefined && cutBottomLeft === undefined && cutBottomRight === undefined && !corners) {
        return [
          { x: b, y: b },
          { x: b, y: h - b },
          { x: w - b, y: h - b },
          { x: w - b, y: b }
        ];
      }
    }

    const points: ShapePoint[] = [];

    // Top-left
    if (isCutTL) {
      points.push({ x: cTL, y: b }, { x: b, y: cTL });
    } else {
      points.push({ x: b, y: b });
    }

    // Bottom-left
    if (isCutBL) {
      points.push({ x: b, y: h - cBL }, { x: cBL, y: h - b });
    } else {
      points.push({ x: b, y: h - b });
    }

    // Bottom-right
    if (isCutBR) {
      points.push({ x: w - cBR, y: h - b }, { x: w - b, y: h - cBR });
    } else {
      points.push({ x: w - b, y: h - b });
    }

    // Top-right
    if (isCutTR) {
      points.push({ x: w - b, y: cTR }, { x: w - cTR, y: b });
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

    const { variant = "default" } = toValue(options);
    if (variant === "bottom-corners-no-top" || variant === "top-corners-no-bottom") {
      return path;
    }
    return `${path} Z`;
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
