import { expect, test } from 'vitest';
import { search, type Grid } from '../src';

const grid: Grid = [
  [ 0,  { elevation: 5 }, -1,  0,  0, -1,  0, { elevation: 2, isLegal: false, validAsDestination: true }],
  [ 0,  4, -1,  0,  0, -1,  0,  0],
  [ 0,  3, -1,  0,  0, -1,  0, { elevation: 2, isLegal: false, validAsDestination: true }],
  [ 0,  2, -1,  0,  0,  0,  0,  1],
  [ 0,  1, -1,  { elevation: 0 },  0, -1,  0,  0],
  [ 0,  0, -1,  0,  0, -1,  0,  0],
  [ 0,  0,  0,  0,  0, -1,  0,  { elevation: 0, isLegal: false, validAsDestination: true }],
  [ 0,  0, -1,  0,  0, { elevation: 0, isLegal: false, validAsDestination: true },  0,  2],
];

test.concurrent('should enforce array grid input', () => {
  expect(() => {
    return search({
      from: [0, 0],
      to: [0, 7],
      // @ts-expect-error
      grid: null,
    });
  }).toThrowError();
});

test.concurrent('should enforce 2 dimensional array grid input', () => {
  expect(() => {
    return search({
      from: [0, 0],
      to: [0, 7],
      grid: [],
    });
  }).toThrowError();
});

test.concurrent('should pathfind vertically', () => {
  const path = search({
    from: [0, 0],
    to: [0, 7],
    grid,
  });

  expect(path).toStrictEqual([
    [0, 0], [0, 1], [0, 2], [0, 3],
    [0, 4], [0, 5], [0, 6], [0, 7],
  ]);
});

test.concurrent('should pathfind horizontally', () => {
  const path = search({
    from: [0, 6],
    to: [4, 6],
    grid,
  });

  expect(path).toStrictEqual([
    [0, 6], [1, 6], [2, 6], [3, 6], [4, 6],
  ]);
});

test.concurrent('should pathfind diagonally', () => {
  const path = search({
    cutCorners: false,
    diagonal: true,
    from: [0, 7],
    to: [2, 6],
    grid,
  });

  expect(path).toStrictEqual([
    [0, 7], [1, 6], [2, 6],
  ]);
});

test.concurrent('should pathfind diagonally in base directions', () => {
  const path = search({
    cutCorners: false,
    diagonal: false,
    from: [0, 7],
    to: [2, 6],
    grid,
  });

  expect(path).toStrictEqual([
    [0, 7], [1, 7], [1, 6], [2, 6],
  ]);
});

test.concurrent('should pathfind diagonally without cutting corner', () => {
  const path = search({
    cutCorners: false,
    diagonal: true,
    from: [1, 7],
    to: [2, 6],
    grid,
  });

  expect(path).toStrictEqual([
    [1, 7], [1, 6], [2, 6],
  ]);
});

test.concurrent('should pathfind diagonally with cutting corner', () => {
  const path = search({
    cutCorners: true,
    diagonal: true,
    from: [1, 7],
    to: [2, 6],
    grid,
  });

  expect(path).toStrictEqual([
    [1, 7], [2, 6],
  ]);
});

test.concurrent('should consider elevation when pathfinding', () => {
  const path = search({
    cutCorners: false,
    diagonal: true,
    from: [0, 0],
    to: [1, 0],
    grid,
  });

  expect(path).toStrictEqual([
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 4], [1, 3], [1, 2], [1, 1], [1, 0],
  ]);
});

test.concurrent('should allow differing step heights in elevation', () => {
  const path = search({
    cutCorners: false,
    diagonal: true,
    stepHeight: 2,
    from: [0, 0],
    to: [1, 0],
    grid,
  });

  expect(path).toStrictEqual([
    [0, 0], [0, 1], [0, 2], [0, 3],
    [1, 3], [1, 2], [1, 1], [1, 0],
  ]);
});

test.concurrent('should not cut corners over elevated tiles', () => {
  const path = search({
    cutCorners: false,
    diagonal: true,
    from: [1, 0],
    to: [0, 3],
    grid,
  });

  expect(path).toStrictEqual([
    [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [0, 4], [0, 3],
  ]);
});

test.concurrent('should produce similar results with manhattan heuristic', () => {
  const path = search({
    heuristic: 'manhattan',
    cutCorners: false,
    diagonal: true,
    stepHeight: 2,
    from: [0, 0],
    to: [1, 0],
    grid,
  });

  expect(path).toStrictEqual([
    [0, 0], [0, 1], [0, 2], [0, 3],
    [1, 3], [1, 2], [1, 1], [1, 0],
  ]);
});

test.concurrent('should pathfind if starting point is invalid tile', () => {
  const testGrid: Grid = [
    [-1,  5,  5,  -1],
    [ 5,  5,  5,  -1],
    [-1, -1, -1,  -1],
  ];
  const path = search({
    grid: testGrid,
    from: [0, 0],
    to: [2, 0],
  });

  expect(path).toStrictEqual([
    [0, 0], [1, 0], [2, 0],
  ]);
});

test.concurrent('should not allow moving from illegal destination tile to larger than step elevation (lol)', () => {
  const path = search({
    cutCorners: false,
    diagonal: false,
    from: [7, 6],
    to: [7, 7],
    grid,
  });

  expect(path).toStrictEqual(null);
});

test.concurrent('should fail to pathfind when destination is illegal and invalid', () => {
  const path = search({
    cutCorners: false,
    diagonal: false,
    from: [4, 7],
    to: [6, 7],
    grid,
  });

  expect(path).toStrictEqual([
    [4, 7], [4, 6], [4, 5], [4, 4], [4, 3], [5, 3], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7],
  ]);
});

test.concurrent('should allow pathfinding to illegal tile if valid as destination', () => {
  const path = search({
    cutCorners: false,
    diagonal: false,
    from: [4, 7],
    to: [5, 7],
    grid,
  });

  expect(path).toStrictEqual([
    [4, 7], [5, 7],
  ]);
});

test.concurrent('should allow pathfinding to illegal tile if valid as destination and correctly go over pathing', () => {
  const path = search({
    cutCorners: false,
    diagonal: false,
    from: [6, 2],
    to: [7, 2],
    grid,
  });

  expect(path).toStrictEqual([
    [6, 2], [6, 3], [7, 3], [7, 2]
  ]);
});

test.concurrent('should not pathfind to illegal tile that is valid as a destination but above step limit', () => {
  const path = search({
    cutCorners: false,
    diagonal: false,
    from: [7, 1],
    to: [7, 0],
    grid,
  });

  expect(path).toStrictEqual(null);
});
