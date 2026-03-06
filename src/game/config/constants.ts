// Phase Shift — Game constants

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

// Grid dimensions
export const MAX_GRID_COLS = 12;
export const MAX_GRID_ROWS = 10;

// Each dimension panel
export const PANEL_WIDTH = GAME_WIDTH / 2;  // 512
export const PANEL_HEIGHT = GAME_HEIGHT;     // 768
export const PANEL_PADDING = 16;
export const DIVIDER_WIDTH = 4;

// HUD
export const HUD_HEIGHT = 56;

// Calculate cell size to fit grid in panel
export const CELL_SIZE = 48;

// Grid offset within each panel (centered)
export function getGridOffset(gridWidth: number, gridHeight: number, panelIndex: 0 | 1): { x: number; y: number } {
    const panelX = panelIndex * PANEL_WIDTH;
    const gridPixelWidth = gridWidth * CELL_SIZE;
    const gridPixelHeight = gridHeight * CELL_SIZE;
    return {
        x: panelX + (PANEL_WIDTH - gridPixelWidth) / 2,
        y: HUD_HEIGHT + (PANEL_HEIGHT - HUD_HEIGHT - gridPixelHeight) / 2,
    };
}

// Colors
export const COLORS = {
    // Dimension theming
    DIM_A_PRIMARY: 0x4a9eff,    // Blue
    DIM_A_DARK: 0x1a3a66,
    DIM_A_GLOW: 0x6ab4ff,
    DIM_A_BG: 0x0a1628,

    DIM_B_PRIMARY: 0xff8c4a,    // Orange
    DIM_B_DARK: 0x663a1a,
    DIM_B_GLOW: 0xffaa6a,
    DIM_B_BG: 0x1a120a,

    // Tiles
    WALL: 0x334455,
    WALL_STROKE: 0x556677,
    FLOOR: 0x1a1a2e,
    FLOOR_LINE: 0x222244,
    BOX: 0xcc9933,
    BOX_STROKE: 0xeebb55,
    ENTANGLED_BOX: 0xcc33cc,
    ENTANGLED_BOX_STROKE: 0xee55ee,
    PHASE_GATE: 0x33ccaa,
    PHASE_GATE_GLOW: 0x55eedd,
    EXIT: 0x44ff44,
    EXIT_GLOW: 0x88ff88,
    COLLAPSE_PICKUP: 0xffff44,
    COLLAPSE_PICKUP_GLOW: 0xffffaa,
    ICE: 0x88ccff,
    ICE_STROKE: 0xaaddff,

    // Player particle
    PARTICLE: 0xffffff,
    PARTICLE_GLOW: 0xffffff,
    PARTICLE_TRAIL: 0xffffff,

    // UI
    BG: 0x0a0a14,
    DIVIDER: 0x333355,
    HUD_BG: 0x111122,
    HUD_TEXT: 0xccccdd,
    BUTTON: 0x334466,
    BUTTON_HOVER: 0x446688,
    STAR_GOLD: 0xffdd44,
    STAR_EMPTY: 0x444444,
    OVERLAY_BG: 0x000000,

    // Collapse mode
    COLLAPSE_ACTIVE: 0xffdd44,
    COLLAPSE_INACTIVE: 0x666666,
} as const;

// Animation durations (ms)
export const ANIM = {
    MOVE_DURATION: 100,
    BOX_PUSH_DURATION: 120,
    PHASE_GATE_SHIMMER: 2000,
    EXIT_PULSE: 1500,
    PARTICLE_TRAIL_FADE: 400,
    LEVEL_COMPLETE_DELAY: 500,
    TRANSITION_DURATION: 400,
    ICE_SLIDE_DURATION: 80,
    COLLAPSE_FLASH: 200,
} as const;

// Particle trail
export const TRAIL = {
    MAX_SEGMENTS: 6,
    ALPHA_START: 0.5,
    ALPHA_END: 0.05,
    SIZE_START: 0.8,
    SIZE_END: 0.2,
} as const;

// Font styles
export const FONTS = {
    TITLE: {
        fontFamily: '"Courier New", monospace',
        fontSize: '48px',
        color: '#ffffff',
    },
    SUBTITLE: {
        fontFamily: '"Courier New", monospace',
        fontSize: '24px',
        color: '#aaaacc',
    },
    HUD: {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#ccccdd',
    },
    BUTTON: {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: '#ffffff',
    },
    TUTORIAL: {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#88aacc',
        wordWrap: { width: 440 },
    },
    LEVEL_NAME: {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#8888aa',
    },
} as const;
