/**
 * プレイヤーキャラクターのクラスを定義するモジュール
 */
import {
    PLAYER_SIZE,
    GRAVITY,
    PLAYER_JUMP_FORCE,
    COLOR_PALETTE,
} from './config.js';

export class Player {
    /**
     * プレイヤーを初期化する
     * @param {number} x プレイヤーの初期X座標
     * @param {number} y プレイヤーの初期Y座標
     */
    constructor(x, y) {
        this.initialX = x;
        this.initialY = y;
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.grounded = false;
        this.sprite = null;
    }

    /**
     * プレイヤーの初期設定を行う
     */
    setup() {
        // 初期位置と速度を設定
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocity = 0;
        this.grounded = false;

        // p5.play Spriteを作成
        this.sprite = new window.Sprite(this.x, this.y, PLAYER_SIZE);
        this.sprite.color = COLOR_PALETTE.PLAYER;

        // プレイヤーキャラクターの見た目をドット絵風に
        this.sprite.shape = 'box';
        this.sprite.collider = 'dynamic';
        this.sprite.rotationLock = true;        // p5.playでは画像ベースのアニメーションがデフォルトですが、
        // 単純な図形でプレイヤーを表現します
        this.sprite.width = PLAYER_SIZE;
        this.sprite.height = PLAYER_SIZE;
        this.sprite.color = COLOR_PALETTE.PLAYER;
        
        // ジャンプアニメーション用の状態変数
        this.isJumping = false;
    }

    /**
     * プレイヤーの状態を更新する
     * @param {Array} platforms 足場オブジェクトの配列
     */
    update(platforms) {
        // 重力を適用
        this.velocity += GRAVITY;
        this.y += this.velocity;

        // スプライトの位置を更新
        this.sprite.x = this.x;
        this.sprite.y = this.y;

        // 着地状態をリセット
        this.grounded = false;

        // 足場との衝突判定
        this.checkCollision(platforms);        // アニメーション状態を更新
        if (!this.grounded) {
            this.isJumping = true;
            // ジャンプ中は少し縦に短くする
            this.sprite.height = PLAYER_SIZE * 0.8;
        } else {
            this.isJumping = false;
            this.sprite.height = PLAYER_SIZE;
        }

        // 床に当たらない簡易処理（画面下限）
        if (this.y > window.height - PLAYER_SIZE / 2) {
            this.y = window.height - PLAYER_SIZE / 2;
            this.velocity = 0;
            this.grounded = true;
        }
    }

    /**
     * 足場との衝突判定
     * @param {Array} platforms 足場オブジェクトの配列
     */
    checkCollision(platforms) {
        if (!platforms) return;

        for (let platform of platforms) {
            // 自分の下端と足場の上端の位置関係
            const playerBottom = this.y + PLAYER_SIZE / 2;
            const platformTop = platform.y;

            // 横方向の衝突範囲
            const playerLeft = this.x - PLAYER_SIZE / 2;
            const playerRight = this.x + PLAYER_SIZE / 2;
            const platformLeft = platform.x;
            const platformRight = platform.x + platform.width;

            // 足場の上に着地する場合の判定
            // 1. 足場の上で、かつ
            // 2. 横方向で足場の範囲内、かつ
            // 3. 落下中（速度が正）
            if (
                playerBottom >= platformTop &&
                playerBottom <= platformTop + platform.height / 2 &&
                playerRight >= platformLeft &&
                playerLeft <= platformRight &&
                this.velocity > 0
            ) {
                // 足場の上に位置を補正
                this.y = platformTop - PLAYER_SIZE / 2;
                this.velocity = 0;
                this.grounded = true;
            }
        }
    }

    /**
     * プレイヤーを描画する
     */
    draw() {
        // Spriteは自動的に描画されるので、
        // p5.playを使用する場合は特別な描画処理は不要
        // ただし、デバッグ用に衝突範囲などを表示することもできる

        // スプライトの自動描画が無効化されている場合のフォールバック
        if (!this.sprite.visible) {
            window.fill(COLOR_PALETTE.PLAYER);
            window.rect(this.x, this.y, PLAYER_SIZE, PLAYER_SIZE);
        }
    }

    /**
     * プレイヤーのジャンプ動作を実行する
     */
    jump() {
        // 地面や足場の上にいる場合のみジャンプ可能
        if (this.grounded) {
            this.velocity = -PLAYER_JUMP_FORCE;
            this.grounded = false;
        }
    }

    /**
     * プレイヤーの状態をリセットする
     */
    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocity = 0;
        this.grounded = false;        // Spriteがすでに存在する場合は位置をリセット
        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.sprite.height = PLAYER_SIZE;
            this.isJumping = false;
        }
    }
}
