// Phase Shift — AudioManager
// Howler.js skeleton — all sound slots defined, no asset files required yet.
// When audio assets are added, set the src arrays and call enable().
//
// Usage:
//   import { AudioManager } from '../audio/AudioManager';
//   const audio = new AudioManager();
//   audio.playMove();

import { Howl, Howler } from 'howler';

// Slot keys for all Phase Shift sounds
export type SoundSlot =
    | 'move'
    | 'boxPush'
    | 'entangleConnect'
    | 'phaseGatePass'
    | 'iceSlide'
    | 'collapseActivate'
    | 'levelComplete'
    | 'starEarned'
    | 'undo'
    | 'uiClick'
    | 'uiHover';

// Placeholder config — swap src[] with real audio files when available.
// Format: ogg preferred (smaller, better browser support), mp3 fallback.
interface SoundConfig {
    src: string[];
    volume?: number;
    loop?: boolean;
}

const SOUND_CONFIGS: Record<SoundSlot, SoundConfig> = {
    // Player movement — soft click / tap
    move: {
        src: ['audio/move.ogg', 'audio/move.mp3'],
        volume: 0.35,
    },

    // Box push — wooden thud
    boxPush: {
        src: ['audio/box-push.ogg', 'audio/box-push.mp3'],
        volume: 0.45,
    },

    // Entangle connect — crystalline chime, two-tone
    entangleConnect: {
        src: ['audio/entangle-connect.ogg', 'audio/entangle-connect.mp3'],
        volume: 0.5,
    },

    // Phase gate pass — dimensional whoosh
    phaseGatePass: {
        src: ['audio/phase-gate-pass.ogg', 'audio/phase-gate-pass.mp3'],
        volume: 0.5,
    },

    // Ice slide — sliding/glide sound, brief
    iceSlide: {
        src: ['audio/ice-slide.ogg', 'audio/ice-slide.mp3'],
        volume: 0.3,
    },

    // Collapse activate — dimensional shift, low rumble + high shimmer
    collapseActivate: {
        src: ['audio/collapse-activate.ogg', 'audio/collapse-activate.mp3'],
        volume: 0.6,
    },

    // Level complete — achievement chime, triumphant but brief
    levelComplete: {
        src: ['audio/level-complete.ogg', 'audio/level-complete.mp3'],
        volume: 0.7,
    },

    // Star earned — sparkle, higher and brighter than level complete
    starEarned: {
        src: ['audio/star-earned.ogg', 'audio/star-earned.mp3'],
        volume: 0.55,
    },

    // Undo — reverse/rewind sound
    undo: {
        src: ['audio/undo.ogg', 'audio/undo.mp3'],
        volume: 0.3,
    },

    // UI click — menu button press
    uiClick: {
        src: ['audio/ui-click.ogg', 'audio/ui-click.mp3'],
        volume: 0.4,
    },

    // UI hover — subtle hover tick
    uiHover: {
        src: ['audio/ui-hover.ogg', 'audio/ui-hover.mp3'],
        volume: 0.2,
    },
};

export class AudioManager {
    private sounds: Partial<Record<SoundSlot, Howl>> = {};
    private enabled = false;
    private masterVolume = 0.8;

    constructor() {
        Howler.volume(this.masterVolume);
    }

    /**
     * Enable audio. Call this on first user interaction to respect
     * browser autoplay policies. Lazily initializes all Howl instances.
     */
    enable(): void {
        if (this.enabled) return;
        this.enabled = true;
        this.loadAll();
    }

    /**
     * Disable audio globally.
     */
    disable(): void {
        this.enabled = false;
        Howler.mute(true);
    }

    /**
     * Toggle audio on/off.
     */
    toggle(): boolean {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
            Howler.mute(false);
        }
        return this.enabled;
    }

    /**
     * Set master volume (0–1).
     */
    setVolume(vol: number): void {
        this.masterVolume = Math.max(0, Math.min(1, vol));
        Howler.volume(this.masterVolume);
    }

    // --- Playback helpers ---

    /** Soft click on each move step. */
    playMove(): void {
        this.play('move');
    }

    /** Wooden thud when a box is pushed. */
    playBoxPush(): void {
        this.play('boxPush');
    }

    /** Crystalline chime when two entangled boxes connect. */
    playEntangleConnect(): void {
        this.play('entangleConnect');
    }

    /** Dimensional whoosh as the player passes through a phase gate. */
    playPhaseGatePass(): void {
        this.play('phaseGatePass');
    }

    /** Glide sound for ice sliding. */
    playIceSlide(): void {
        this.play('iceSlide');
    }

    /** Dimensional shift sound when collapse is activated. */
    playCollapseActivate(): void {
        this.play('collapseActivate');
    }

    /** Achievement chime on level complete. */
    playLevelComplete(): void {
        this.play('levelComplete');
    }

    /** Sparkle on each star earned. Delay per star index. */
    playStarEarned(starIndex: number = 0): void {
        setTimeout(() => this.play('starEarned'), starIndex * 300);
    }

    /** Reverse/rewind sound on undo. */
    playUndo(): void {
        this.play('undo');
    }

    /** Menu button click. */
    playUiClick(): void {
        this.play('uiClick');
    }

    /** Subtle hover tick. */
    playUiHover(): void {
        this.play('uiHover');
    }

    // --- Internal ---

    private play(slot: SoundSlot): void {
        if (!this.enabled) return;
        const sound = this.sounds[slot];
        if (!sound) return;

        // Stop the previous instance for short sounds to avoid pile-up
        sound.stop();
        sound.play();
    }

    private loadAll(): void {
        for (const [slot, config] of Object.entries(SOUND_CONFIGS) as [SoundSlot, SoundConfig][]) {
            // Only create Howl instances if src files are real.
            // In skeleton mode, we check by convention: if src[0] exists in
            // the public directory, it will load; otherwise Howler silently fails.
            this.sounds[slot] = new Howl({
                src: config.src,
                volume: config.volume ?? 0.5,
                loop: config.loop ?? false,
                preload: false, // Lazy — only load when first played
                onloaderror: (_id, err) => {
                    // Expected during skeleton phase — no actual audio files yet
                    if (import.meta.env.DEV) {
                        console.debug(`[AudioManager] ${slot}: no audio file yet (${err})`);
                    }
                },
            });
        }
    }

    destroy(): void {
        for (const sound of Object.values(this.sounds)) {
            sound?.unload();
        }
        this.sounds = {};
        this.enabled = false;
    }
}
