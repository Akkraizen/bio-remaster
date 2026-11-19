import { describe, expect, it } from "vitest";
import { createSnake, placeFood, render, step, tickDelay, turn, type SnakeState } from "@/utils/snake.ts";

const fixed = (value: number) => () => value;

describe("snake", () => {
  it("moves forward and keeps its length", () => {
    const state = createSnake(10, 5, fixed(0));
    const next = step({ ...state, food: { x: 9, y: 0 } });
    expect(next.body).toHaveLength(3);
    expect(next.body[0]).toEqual({ x: state.body[0].x + 1, y: state.body[0].y });
  });

  it("ignores reversing into itself and limits the queue", () => {
    const state = createSnake(10, 5);
    turn(state, "left");
    expect(state.queue).toEqual([]);
    turn(state, "up");
    turn(state, "left");
    turn(state, "down");
    turn(state, "right");
    expect(state.queue).toEqual(["up", "left", "down"]);
  });

  it("grows and scores when it eats", () => {
    const state = createSnake(10, 5, fixed(0));
    const head = state.body[0];
    const next = step({ ...state, food: { x: head.x + 1, y: head.y } }, fixed(0));
    expect(next.score).toBe(1);
    expect(next.body).toHaveLength(4);
    expect(next.body.some((part) => part.x === next.food.x && part.y === next.food.y)).toBe(false);
  });

  it("dies on walls and on its own tail", () => {
    const wall: SnakeState = { ...createSnake(4, 3), body: [{ x: 3, y: 1 }, { x: 2, y: 1 }], food: { x: 0, y: 0 } };
    expect(step(wall).over).toBe(true);

    const tail: SnakeState = {
      ...createSnake(6, 6),
      body: [
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 3 }
      ],
      direction: "left",
      queue: ["down"],
      food: { x: 5, y: 5 }
    };
    expect(step(tail).over).toBe(true);
  });

  it("places food only on free cells and speeds up", () => {
    const body = [
      { x: 0, y: 0 },
      { x: 1, y: 0 }
    ];
    expect(placeFood({ width: 3, height: 1, body }, fixed(0))).toEqual({ x: 2, y: 0 });
    expect(tickDelay(0)).toBeGreaterThan(tickDelay(10));
    expect(tickDelay(100)).toBe(55);
  });

  it("renders the field", () => {
    const rows = render({ ...createSnake(6, 3), food: { x: 5, y: 0 } });
    expect(rows).toHaveLength(3);
    expect(rows[0][5]).toBe("*");
    expect(rows[1]).toContain("@");
  });
});
