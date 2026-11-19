<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import technologiesMap, { type Technology } from "@assets/technologies";
import TechnologyItem from "@components/Technology.vue";
import { playCarouselTick } from "@/utils/synthSounds.ts";

const props = defineProps<{
  duration?: number;
  rows?: number;
}>();

const rows = computed(() => props.rows ?? 3);

const duration = computed(() => props.duration || 30);

const technologies = Object.values(technologiesMap);
type CarouselItem = Technology & { uniqueId: string };
const techCount = technologies.length;
const itemHeight = 50;
const itemWidth = 141;

const listPeriod = computed(() => {
  if (isHorizontal.value) {
    return techCount * itemWidth;
  }

  const rowsPerCopy = isTwoColumn.value ? Math.ceil(techCount / 2) : techCount;
  return rowsPerCopy * itemHeight;
});

const itemSize = computed(() => (isHorizontal.value ? itemWidth : itemHeight));

const focusRadius = computed(() =>
  isHorizontal.value ? 2.5 : isCompact.value ? 1.5 : rows.value / 2
);

const offset = ref(0);
const isHovered = ref(false);
const isAnimating = ref(false);
const isCompact = ref(false);
const isHorizontal = ref(false);
const isTwoColumn = computed(() => isCompact.value && !isHorizontal.value);
let animationFrame: number;
let lastTime: number;
let timeSinceLastSwitch = 0;
let compactQuery: MediaQueryList | null = null;
let tabletQuery: MediaQueryList | null = null;

const stepCount = ref(0);

const centerIndex = computed(() => {
  if (!containerRef.value) return -1;
  const containerSize = isHorizontal.value
    ? containerRef.value.clientWidth
    : containerRef.value.clientHeight;
  const listOffset = offset.value + dragOffset.value - listPeriod.value;
  return Math.round(
    (containerSize / 2 - listOffset - itemSize.value / 2) / itemSize.value
  );
});

const markArrival = (manual: boolean) => {
  stepCount.value++;
  if (manual) playCarouselTick();
};

const next = (manual = false) => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  const currentStep = Math.round(offset.value / itemSize.value);
  offset.value = (currentStep - 1) * itemSize.value;
  markArrival(manual);

  setTimeout(() => {
    isAnimating.value = false;
    // Seamless jump when reaching the boundary
    if (offset.value <= -listPeriod.value) {
      offset.value += listPeriod.value;
    }
  }, 300);
};

const prev = (manual = false) => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  const currentStep = Math.round(offset.value / itemSize.value);
  offset.value = (currentStep + 1) * itemSize.value;
  markArrival(manual);

  setTimeout(() => {
    isAnimating.value = false;
    if (offset.value > 0) {
      offset.value -= listPeriod.value;
    }
  }, 300);
};

const updateAnimation = (time: number) => {
  if (lastTime !== undefined) {
    const deltaTime = time - lastTime;

    if (
      !isHovered.value &&
      !isAnimating.value &&
      !isTouching.value &&
      !isGliding.value
    ) {
      timeSinceLastSwitch += deltaTime;
      const switchDelay = (duration.value * 1000) / techCount;

      if (timeSinceLastSwitch >= switchDelay) {
        next();
        timeSinceLastSwitch = 0;
      }
    } else if (isHovered.value) {
      timeSinceLastSwitch = 0; // Reset the timer on hover
    }
  }

  lastTime = time;
  animationFrame = requestAnimationFrame(updateAnimation);
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  if (isAnimating.value) return;

  // The wheel acts as a switch
  if (event.deltaY > 0) {
    next();
  } else if (event.deltaY < 0) {
    prev();
  }
};

// Touch scroll: the strip follows the finger, glides on release
// with inertia and settles on the nearest item without jumping back
const isTouching = ref(false);
const isGliding = ref(false);
const touchStart = ref(0);
const touchCrossStart = ref(0);
const touchDelta = ref(0);
const suppressClick = ref(false);
let glideVelocity = 0; // Finger velocity along the strip axis, px/ms
let lastMoveTime = 0;
let glideFrame: number | undefined;
let lastGlideTime: number | undefined;

// Swipe axis matches the scroll axis: X on tablet, Y on mobile

const touchPosition = (event: TouchEvent) =>
  isHorizontal.value ? event.touches[0].clientX : event.touches[0].clientY;

const touchCrossPosition = (event: TouchEvent) =>
  isHorizontal.value ? event.touches[0].clientY : event.touches[0].clientX;

const stopGlide = () => {
  if (glideFrame !== undefined) {
    cancelAnimationFrame(glideFrame);
    glideFrame = undefined;
  }
  isGliding.value = false;
};

const snapToNearest = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  offset.value = Math.round(offset.value / itemSize.value) * itemSize.value;
  markArrival(true);

  setTimeout(() => {
    isAnimating.value = false;
    // Seamless jump when leaving the list bounds
    if (offset.value <= -listPeriod.value) {
      offset.value += listPeriod.value;
    } else if (offset.value > 0) {
      offset.value -= listPeriod.value;
    }
  }, 300);
};

// Inertial glide of the strip after the finger is released
const glideStep = (time: number) => {
  if (lastGlideTime !== undefined) {
    const deltaTime = time - lastGlideTime;
    offset.value += glideVelocity * deltaTime;
    glideVelocity *= Math.pow(0.95, deltaTime / 16);

    if (offset.value <= -listPeriod.value) {
      offset.value += listPeriod.value;
    } else if (offset.value > 0) {
      offset.value -= listPeriod.value;
    }

    if (Math.abs(glideVelocity) < 0.05) {
      stopGlide();
      snapToNearest();
      return;
    }
  }

  lastGlideTime = time;
  glideFrame = requestAnimationFrame(glideStep);
};

const handleTouchStart = (event: TouchEvent) => {
  stopGlide(); // A new touch interrupts the inertial glide
  isTouching.value = true;
  touchStart.value = touchPosition(event);
  touchCrossStart.value = touchCrossPosition(event);
  touchDelta.value = 0;
  glideVelocity = 0;
  lastMoveTime = performance.now();
};

const handleTouchMove = (event: TouchEvent) => {
  if (!isTouching.value) return;

  const along = touchPosition(event) - touchStart.value;
  const across = touchCrossPosition(event) - touchCrossStart.value;

  // Movement across the strip axis is regular page scroll, so don't block it
  if (Math.abs(across) > Math.abs(along)) {
    touchDelta.value = 0;
    return;
  }

  event.preventDefault(); // Block page scroll along the swipe axis

  const now = performance.now();
  const deltaTime = now - lastMoveTime;
  if (deltaTime > 0) {
    glideVelocity = (along - touchDelta.value) / deltaTime;
  }
  lastMoveTime = now;

  touchDelta.value = along;
};

const handleTouchEnd = () => {
  if (!isTouching.value) return;
  isTouching.value = false;

  suppressClick.value = Math.abs(touchDelta.value) > 10;

  // Carry the finger offset into the strip so release doesn't jump back
  offset.value += touchDelta.value;
  touchDelta.value = 0;

  if (offset.value <= -listPeriod.value) {
    offset.value += listPeriod.value;
  } else if (offset.value > 0) {
    offset.value -= listPeriod.value;
  }

  // A fast flick glides with inertia, a slow release settles immediately
  if (Math.abs(glideVelocity) > 0.3) {
    glideVelocity = Math.max(-2.5, Math.min(2.5, glideVelocity));
    isGliding.value = true;
    lastGlideTime = undefined;
    glideFrame = requestAnimationFrame(glideStep);
  } else {
    snapToNearest();
  }
};

const handleSceneClick = (event: MouseEvent) => {
  // A swipe must not accidentally open the item's link
  if (suppressClick.value) {
    event.stopPropagation();
    event.preventDefault();
    suppressClick.value = false;
  }
};

const dragOffset = computed(() => (isTouching.value ? touchDelta.value : 0));

const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  animationFrame = requestAnimationFrame(updateAnimation);
  if (containerRef.value) {
    containerRef.value.addEventListener("wheel", handleWheel, {
      passive: false
    });
  }

  compactQuery = window.matchMedia("(max-width: 1200px)");
  isCompact.value = compactQuery.matches;
  compactQuery.addEventListener("change", handleCompactChange);

  tabletQuery = window.matchMedia(
    "(min-width: 769px) and (max-width: 1200px)"
  );
  isHorizontal.value = tabletQuery.matches;
  tabletQuery.addEventListener("change", handleTabletChange);
});

const handleCompactChange = (event: MediaQueryListEvent) => {
  isCompact.value = event.matches;
  resetOffset();
};

const handleTabletChange = (event: MediaQueryListEvent) => {
  isHorizontal.value = event.matches;
  resetOffset();
};

// When the mode changes, offset stays in units of the old axis/grid,
// so reset it to keep the strip aligned to items.
const resetOffset = () => {
  stopGlide();
  offset.value = 0;
  touchDelta.value = 0;
  timeSinceLastSwitch = 0;
};

const handleTouchCancel = () => {
  // Otherwise a stuck isTouching stops autoscroll forever
  isTouching.value = false;
  touchDelta.value = 0;
  glideVelocity = 0;
};

onUnmounted(() => {
  cancelAnimationFrame(animationFrame);
  stopGlide();
  if (containerRef.value) {
    containerRef.value.removeEventListener("wheel", handleWheel);
  }
  compactQuery?.removeEventListener("change", handleCompactChange);
  tabletQuery?.removeEventListener("change", handleTabletChange);
});

// Clone the list for seamless looping; on mobile split into pairs (two columns)
const displayRows = computed<CarouselItem[][]>(() => {
  const items: CarouselItem[] = [...technologies, ...technologies, ...technologies].map(
    (tech, index) => ({
      ...tech,
      uniqueId: `${tech.id}-${index}`
    })
  );

  if (!isTwoColumn.value) {
    return items.map((item) => [item]);
  }

  const rows: CarouselItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
});

const currentTransform = computed(() => {
  // Center relative to the container (+ finger offset while swiping)
  const shift = offset.value - listPeriod.value + dragOffset.value;
  return isHorizontal.value
    ? `translateX(${shift}px)`
    : `translateY(${shift}px)`;
});

const getItemStyle = (index: number) => {
  if (!containerRef.value) return {};

  const containerSize = isHorizontal.value
    ? containerRef.value.clientWidth
    : containerRef.value.clientHeight;
  const center = containerSize / 2;

  // Item center position in the scene (including finger drag)
  const itemStartInList = index * itemSize.value;
  const listOffset = offset.value + dragOffset.value - listPeriod.value;
  const actualCenterInScene = itemStartInList + listOffset + itemSize.value / 2;

  const distance = (actualCenterInScene - center) / itemSize.value;
  const absDistance = Math.abs(distance);

  // Focus window: the center item and its neighbors stay sharp,
  // everything beyond the radius is fully hidden (3 vertical, 5 horizontal)
  const radius = focusRadius.value;
  // In the horizontal strip all items are the same size, so gaps between
  // visible items are equal; focus is conveyed only by brightness/opacity
  const scale = isHorizontal.value
    ? 1
    : 1 - Math.min(absDistance, radius) * 0.15;
  const opacity = 1 - Math.min(absDistance, radius) * 0.2;
  const zIndex = Math.round((5 - absDistance) * 10);

  // Add a slight depth offset (perspective effect)
  const perspectiveScale = isHorizontal.value
    ? 1
    : 1 - Math.min(absDistance, 2) * 0.05;

  // Dim everything except the center item; in the wide horizontal
  // window dim more gently so the edge items don't fade to black
  const dimStep = isHorizontal.value ? 0.3 : 0.75 / radius;
  const brightness = 1 - Math.min(absDistance, radius) * dimStep;

  return {
    opacity: Math.max(opacity, 0),
    transform: `scale(${scale * perspectiveScale})`,
    filter: `brightness(${brightness})`,
    zIndex,
    transition: isAnimating.value
      ? "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
      : "none",
    pointerEvents: absDistance > 0.8 ? "none" : "auto",
    ...(isHorizontal.value
      ? { width: itemWidth + "px" }
      : { height: itemHeight + "px" }),
    visibility: absDistance > radius ? "hidden" : "visible"
  };
};
</script>

<template>
  <div class="tech-vertical-carousel-wrapper" :style="{ '--carousel-rows': rows }">
    <div
      ref="containerRef"
      class="tech-vertical-carousel-scene"
      :class="{ horizontal: isHorizontal }"
      data-cursor-group=".carousel-item.is-center .technology-container"
      data-cursor-group-strict
      :style="{
        // The strip anchor is set inline from the same state as
        // the transform math: centering on the main axis
        // pushes the wide strip out of the window
        justifyContent: isHorizontal ? 'flex-start' : 'center'
      }"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @touchstart.passive="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchCancel"
      @click.capture="handleSceneClick"
    >
      <div
        class="tech-vertical-carousel-list"
        :class="{
          animating: isAnimating && !isTouching,
          horizontal: isHorizontal
        }"
        :style="{
          transform: currentTransform,
          // Strip axis and anchor are inline so the layout never
          // diverges from the transform axis in getItemStyle/currentTransform
          flexDirection: isHorizontal ? 'row' : 'column',
          width: isHorizontal ? 'auto' : '100%',
          height: isHorizontal ? '100%' : 'auto',
          flexShrink: 0
        }"
      >
        <div
          v-for="(row, index) in displayRows"
          :key="row[0].uniqueId"
          class="carousel-item"
          :class="{ horizontal: isHorizontal, 'is-center': index === centerIndex }"
          :style="getItemStyle(index)"
        >
          <TechnologyItem
            v-for="tech in row"
            :key="tech.uniqueId"
            :image="tech.icon"
            :text="tech.name"
            :link="tech.link"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.tech-vertical-carousel-wrapper {
  width: min-content;
  height: calc(var(--carousel-rows, 3) * 50px);
  margin: 0 auto;
}

.tech-vertical-carousel-scene {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
  contain: paint;

  &.horizontal {
    // Pin the strip to the left edge: on tablet the scroll axis matches the flex main axis,
    // and centering pushes it out of the visible window

    justify-content: flex-start;
  }
}

.tech-vertical-carousel-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transition: none;
  flex-shrink: 0; // The strip is wider than the scene window; shrinking breaks slot geometry

  &.animating {
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }

  &.horizontal {
    // Tablet: the strip stretches horizontally
    flex-direction: row;
    height: 100%;
    width: auto;
  }
}

.carousel-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; // Gap between columns on mobile
  padding: 2px 0;
  box-sizing: border-box;
  will-change: transform, opacity;
  flex-shrink: 0;

  &.horizontal {
    width: auto;
    height: 100%;
    padding: 0 2px;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .tech-vertical-carousel-wrapper {
    width: 100%;
    max-width: 705px; // Exactly 5 items of 141px in the horizontal strip
    height: 100px; // The horizontal strip does not need the vertical "drum" height
  }
}

@media (max-width: 768px) {
  .tech-vertical-carousel-wrapper {
    width: 100%; // Stay within the container on mobile
    max-width: 280px;
    height: 150px;
  }
}

@media (max-width: 340px) {
  // Shrink items so two columns fit in a narrow container
  .carousel-item {
    gap: 4px;

    :deep(.technology-container) {
      zoom: 0.85;
    }
  }
}
</style>
