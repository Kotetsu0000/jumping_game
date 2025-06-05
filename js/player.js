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
     */ setup() {
        // 初期位置と速度を設定
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocity = 0;
        this.grounded = true; // 初期状態では地面に接地していると仮定
        try {
            // p5.play v3.xでのスプライト作成方法
            // Spriteコンストラクタは現在のp5インスタンスのメソッドとして存在する
            if (window.Sprite) {
                console.log('window.Spriteを使用してスプライトを作成します');
                this.sprite = new window.Sprite(this.x, this.y);
            } else {
                console.error(
                    'Spriteクラスが見つかりません。ダミーオブジェクトを作成します。'
                );
                // スプライト未定義の場合はダミーオブジェクト作成
                this.sprite = {
                    x: this.x,
                    y: this.y,
                    width: PLAYER_SIZE,
                    height: PLAYER_SIZE,
                    visible: false,
                    collide: function () {
                        return false;
                    },
                };
            }

            // プレイヤーキャラクターの見た目と物理設定
            this.sprite.width = PLAYER_SIZE;
            this.sprite.height = PLAYER_SIZE;
            this.sprite.visible = false; // カスタム描画を使用するため非表示
            this.sprite.collider = 'dynamic';
            this.sprite.rotationLock = true;
        } catch (e) {
            console.error(
                'プレイヤースプライトの初期化中にエラーが発生しました:',
                e
            );
            // エラー時にはダミーオブジェクトを作成
            this.sprite = {
                x: this.x,
                y: this.y,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                visible: false,
                collide: function () {
                    return false;
                },
            };
        }

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
     */ update(platforms) {
        // 前のフレームの接地状態を保存
        const wasGrounded = this.grounded;

        // 重力を適用（接地状態でなければ）
        if (!this.grounded) {
            this.velocity += GRAVITY;
            this.y += this.velocity;
        }

        // 衝突判定の前にスプライトの位置を更新（物理位置と同期）
        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;

            // 当たり判定用のspriteサイズを更新
            this.sprite.width = PLAYER_SIZE;
            this.sprite.height = PLAYER_SIZE;

            // デバッグモードの場合、衝突判定の可視化を有効にする
            this.sprite.debug = window.debugMode ? true : false;
        }

        // 着地状態をリセット（毎フレームで再判定）
        this.grounded = false;

        // 足場との衝突判定
        this.checkCollision(platforms);

        // アニメーション状態を更新
        if (!this.grounded) {
            this.isJumping = true;
            // 落下中は標準のアニメーション速度
            this.animationSpeed = 0.08;
        } else {
            this.isJumping = false;
            // 地上では少し速めのアニメーション速度
            this.animationSpeed = 0.1;

            // 着地したばかりの場合、着地エフェクトを適用できる
            if (!wasGrounded && this.grounded) {
                // 着地エフェクトをここに追加できます（必要に応じて）
                if (window.debugMode) {
                    console.log('着地検出: アニメーションリセット');
                }
                this.frameCount = 0; // アニメーションをリセット
            }
        }
    }
    /**
     * 足場との衝突判定
     * @param {Array} platforms 足場オブジェクトの配列
     */ checkCollision(platforms) {
        if (!platforms || platforms.length === 0) return;

        // 前回の接地状態を保存
        const isStartingPosition = Math.abs(this.velocity) < 0.1;
        let isOnAnyPlatform = false;

        // プレイヤーの位置情報
        const playerBottom = this.y + PLAYER_SIZE / 2;
        const prevPlayerBottom = playerBottom - this.velocity;
        const playerLeft = this.x - PLAYER_SIZE / 2;
        const playerRight = this.x + PLAYER_SIZE / 2;

        // 最も効率的な検出のため、プレイヤーの近くにある足場のみを処理
        // 画面内の足場のみを処理（パフォーマンス最適化）
        const nearbyPlatforms = platforms.filter((platform) => {
            // 画面外+少し余白の足場は無視（パフォーマンス最適化）
            if (
                platform.x + platform.width < -50 ||
                platform.x > window.width + 50
            ) {
                return false;
            }
            // プレイヤーから縦方向に遠すぎる足場は無視
            const verticalDistance = Math.abs(platform.y - this.y);
            return verticalDistance < PLAYER_SIZE * 3;
        });

        // 近くの足場に対して衝突判定を実行
        for (let platform of nearbyPlatforms) {
            if (!platform.sprite) continue;

            // 足場の位置情報
            const platformTop = platform.y;
            const platformLeft = platform.x;
            const platformRight = platform.x + platform.width;

            // 水平方向の重なりを確認
            const isOverlappingHorizontally =
                playerRight > platformLeft && playerLeft < platformRight;

            // 衝突判定フラグ
            let isColliding = false;

            try {
                // 最初にp5.playのネイティブ衝突判定を使用
                if (
                    this.sprite &&
                    platform.sprite &&
                    typeof this.sprite.collide === 'function'
                ) {
                    isColliding = this.sprite.collide(platform.sprite);
                }
            } catch (e) {
                console.error('p5.play衝突判定中にエラーが発生しました:', e);
            }

            // p5.playの衝突判定が失敗した場合や結果が不正確な場合、手動での衝突判定を実行
            if (!isColliding && isOverlappingHorizontally) {
                // 着地判定の条件を単純化
                const isFalling = this.velocity >= 0;
                const distanceToSurface = Math.abs(playerBottom - platformTop);

                // 落下中で足場の表面に近い場合
                if (
                    (isFalling || isStartingPosition) &&
                    distanceToSurface < 10
                ) {
                    isColliding = true;
                }
            }

            // 衝突している場合、着地処理を行う
            if (isColliding) {
                // 上からの衝突の場合のみ着地と判定（横や下からぶつかった場合は無視）
                if (prevPlayerBottom <= platformTop + 5 || isStartingPosition) {
                    // 足場の上に位置を補正
                    this.y = platformTop - PLAYER_SIZE / 2;
                    this.velocity = 0;
                    this.grounded = true;
                    isOnAnyPlatform = true;

                    if (window.debugMode) {
                        console.log(
                            `足場に着地: x=${this.x}, y=${this.y}, platform: ${platformLeft}-${platformRight}`
                        );
                    }
                    break; // 一度着地したら他の足場の判定は不要
                }
            }

            // 初期配置時の特別処理（ゲーム開始時に確実に足場の上に立っているようにするため）
            if (
                isStartingPosition &&
                isOverlappingHorizontally &&
                !isOnAnyPlatform
            ) {
                if (Math.abs(playerBottom - platformTop) < 20) {
                    this.y = platformTop - PLAYER_SIZE / 2;
                    this.velocity = 0;
                    this.grounded = true;
                    isOnAnyPlatform = true;
                    if (window.debugMode) {
                        console.log('初期位置で足場に着地');
                    }
                    break;
                }
            }
        }

        // 着地状態の更新（いずれの足場にも乗っていなければ空中にいる）
        if (this.grounded && !isOnAnyPlatform && this.velocity >= 0) {
            this.grounded = false;
            if (window.debugMode) {
                console.log('足場から離れた');
            }
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
        if (window.debugMode) {
            window.noFill();
            window.stroke(255, 255, 0, 200); // 目立つ黄色
            window.strokeWeight(2);
            window.rect(0, 0, PLAYER_SIZE, PLAYER_SIZE);

            // デバッグ情報を表示
            window.fill(255);
            window.textSize(10);
            window.textAlign(window.CENTER, window.CENTER);
            window.text(
                `x:${Math.floor(this.x)},y:${Math.floor(this.y)}`,
                0,
                -PLAYER_SIZE
            );
            window.text(`v:${this.velocity.toFixed(1)}`, 0, -PLAYER_SIZE - 12);
            window.text(`g:${this.grounded ? 'Y' : 'N'}`, 0, -PLAYER_SIZE - 24);
        } else {
            // 通常モードではより控えめな枠線
            window.noFill();
            window.stroke(255, 255, 255, 50);
            window.strokeWeight(1);
            window.rect(0, 0, PLAYER_SIZE, PLAYER_SIZE);
        }

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
     */ reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocity = 0;
        this.grounded = true; // リセット時も接地状態からスタート// Spriteがすでに存在する場合は位置をリセット
        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.sprite.height = PLAYER_SIZE;
            this.isJumping = false;
        }
    }
}
