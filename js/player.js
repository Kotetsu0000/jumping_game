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
        this.frameCount = 0; // アニメーション用フレームカウンタ
        this.animationSpeed = 0.1; // アニメーションの速度
        this.pixelSize = PLAYER_SIZE / 8; // ドット（ピクセル）のサイズ
    }

    /**
     * プレイヤーの初期設定を行う
     */
    setup() {
        // 初期位置と速度を設定
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocity = 0;
        this.grounded = false; // p5.play Spriteを作成
        this.sprite = new window.Sprite(this.x, this.y, PLAYER_SIZE);

        // プレイヤーキャラクターの見た目をドット絵風に
        this.sprite.shape = 'box'; // 衝突判定用の基本形状として四角形を使用
        this.sprite.visible = false; // デフォルトの表示を無効化（カスタム描画を使用）
        this.sprite.collider = 'dynamic';
        this.sprite.rotationLock = true;
        this.sprite.width = PLAYER_SIZE;
        this.sprite.height = PLAYER_SIZE;

        // ジャンプアニメーション用の状態変数
        this.isJumping = false;
    }

    /**
     * ドット絵風キャラクターを描画する
     */
    drawPixelCharacter() {
        // 現在のアニメーションフレームを計算
        this.frameCount += this.animationSpeed;
        const frame = Math.floor(this.frameCount) % 4; // 0-3のフレーム

        window.push();
        window.rectMode(window.CENTER); // 中心を基準にした描画モード

        // ドット絵の設計（8x8ピクセル相当）
        // 0=透明, 1=メインカラー, 2=輪郭/シャドウ, 3=ハイライト
        let pixelPattern;

        if (this.isJumping) {
            // ジャンプ中のパターン
            pixelPattern = [
                [0, 0, 2, 2, 2, 0, 0, 0],
                [0, 2, 1, 1, 1, 2, 0, 0],
                [0, 2, 1, 3, 1, 2, 0, 0],
                [0, 2, 1, 1, 1, 2, 2, 0],
                [0, 0, 2, 2, 2, 1, 2, 0],
                [0, 0, 0, 2, 1, 1, 2, 0],
                [0, 0, 0, 2, 1, 2, 0, 0],
                [0, 0, 0, 0, 2, 0, 0, 0],
            ];
        } else if (this.grounded) {
            // 地上にいる時のパターン（フレームによって若干変化）
            if (frame === 0 || frame === 2) {
                // 通常立ちポーズ
                pixelPattern = [
                    [0, 0, 2, 2, 2, 2, 0, 0],
                    [0, 2, 1, 1, 1, 1, 2, 0],
                    [0, 2, 1, 3, 3, 1, 2, 0],
                    [0, 2, 1, 1, 1, 1, 2, 0],
                    [0, 0, 2, 2, 2, 2, 0, 0],
                    [0, 0, 2, 1, 1, 2, 0, 0],
                    [0, 0, 2, 1, 1, 2, 0, 0],
                    [0, 0, 2, 0, 0, 2, 0, 0],
                ];
            } else {
                // 微妙に動くポーズ
                pixelPattern = [
                    [0, 0, 2, 2, 2, 2, 0, 0],
                    [0, 2, 1, 1, 1, 1, 2, 0],
                    [0, 2, 3, 1, 3, 1, 2, 0],
                    [0, 2, 1, 1, 1, 1, 2, 0],
                    [0, 0, 2, 2, 2, 2, 0, 0],
                    [0, 0, 2, 1, 1, 2, 0, 0],
                    [0, 0, 2, 1, 1, 2, 0, 0],
                    [0, 0, 2, 2, 0, 2, 0, 0],
                ];
            }
        } else {
            // 落下中のパターン
            pixelPattern = [
                [0, 0, 2, 2, 2, 2, 0, 0],
                [0, 2, 1, 1, 1, 1, 2, 0],
                [0, 2, 1, 3, 3, 1, 2, 0],
                [0, 2, 1, 1, 1, 1, 2, 0],
                [0, 0, 2, 2, 2, 2, 0, 0],
                [0, 2, 1, 1, 2, 0, 0, 0],
                [2, 1, 1, 1, 2, 0, 0, 0],
                [0, 2, 2, 2, 0, 0, 0, 0],
            ];
        }

        // ドット絵パターンを描画
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const pixel = pixelPattern[y][x];
                if (pixel !== 0) {
                    // ピクセル値に応じて色を設定
                    switch (pixel) {
                        case 1:
                            window.fill(COLOR_PALETTE.PLAYER);
                            break;
                        case 2:
                            window.fill(COLOR_PALETTE.PLAYER_OUTLINE);
                            break;
                        case 3:
                            window.fill(COLOR_PALETTE.PLAYER_HIGHLIGHT);
                            break;
                    }

                    // ピクセル（ドット）を描画
                    const pixelX = (x - 4) * this.pixelSize;
                    const pixelY = (y - 4) * this.pixelSize;
                    window.rect(pixelX, pixelY, this.pixelSize, this.pixelSize);
                }
            }
        }

        window.pop();
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
        this.checkCollision(platforms);
        // アニメーション状態を更新
        if (!this.grounded) {
            this.isJumping = true;
            // ジャンプ中のみアニメーション速度を遅くする
            this.animationSpeed = 0.05;
        } else {
            this.isJumping = false;
            // 地上では通常のアニメーション速度
            this.animationSpeed = 0.1;
        }

        // 当たり判定用のspriteサイズを更新
        // (ドット絵の表現とは別に衝突判定を維持)
        this.sprite.height = PLAYER_SIZE;

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
        // スプライトは非表示なので、ここでカスタム描画を行う
        window.push();
        window.translate(this.x, this.y);
        this.drawPixelCharacter();
        window.pop();

        // デバッグ用：衝突範囲の表示（必要に応じてコメントアウト）
        // window.push();
        // window.noFill();
        // window.stroke('#ff0000');
        // window.rect(this.x, this.y, PLAYER_SIZE, PLAYER_SIZE);
        // window.pop();
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
        this.grounded = false; // Spriteがすでに存在する場合は位置をリセット
        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.sprite.height = PLAYER_SIZE;
            this.isJumping = false;
        }
    }
}
