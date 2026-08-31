<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import technologiesMap, { type Technology } from "@assets/technologies";
import TechnologyItem from "@components/Technology.vue";

const props = defineProps<{
  duration?: number;
}>();

const duration = computed(() => props.duration || 30);

const technologies = Object.values(technologiesMap);
type CarouselItem = Technology & { uniqueId: string };
const techCount = technologies.length;
const itemHeight = 50; // Высота одного элемента с учетом отступов (40px контент + 10px зазор)
const itemWidth = 141; // Ширина колонки в горизонтальной ленте (125px контент + 16px зазор)

// Длина одной копии списка вдоль оси прокрутки.
// От нее зависит бесшовный цикл — окно не должно выходить за пределы списка.
const listPeriod = computed(() => {
  // Планшет: горизонтальная лента, по одному элементу в колонке
  if (isHorizontal.value) {
    return techCount * itemWidth;
  }

  const rowsPerCopy = isTwoColumn.value ? Math.ceil(techCount / 2) : techCount;
  return rowsPerCopy * itemHeight;
});

const itemSize = computed(() => (isHorizontal.value ? itemWidth : itemHeight));

// Радиус фокусного окна в шагах элементов: по вертикали видны 3 элемента,
// по горизонтали — 5 (центральный + по два соседа)
const focusRadius = computed(() => (isHorizontal.value ? 2.5 : 1.5));

const offset = ref(0);
const isHovered = ref(false);
const isAnimating = ref(false);
// Планшеты и мобильные устройства: компактный режим со свайпом
const isCompact = ref(false);
// Планшеты: вертикальная прокрутка заменяется горизонтальной лентой
const isHorizontal = ref(false);
// Мобильные: две колонки (компактный режим без планшетов)
const isTwoColumn = computed(() => isCompact.value && !isHorizontal.value);
let animationFrame: number;
let lastTime: number;
let timeSinceLastSwitch = 0;
let compactQuery: MediaQueryList | null = null;
let tabletQuery: MediaQueryList | null = null;

const next = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  // Принудительно выравниваем текущий offset перед смещением
  const currentStep = Math.round(offset.value / itemSize.value);
  offset.value = (currentStep - 1) * itemSize.value;

  setTimeout(() => {
    isAnimating.value = false;
    // Бесшовный скачок при достижении границы
    if (offset.value <= -listPeriod.value) {
      offset.value += listPeriod.value;
    }
  }, 300);
};

const prev = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  const currentStep = Math.round(offset.value / itemSize.value);
  offset.value = (currentStep + 1) * itemSize.value;

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
      timeSinceLastSwitch = 0; // Сброс таймера при наведении
    }
  }

  lastTime = time;
  animationFrame = requestAnimationFrame(updateAnimation);
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  if (isAnimating.value) return;

  // Колесико работает как переключатель
  if (event.deltaY > 0) {
    next();
  } else if (event.deltaY < 0) {
    prev();
  }
};

// Скролл пальцем: лента следует за пальцем, при отпускании докатывается
// по инерции и дошагивает до ближайшего элемента без скачка назад
const isTouching = ref(false);
const isGliding = ref(false);
const touchStart = ref(0);
const touchCrossStart = ref(0);
const touchDelta = ref(0);
const suppressClick = ref(false);
let glideVelocity = 0; // Скорость пальца вдоль оси ленты, px/ms
let lastMoveTime = 0;
let glideFrame: number | undefined;
let lastGlideTime: number | undefined;

// Ось свайпа совпадает с осью прокрутки: X на планшете, Y на мобильных

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

  setTimeout(() => {
    isAnimating.value = false;
    // Бесшовный скачок при выходе за границу списка
    if (offset.value <= -listPeriod.value) {
      offset.value += listPeriod.value;
    } else if (offset.value > 0) {
      offset.value -= listPeriod.value;
    }
  }, 300);
};

// Докатка ленты по инерции после отпускания пальца
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
  stopGlide(); // Повторное касание прерывает докатку по инерции
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

  // Движение поперек оси ленты — обычная прокрутка страницы, не блокируем ее
  if (Math.abs(across) > Math.abs(along)) {
    touchDelta.value = 0;
    return;
  }

  event.preventDefault(); // Блокируем прокрутку страницы вдоль оси свайпа

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

  // Переносим смещение пальца в ленту, чтобы отпускание не давало скачка назад
  offset.value += touchDelta.value;
  touchDelta.value = 0;

  if (offset.value <= -listPeriod.value) {
    offset.value += listPeriod.value;
  } else if (offset.value > 0) {
    offset.value -= listPeriod.value;
  }

  // Быстрый флик докатывается по инерции, медленный отпуск — сразу дошагивает
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
  // Свайп не должен случайно открывать ссылку элемента
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

  compactQuery = window.matchMedia("(max-width: 1024px)");
  isCompact.value = compactQuery.matches;
  compactQuery.addEventListener("change", handleCompactChange);

  tabletQuery = window.matchMedia(
    "(min-width: 769px) and (max-width: 1024px)"
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

// При смене режима offset остается в единицах старой оси/сетки —
// сбрасываем его, чтобы лента всегда была выровнена по элементам.
const resetOffset = () => {
  stopGlide();
  offset.value = 0;
  touchDelta.value = 0;
  timeSinceLastSwitch = 0;
};

const handleTouchCancel = () => {
  // Иначе зависший isTouching навсегда останавливает автопрокрутку
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

// Клонируем список для бесшовности; на мобильных разбиваем на пары (две колонки)
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
  // Центрируем относительно контейнера (+ смещение пальцем при свайпе)
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

  // Позиция центра элемента в сцене (с учетом перетаскивания пальцем)
  const itemStartInList = index * itemSize.value;
  const listOffset = offset.value + dragOffset.value - listPeriod.value;
  const actualCenterInScene = itemStartInList + listOffset + itemSize.value / 2;

  const distance = (actualCenterInScene - center) / itemSize.value;
  const absDistance = Math.abs(distance);

  // Фокусное окно: центральный элемент и соседи остаются четкими,
  // все, что дальше радиуса, полностью скрыто (3 по вертикали, 5 по горизонтали)
  const radius = focusRadius.value;
  // В горизонтальной ленте все элементы одного размера — тогда зазоры между
  // видимыми элементами одинаковые; фокус передается только яркостью/прозрачностью
  const scale = isHorizontal.value
    ? 1
    : 1 - Math.min(absDistance, radius) * 0.15;
  const opacity = 1 - Math.min(absDistance, radius) * 0.2;
  const zIndex = Math.round((5 - absDistance) * 10);

  // Добавляем небольшое смещение вглубь (perspective effect)
  const perspectiveScale = isHorizontal.value
    ? 1
    : 1 - Math.min(absDistance, 2) * 0.05;

  // Затемняем все, кроме центрального элемента; в широком горизонтальном
  // окне затемняем мягче, чтобы крайние элементы не уходили в черный
  const dimStep = isHorizontal.value ? 0.3 : 0.5;
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
  <div class="tech-vertical-carousel-wrapper">
    <div
      ref="containerRef"
      class="tech-vertical-carousel-scene"
      :class="{ horizontal: isHorizontal }"
      :style="{
        // Якорь ленты задается инлайном из того же состояния, что и
        // математика трансформации: центрирование по главной оси
        // выталкивает широкую ленту за пределы окна
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
          // Ось ленты и ее якорь — инлайном, чтобы раскладка никогда не
          // расходилась с осью трансформации в getItemStyle/currentTransform
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
          :class="{ horizontal: isHorizontal }"
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
.tech-vertical-carousel-wrapper {
  width: min-content;
  height: 150px; // Ровно 3 элемента по 50px
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
    // Прижимаем ленту к левому краю: на планшете ось прокрутки совпадает с главной осью флекса,
    // и центррование выталкивает ее за пределы видимого окна

    justify-content: flex-start;
  }
}

.tech-vertical-carousel-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transition: none;
  flex-shrink: 0; // Лента шире окна сцены — сжатие ломает геометрию слотов

  &.animating {
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }

  &.horizontal {
    // Планшет: лента вытягивается по горизонтали
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
  gap: 8px; // Зазор между колонками на мобильном
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

@media (min-width: 769px) and (max-width: 1024px) {
  .tech-vertical-carousel-wrapper {
    width: 100%;
    max-width: 705px; // Ровно 5 элементов по 141px в горизонтальной ленте
    height: 100px; // Горизонтальной ленте не нужен вертикальный размах "барабана"
  }
}

@media (max-width: 768px) {
  .tech-vertical-carousel-wrapper {
    width: 100%; // Не выходим за пределы контейнера на мобильных
    max-width: 280px;
    height: 150px;
  }
}

@media (max-width: 340px) {
  // Уменьшаем элементы, чтобы две колонки помещались в узкий контейнер
  .carousel-item {
    gap: 4px;

    :deep(.technology-container) {
      zoom: 0.85;
    }
  }
}
</style>
