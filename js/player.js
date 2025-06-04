/**
 * プレイヤーキャラクターのクラスを定義するモジュール
 */
import {
    PLAYER_SIZE,
    GRAVITY,
    PLAYER_JUMP_FORCE,
    COLOR_PALETTE,
} from './config.js';

// ドット絵アニメーション用の定数
const PIXEL_GRID_SIZE = 8; // ドット絵の解像度（8x8ピクセル）

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
        this.pixelSize = PLAYER_SIZE / PIXEL_GRID_SIZE; // ドット（ピクセル）のサイズ
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
        for (let y = 0; y < PIXEL_GRID_SIZE; y++) {
            for (let x = 0; x < PIXEL_GRID_SIZE; x++) {
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
                    const centerOffset = PIXEL_GRID_SIZE / 2; // 中心位置を計算
                    const pixelX = (x - centerOffset) * this.pixelSize;
                    const pixelY = (y - centerOffset) * this.pixelSize;
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
        // 着地状態をリセット（毎フレーム判定が必要）
        this.grounded = false;

        // 足場との衝突判定
        this.checkCollision(platforms);

        // 重力を適用（衝突判定の後に速度を更新）
        if (!this.grounded) {
            this.velocity += GRAVITY;
            this.y += this.velocity;
        }

        // スプライトの位置を更新
        this.sprite.x = this.x;
        this.sprite.y = this.y;

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
        if (!platforms || platforms.length === 0) return;

        // ゲーム開始直後のための特別な処理
        // プレイヤーのほぼ真下に足場があるかをチェック
        const isStartingPosition =
            this.velocity === 0 && this.grounded === false;

        let isOnAnyPlatform = false; // いずれかの足場の上にいるかのフラグ

        for (let platform of platforms) {
            // プレイヤーの位置情報
            const playerBottom = this.y + PLAYER_SIZE / 2;
            const playerTop = this.y - PLAYER_SIZE / 2;
            const playerLeft = this.x - PLAYER_SIZE / 2;
            const playerRight = this.x + PLAYER_SIZE / 2;

            // 足場の位置情報
            const platformTop = platform.y;
            const platformBottom = platform.y + platform.height;
            const platformLeft = platform.x;
            const platformRight = platform.x + platform.width;

            // 前のフレームでのプレイヤーの位置（速度を使って計算）
            const prevPlayerBottom = playerBottom - this.velocity;

            // 横方向の重なりを確認
            const isOverlappingHorizontally =
                playerRight > platformLeft && playerLeft < platformRight;

            // ケース1: 初期配置時または静止時 - 真下に足場があれば着地
            if (isStartingPosition && isOverlappingHorizontally) {
                // 足場との距離が近ければ着地（初期配置または静止時用）
                if (Math.abs(playerBottom - platformTop) < 5) {
                    this.y = platformTop - PLAYER_SIZE / 2;
                    this.velocity = 0;
                    this.grounded = true;
                    isOnAnyPlatform = true;
                    console.log('初期位置で足場に着地');
                    break; // 着地判定終了
                }
            }

            // ケース2: 落下中の通常の着地判定
            else if (this.velocity > 0) {
                // 衝突判定
                // 1. 前のフレームではプレイヤーの下端が足場の上端より上にあった
                // 2. 現在のフレームではプレイヤーの下端が足場の上端より下にある
                // 3. プレイヤーが水平方向で足場と重なっている
                if (
                    prevPlayerBottom <= platformTop &&
                    playerBottom >= platformTop &&
                    isOverlappingHorizontally
                ) {
                    // 足場の上に位置を補正
                    this.y = platformTop - PLAYER_SIZE / 2;
                    this.velocity = 0;
                    this.grounded = true;
                    isOnAnyPlatform = true;
                    // console.log("落下中に足場に着地");
                    break; // 一度着地したら他の足場の判定は不要
                }
            }
        }

        // 着地状態の更新（いずれの足場にも乗っていなければ空中にいる）
        if (this.grounded && !isOnAnyPlatform && this.velocity >= 0) {
            this.grounded = false;
            // console.log("足場から離れた");
        }
    }

    /**
     * プレイヤーを描画する
     * issueの命名規則に合わせて、display()メソッドとして定義
     */
    display() {
        window.push();

        // rectModeをCENTERに設定して衝突判定と描画を一致させる
        window.rectMode(window.CENTER);

        // キャラクターの位置に移動（中心座標として扱う）
        window.translate(this.x, this.y);

        // キャラクターのドット絵を描画
        this.drawPixelCharacter();

        // 衝突判定の範囲を示す枠線
        window.noFill();
        window.stroke(255, 255, 255, 100); // 少し明確な白色
        window.strokeWeight(1);
        window.rect(0, 0, PLAYER_SIZE, PLAYER_SIZE);

        // デバッグ情報を表示（オプション）
        // window.fill(255);
        // window.textSize(10);
        // window.text(`x:${Math.floor(this.x)},y:${Math.floor(this.y)}`, 0, 0);

        window.pop();
    }

    /**
     * 下位互換性のために draw() も維持（他のコンポーネントと一貫性を保つため）
     */
    draw() {
        this.display();
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
