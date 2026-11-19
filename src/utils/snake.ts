export type Direction = "up" | "down" | "left" | "right";

export interface Point {
  x: number;
  y: number;
}

export interface SnakeState {
  width: number;
  height: number;
  body: Point[];
  direction: Direction;
  queue: Direction[];
  food: Point;
  score: number;
  over: boolean;
}

const vectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const opposite: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

export function placeFood(state: Pick<SnakeState, "width" | "height" | "body">, random = Math.random): Point {
  const free: Point[] = [];
  for (let y = 0; y < state.height; y++)
    for (let x = 0; x < state.width; x++)
      if (!state.body.some((part) => part.x === x && part.y === y)) free.push({ x, y });
  return free[Math.floor(random() * free.length)] ?? { x: -1, y: -1 };
}

export function createSnake(width: number, height: number, random = Math.random): SnakeState {
  const y = Math.floor(height / 2);
  const x = Math.floor(width / 4);
  const body = [2, 1, 0].map((offset) => ({ x: x + offset, y }));
  return { width, height, body, direction: "right", queue: [], food: placeFood({ width, height, body }, random), score: 0, over: false };
}

export function turn(state: SnakeState, direction: Direction) {
  const last = state.queue[state.queue.length - 1] ?? state.direction;
  if (direction === last || direction === opposite[last] || state.queue.length >= 3) return;
  state.queue.push(direction);
}

export function step(state: SnakeState, random = Math.random): SnakeState {
  if (state.over) return state;
  const direction = state.queue.shift() ?? state.direction;
  const vector = vectors[direction];
  const head = { x: state.body[0].x + vector.x, y: state.body[0].y + vector.y };
  const eats = same(head, state.food);
  const body = eats ? state.body : state.body.slice(0, -1);

  const outside = head.x < 0 || head.y < 0 || head.x >= state.width || head.y >= state.height;
  if (outside || body.some((part) => same(part, head))) return { ...state, direction, over: true };

  const next = { ...state, direction, body: [head, ...body] };
  if (eats) {
    next.score = state.score + 1;
    next.food = placeFood(next, random);
    if (next.food.x < 0) next.over = true;
  }
  return next;
}

export const tickDelay = (score: number) => Math.max(55, 140 - score * 5);

export function render(state: SnakeState): string[] {
  const rows: string[] = [];
  for (let y = 0; y < state.height; y++) {
    let row = "";
    for (let x = 0; x < state.width; x++) {
      const index = state.body.findIndex((part) => part.x === x && part.y === y);
      if (index === 0) row += state.over ? "X" : "@";
      else if (index > 0) row += "o";
      else if (state.food.x === x && state.food.y === y) row += "*";
      else row += "·";
    }
    rows.push(row);
  }
  return rows;
}
