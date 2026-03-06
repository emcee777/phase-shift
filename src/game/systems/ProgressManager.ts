// Phase Shift — ProgressManager
// Handles saving/loading game progress to localStorage

import { GameProgress } from '../types';

const STORAGE_KEY = 'phase-shift-progress';

export class ProgressManager {
    private progress: GameProgress;

    constructor() {
        this.progress = this.load();
    }

    private load(): GameProgress {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw) as GameProgress;
            }
        } catch {
            // Corrupted data, reset
        }
        return this.getDefault();
    }

    private getDefault(): GameProgress {
        return {
            levels: {},
            stars: {},
            unlockedWorld: 1,
        };
    }

    save(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
        } catch {
            // localStorage full or unavailable
        }
    }

    completeLevel(world: number, level: number, moves: number, par: [number, number, number]): number {
        const wKey = String(world);
        const lKey = String(level);

        if (!this.progress.levels[wKey]) this.progress.levels[wKey] = {};
        if (!this.progress.stars[wKey]) this.progress.stars[wKey] = {};

        // Track best moves
        const prev = this.progress.levels[wKey][lKey] ?? Infinity;
        if (moves < prev) {
            this.progress.levels[wKey][lKey] = moves;
        }

        // Calculate stars
        const stars = moves <= par[0] ? 3 : moves <= par[1] ? 2 : moves <= par[2] ? 1 : 0;
        const prevStars = this.progress.stars[wKey][lKey] ?? 0;
        if (stars > prevStars) {
            this.progress.stars[wKey][lKey] = stars;
        }

        // Unlock next world if this is the last level
        if (level === 20 && world >= this.progress.unlockedWorld) {
            this.progress.unlockedWorld = Math.min(world + 1, 10);
        }

        // Unlock next world if enough stars
        const worldStars = this.getWorldStars(world);
        if (worldStars >= 10 && world >= this.progress.unlockedWorld) {
            this.progress.unlockedWorld = Math.min(world + 1, 10);
        }

        this.save();
        return Math.max(stars, prevStars);
    }

    isLevelCompleted(world: number, level: number): boolean {
        const wKey = String(world);
        const lKey = String(level);
        return (this.progress.levels[wKey]?.[lKey] ?? -1) > 0;
    }

    getLevelStars(world: number, level: number): number {
        return this.progress.stars[String(world)]?.[String(level)] ?? 0;
    }

    getBestMoves(world: number, level: number): number | null {
        const v = this.progress.levels[String(world)]?.[String(level)];
        return v && v !== Infinity ? v : null;
    }

    getWorldStars(world: number): number {
        const wKey = String(world);
        const worldStars = this.progress.stars[wKey];
        if (!worldStars) return 0;
        return Object.values(worldStars).reduce((sum, s) => sum + s, 0);
    }

    getWorldCompletion(world: number): number {
        const wKey = String(world);
        const worldLevels = this.progress.levels[wKey];
        if (!worldLevels) return 0;
        return Object.keys(worldLevels).length;
    }

    isWorldUnlocked(world: number): boolean {
        return world <= this.progress.unlockedWorld;
    }

    getTotalStars(): number {
        let total = 0;
        for (const wKey of Object.keys(this.progress.stars)) {
            for (const lKey of Object.keys(this.progress.stars[wKey])) {
                total += this.progress.stars[wKey][lKey];
            }
        }
        return total;
    }

    resetProgress(): void {
        this.progress = this.getDefault();
        this.save();
    }
}
