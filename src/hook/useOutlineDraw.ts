const drawnScreens = new Set<string>();
let drawAllowed = true;

export const isOutlineDrawAllowed = () => drawAllowed;

export function enterScreen(path: string) {
  drawAllowed = !drawnScreens.has(path);
  drawnScreens.add(path);
}
