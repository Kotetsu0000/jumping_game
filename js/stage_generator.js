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
    INITIAL_PLAYER_X,
    INITIAL_PLAYER_Y,
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
        // p5.jsのウィンドウサイズを正しく取得
        this.lastPlatformX = window.width || window.innerWidth;
        this.lastPlatformY = (window.height || window.innerHeight) / 2;
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
        // プレイヤーの初期位置に合わせた最初の足場
        const initialWidth = 200; // 初期足場は広めに

        // 重要：プレイヤーの足元に確実に足場を配置
        // プレイヤーのサイズも考慮して正確に計算
        const initialY = INITIAL_PLAYER_Y + PLAYER_SIZE / 2;

        // プレイヤーが足場の中央に立つように位置を調整
        const initialPlatform = new Platform(
            INITIAL_PLAYER_X - initialWidth / 2,
            initialY,
            initialWidth
        );
        initialPlatform.setup();
        this.platforms.push(initialPlatform);

        console.log(
            `初期足場を配置: x=${
                INITIAL_PLAYER_X - initialWidth / 2
            }, y=${initialY}, width=${initialWidth}`
        );
        console.log(
            `プレイヤー初期位置: x=${INITIAL_PLAYER_X}, y=${INITIAL_PLAYER_Y}`
        );

        // 残りの足場を配置
        let currentX = INITIAL_PLAYER_X + initialWidth / 2 + 50; // 最初の足場の右端から適度な距離を空ける
        let currentY = initialY; // 最初は同じ高さからスタート

        // 画面の右端から少し先までプラットフォームを配置
        while (currentX < window.width + 200) {
            const width = window.random(PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH);
            const platform = new Platform(currentX, currentY, width);
            platform.setup();
            this.platforms.push(platform);

            // 次の足場の位置を決定
            // ジャンプ可能な範囲内で次の足場を配置
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
        // デバッグモードのフラグ（必要に応じて有効化）
        const debugMode = false;

        // プラットフォームを描画
        this.platforms.forEach((p) => p.draw());

        // デバッグモード：プラットフォームとプレイヤーの位置関係を確認
        if (debugMode) {
            window.push();
            window.fill(255);
            window.textSize(10);
            this.platforms.forEach((p, index) => {
                const centerX = p.x + p.width / 2;
                const centerY = p.y + p.height / 2;
                window.text(
                    `P${index}: x=${Math.floor(p.x)},y=${Math.floor(p.y)}`,
                    centerX,
                    centerY - 10
                );
            });
            window.pop();
        }
    }

    /**
     * プラットフォームの状態をリセットする
     */
    reset() {
        this.setup();
    }
}
