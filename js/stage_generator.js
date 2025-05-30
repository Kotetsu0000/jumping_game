import { PLATFORM_SPAWN_INTERVAL, PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH, PLATFORM_MIN_HEIGHT, PLATFORM_MAX_HEIGHT } from './config.js';
import Platform from './platform.js';

/**
 * ステージ生成を担当するモジュール
 * 足場の生成と配置を管理します
 */
export default class StageGenerator {
    constructor() {
        this.platforms = [];
    }

    setup() {
        this.platforms = [];
    }

    update() {
        // 一定間隔でプラットフォームを生成
        if (frameCount % PLATFORM_SPAWN_INTERVAL === 0) {
            const w = random(PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH);
            const y = random(PLATFORM_MIN_HEIGHT, PLATFORM_MAX_HEIGHT);
            this.platforms.push(new Platform(width, y, w));
        }
        // 各プラットフォームの更新
        this.platforms.forEach(p => p.update());
        // 画面外のプラットフォームを削除
        this.platforms = this.platforms.filter(p => !p.isOffScreen());
    }

    draw() {
        this.platforms.forEach(p => p.draw());
    }

    reset() {
        this.setup();
    }
}
