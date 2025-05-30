import { PLATFORM_SPEED, PLATFORM_HEIGHT, COLOR_PALETTE } from './config.js';

/**
 * プラットフォームを表すクラス
 */
export default class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = PLATFORM_HEIGHT;
        this.speed = PLATFORM_SPEED;
    }

    /** 初期化処理（必要に応じて） */
    setup() {
        // 現在は追加処理なし
    }

    /** プラットフォームの移動を更新 */
    update() {
        this.x -= this.speed;
    }

    /** プラットフォームを描画 */
    draw() {
        fill(COLOR_PALETTE.PLATFORM);
        rect(this.x, this.y, this.width, this.height);
    }

    /** 画面外判定 */
    isOffScreen() {
        return this.x + this.width < 0;
    }
}
