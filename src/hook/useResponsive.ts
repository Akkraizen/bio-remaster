import { computed, type ComputedRef, type Ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import type { CyberShape } from "./useCyberShape";

export interface BreakpointQueries {
  mobile: string;
  tablet: string;
  large: string;
  desktop: string;
}

export const DEFAULT_BREAKPOINTS: BreakpointQueries = {
  mobile: "(max-width: 768px)",
  tablet: "(min-width: 769px) and (max-width: 1024px)",
  large: "(max-width: 1024px)",
  desktop: "(min-width: 1025px)"
};

export interface ResponsiveConfig<T> {
  mobile?: T;
  tablet?: T;
  large?: T;
  desktop?: T;
  default: T;
}

export type ResponsiveShapeOption =
  | CyberShape
  | ResponsiveConfig<CyberShape>
  | ((state: ResponsiveState) => CyberShape);

export interface ResponsiveState {
  isMobile: Ref<boolean>;
  isTablet: Ref<boolean>;
  isLarge: Ref<boolean>;
  isDesktop: Ref<boolean>;
}

export function useResponsive(customBreakpoints: Partial<BreakpointQueries> = {}) {
  const queries = {
    ...DEFAULT_BREAKPOINTS,
    ...customBreakpoints
  };

  const isMobile = useMediaQuery(queries.mobile);
  const isTablet = useMediaQuery(queries.tablet);
  const isLarge = useMediaQuery(queries.large);
  const isDesktop = useMediaQuery(queries.desktop);

  const state: ResponsiveState = {
    isMobile,
    isTablet,
    isLarge,
    isDesktop
  };

  /**
   * Resolves a value based on the current screen size.
   * Priority: mobile -> tablet -> large -> desktop -> default
   */
  function resolveResponsive<T>(config: ResponsiveConfig<T>): ComputedRef<T> {
    return computed(() => {
      if (isMobile.value && config.mobile !== undefined) {
        return config.mobile;
      }
      if (isTablet.value && config.tablet !== undefined) {
        return config.tablet;
      }
      if (isLarge.value && config.large !== undefined) {
        return config.large;
      }
      if (isDesktop.value && config.desktop !== undefined) {
        return config.desktop;
      }
      return config.default;
    });
  }

  /**
   * Returns a computed CyberShape from a shape option (string, config, or resolver function).
   */
  function getResponsiveShape(option: ResponsiveShapeOption): ComputedRef<CyberShape> {
    if (typeof option === "function") {
      return computed(() => option(state));
    }
    if (typeof option === "object" && option !== null && "default" in option) {
      return resolveResponsive(option);
    }
    return computed(() => option as CyberShape);
  }

  return {
    isMobile,
    isTablet,
    isLarge,
    isDesktop,
    resolveResponsive,
    getResponsiveShape
  };
}
