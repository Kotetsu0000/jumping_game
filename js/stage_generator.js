/**
 * ステージ生成を担当するモジュール
 * 足場の生成と配置を管理します
 */
import { Platform } from './platform.js';
import {
    PLATFORM_SPAWN_INTERVAL,
    PLATFORM_MIN_WIDTH,
    PLATFORM_MAX_WIDTH,
    PLATFORM_MIN_HEIGHT,
    PLATFORM_MAX_HEIGHT,
    PLAYER_JUMP_FORCE,
    GRAVITY,
    PLAYER_SIZE,
} from './config.js';

// p5.js関数は window.p5Globals 経由で直接アクセス

export class StageGenerator {
    constructor() {
        this.platforms = [];
        this.lastPlatformX = 0;
        this.lastPlatformY = 0;
        this.lastPlatformWidth = 0;
        this.difficultyFactor = 1.0; // 難易度係数（時間経過で増加）
        this.gameTime = 0; // ゲーム時間（フレーム数）
        this.nextSpawnInterval = PLATFORM_SPAWN_INTERVAL; // 次の足場生成までの間隔
    }

    /**
     * プラットフォームの初期化処理
     */
    setup() {
        this.platforms = [];
        this.lastPlatformX = window.width;
        this.lastPlatformY = window.height / 2;
        this.lastPlatformWidth = PLATFORM_MIN_WIDTH;
        this.difficultyFactor = 1.0;
        this.gameTime = 0;
        this.nextSpawnInterval = PLATFORM_SPAWN_INTERVAL;

        // 初期の足場を配置
        this.generateInitialPlatforms();
    }

    /**
     * 初期の足場を生成
     */
    generateInitialPlatforms() {
        // 画面内に最初の足場を複数配置
        let currentX = 100; // 最初の足場のX座標
        let currentY = window.height / 2; // 初期Y座標

        while (currentX < window.width + 200) {
            // 画面外少し先まで配置
            const width = window.random(PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH);
            const platform = new Platform(currentX, currentY, width);
            platform.setup();
            this.platforms.push(platform);

            // 次の足場の位置を決定
            currentX += width + window.random(50, 150);
            currentY = this.getNextPlatformY(currentY);

            // 最後の足場情報を更新
            this.lastPlatformX = currentX;
            this.lastPlatformY = currentY;
            this.lastPlatformWidth = width;
        }
    }

    /**
     * プラットフォームの生成と更新を行う
     */
    update() {
        this.gameTime++;

        // 難易度を時間経過で調整
        this.updateDifficulty();

        // 一定間隔でプラットフォームを生成
        if (this.gameTime % this.nextSpawnInterval === 0) {
            const platform = this.generateNewPlatform();
            platform.setup(); // スプライトを初期化
            this.platforms.push(platform);

            // 次の生成間隔を設定（難易度に応じて変化）
            this.nextSpawnInterval = Math.floor(
                PLATFORM_SPAWN_INTERVAL / this.difficultyFactor
            );
            this.nextSpawnInterval = Math.max(this.nextSpawnInterval, 30); // 最小値を設定
        }

        // 各プラットフォームの更新
        this.platforms.forEach((p) => p.update());

        // 画面外のプラットフォームを削除
        this.cleanupPlatforms();
    }

    /**
     * 難易度を更新する
     */
    updateDifficulty() {
        // 30秒（1800フレーム）ごとに難易度を0.1増加
        this.difficultyFactor = 1.0 + (this.gameTime / 1800) * 0.2;

        // 最大難易度を2.0に制限（通常の2倍の速さ）
        this.difficultyFactor = Math.min(this.difficultyFactor, 2.0);

        // 難易度に応じてプラットフォームの速度を調整
        this.platforms.forEach((p) => {
            p.speed = p.baseSpeed * this.difficultyFactor;
        });
    }

    /**
     * 新しいプラットフォームを生成する
     * @returns {Platform} 生成されたプラットフォーム
     */
    generateNewPlatform() {
        const width = window.random(PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH);

        // 次の足場のY座標を決定（前の足場からの相対位置）
        const y = this.getNextPlatformY(this.lastPlatformY);

        // X座標は画面の右端から少し先に配置
        const x = window.width + window.random(50, 100);

        // 最後の足場情報を更新
        this.lastPlatformX = x;
        this.lastPlatformY = y;
        this.lastPlatformWidth = width;

        // 新しいプラットフォームを作成
        const platform = new Platform(x, y, width);

        // 難易度に応じた速度を設定
        platform.speed *= this.difficultyFactor;

        return platform;
    }

    /**
     * 次の足場のY座標を決定する（プレイヤーが到達可能な位置）
     * @param {number} currentY 現在のY座標
     * @returns {number} 次の足場のY座標
     */
    getNextPlatformY(currentY) {
        // ジャンプの最大高さを計算
        const maxJumpHeight = this.calculateMaxJumpHeight(
            PLAYER_JUMP_FORCE,
            GRAVITY
        );

        // 上下の移動範囲を計算（プレイヤーが届く範囲内）
        let minY = currentY - maxJumpHeight + PLAYER_SIZE;
        let maxY = currentY + maxJumpHeight / 3; // 落下の場合は緩やかに

        // 画面内に収める
        minY = Math.max(minY, PLATFORM_MIN_HEIGHT);
        maxY = Math.min(maxY, PLATFORM_MAX_HEIGHT);

        // 新しいY座標をランダムに決定
        return window.random(minY, maxY);
    }

    /**
     * プレイヤーのジャンプ力と重力から最大ジャンプ高さを計算
     * @param {number} jumpForce ジャンプ力
     * @param {number} gravity 重力加速度
     * @returns {number} 最大ジャンプ高さ
     */
    calculateMaxJumpHeight(jumpForce, gravity) {
        // 物理式：h = v^2 / (2g)
        return (jumpForce * jumpForce) / (2 * gravity);
    }

    /**
     * 画面外のプラットフォームを削除する
     */
    cleanupPlatforms() {
        // 画面外に出た足場を削除
        this.platforms = this.platforms.filter((p) => !p.isOffScreen());
    }

    /**
     * すべてのプラットフォームを描画する
     */
    draw() {
        this.platforms.forEach((p) => p.draw());
    }

    /**
     * プラットフォームの状態をリセットする
     */
    reset() {
        this.setup();
    }
}
