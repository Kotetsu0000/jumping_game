/**
 * プレイヤーキャラクターのクラスを定義するモジュール
 */
import {
    PLAYER_SIZE,
    GRAVITY,
    PLAYER_JUMP_FORCE,
    COLOR_PALETTE,
} from './config.js';

// p5.js関数は window.p5Globals 経由で直接アクセス

export class Player {
    constructor(x, y) {
        this.initialX = x;
        this.initialY = y;
        this.x = x;
        this.y = y;
        this.velocity = 0;
    }

    setup() {
        // 初期位置と速度を設定
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocity = 0;
    }

    update() {
        // 重力を適用
        this.velocity += GRAVITY;
        this.y += this.velocity;
        // 床に当たらない簡易処理（画面下限）
        if (this.y > window.height - PLAYER_SIZE / 2) {
            this.y = window.height - PLAYER_SIZE / 2;
            this.velocity = 0;
        }
    }

    draw() {
        window.fill(COLOR_PALETTE.PLAYER);
        window.ellipse(this.x, this.y, PLAYER_SIZE, PLAYER_SIZE);
    }

    jump() {
        // ジャンプ処理
        this.velocity = -PLAYER_JUMP_FORCE;
    }

    reset() {
        this.setup();
    }
}
