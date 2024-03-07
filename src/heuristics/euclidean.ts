import type { Heuristic } from './index';

export const euclidean: Heuristic = (from, to) => {
    let dx = ~~(to[0] - from[0]),
        dy = ~~(to[1] - from[1]);

    return Math.sqrt(dx * dx + dy * dy);
};
