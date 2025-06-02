/**
 * プラットフォームを表すクラス
 */
import { PLATFORM_HEIGHT, PLATFORM_SPEED, COLOR_PALETTE } from './config.js';

// p5.js関数へアクセス
const p5 = window.p5Globals;

export class Platform {
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
    }    /** プラットフォームを描画 */    draw() {
        window.fill(COLOR_PALETTE.PLATFORM);
        window.rect(this.x, this.y, this.width, this.height);
    }

    /** 画面外判定 */
    isOffScreen() {
        return this.x + this.width < 0;
    }
}
