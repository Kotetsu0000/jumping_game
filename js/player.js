/**
 * プレイヤーキャラクターのクラスを定義するモジュール
 */
import {
    PLAYER_SIZE,
    COLOR_PALETTE,
    MARIO_JUMP_PARAMS,
    HORIZONTAL_SPEED_THRESHOLDS,
    PLATFORM_SPEED,
} from './config.js';

// ドット絵アニメーション用の定数
const PIXEL_GRID_SIZE = 8; // ドット絵の解像度（8x8ピクセル）

export class Player {
    /**
     * プレイヤーを初期化する
     * @param {number} x プレイヤーの初期X座標
     * @param {number} y プレイヤーの初期Y座標
     */ constructor(x, y) {
        this.initialX = x;
        this.initialY = y;
        this.x = x;
        this.y = y;

        // 従来の物理システム用変数（互換性のために残す）
        this.velocity = 0;
        this.grounded = false;

        // マリオスタイルのジャンプパラメータ
        this.verticalPositionOrigin = 0; // ジャンプ開始時の位置
        this.verticalSpeed = 0; // 現在の速度
        this.verticalForce = 0; // 現在の加速度
        this.verticalForceFall = 0; // 下降時の加速度
        this.verticalForceDecimalPart = 0; // 加速度の小数部分
        this.correctionValue = 0; // 補正値
        this.horizontalSpeed = PLATFORM_SPEED; // 横方向の見かけの速度（本ゲームは横スクロールなのでプラットフォームの速度を使用）

        // ジャンプボタンの状態
        this.jumpBtnPrevPress = false;
        this.jumpButtonHoldFrames = 0; // ジャンプボタンを押しているフレーム数
        // マリオスタイルのジャンプ状態
        this.movementState = 'OnGround'; // 'OnGround' or 'Jumping'
        this.jumpStartFrame = 0; // ジャンプ開始時のフレーム番号

        this.sprite = null;
        this.frameCount = 0; // アニメーション用フレームカウンタ
        this.animationSpeed = 0.1; // アニメーションの速度
        this.pixelSize = PLAYER_SIZE / PIXEL_GRID_SIZE; // ドット（ピクセル）のサイズ

        // ジャンプアニメーション用の状態変数
        this.isJumping = false;
    }

    /**
     * プレイヤーの初期設定を行う
     */
    setup() {
        // 初期位置と速度を設定
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocity = 0;
        this.grounded = true; // 初期状態では地面に接地していると仮定

        // マリオスタイルのジャンプパラメータをリセット
        this.resetJumpParams();

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
    }

    /**
     * マリオスタイルのジャンプパラメータをリセットする
     */
    resetJumpParams() {
        this.verticalSpeed = 0;
        this.verticalForce = 0;
        this.verticalForceFall = 0;
        this.verticalForceDecimalPart = 0;
        this.movementState = 'OnGround';
        this.correctionValue = 0;
        this.verticalPositionOrigin = this.y;
        this.jumpStartFrame = 0;
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
     * @param {boolean} jumpButtonPressed ジャンプボタンが押されているかどうか
     */ update(platforms, jumpButtonPressed = false) {
        // 前のフレームの接地状態を保存
        const wasGrounded = this.grounded;

        // マリオスタイルの移動処理
        // GameManagerから渡された入力状態を優先使用
        this.movement(jumpButtonPressed);

        // スプライトの状態を更新（物理位置と同期）
        if (this.sprite) {
            // 位置を同期
            this.sprite.x = this.x;
            this.sprite.y = this.y;

            // 当たり判定用のspriteサイズを更新
            this.sprite.width = PLAYER_SIZE;
            this.sprite.height = PLAYER_SIZE;

            // 速度情報も同期（p5.playの物理エンジン連携のため）
            if (this.sprite.vel) {
                // y方向の速度を同期
                this.sprite.vel.y = this.verticalSpeed;
                // x方向は実際には動かないが、見かけ上は移動しているように
                this.sprite.vel.x = 0;
            }

            // デバッグモードの場合、衝突判定の可視化を有効にする
            this.sprite.debug = window.debugMode ? true : false;
        }

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
     * マリオスタイルの移動処理
     * @param {boolean} jumpBtnPress ジャンプボタンが押されているか
     */
    movement(jumpBtnPress) {
        // ジャンプ判定
        this.jumpCheck(jumpBtnPress);

        // マリオスタイルの物理演算処理
        this.moveProcess(jumpBtnPress);

        // ボタンの状態を保存
        this.jumpBtnPrevPress = jumpBtnPress;
    }
    /**
     * ジャンプ入力の判定
     * @param {boolean} jumpBtnPress ジャンプボタンが押されているか
     */
    jumpCheck(jumpBtnPress) {
        // ジャンプボタンの状態をデバッグ出力（フレーム数で制限）
        if (window.frameCount % 60 === 0) {
            console.log(
                `ボタン状態: 現在=${jumpBtnPress}, 前回=${this.jumpBtnPrevPress}, grounded=${this.grounded}, state=${this.movementState}, 長押しフレーム=${this.jumpButtonHoldFrames}`
            );
        }

        // ボタンが押されている状態を更新
        if (jumpBtnPress && this.grounded) {
            this.jumpButtonHoldFrames++;
        } else if (!jumpBtnPress) {
            this.jumpButtonHoldFrames = 0;
        }

        // 前回押されていなくて、今回押された場合のみジャンプ処理を行う
        if (jumpBtnPress && !this.jumpBtnPrevPress && this.grounded) {
            // 接地状態でボタンが押されたらジャンプ開始
            if (this.movementState === 'OnGround') {
                this.preparingJump();
                console.log('ジャンプ開始！');
            } else {
                console.log(
                    `ジャンプ拒否: 地上にいるはずなのに状態が${this.movementState}`
                );
            }
        } else if (jumpBtnPress && !this.jumpBtnPrevPress && !this.grounded) {
            console.log('ジャンプ拒否: 空中にいる');
        }

        // 長押し効果の適用（ジャンプ中かつボタンが押されている場合）
        if (this.movementState === 'Jumping' && jumpBtnPress) {
            const framesSinceJump = window.frameCount - this.jumpStartFrame;
            // 効果フレーム数内であれば上昇力を増加させる
            if (framesSinceJump <= MARIO_JUMP_PARAMS.HOLD_JUMP_FRAMES) {
                // 上昇中のみ効果を適用
                if (this.verticalSpeed < 0) {
                    // 上昇速度を維持する効果（小さい値ほど速度減少が遅くなる）
                    this.verticalForce = Math.max(
                        this.verticalForce -
                            MARIO_JUMP_PARAMS.HOLD_JUMP_POWER_FACTOR,
                        MARIO_JUMP_PARAMS.VERTICAL_FORCE[4] * 0.8 // 最低値の設定
                    );

                    // デバッグ情報（50フレームごとに表示）
                    if (framesSinceJump % 5 === 0) {
                        console.log(
                            `長押し効果適用中: 上昇力=${this.verticalForce}, フレーム=${framesSinceJump}`
                        );
                    }
                }
            }
        }
    }
    /**
     * ジャンプ準備処理
     */
    preparingJump() {
        this.verticalForceDecimalPart = 0;
        this.verticalPositionOrigin = this.y;
        this.jumpStartFrame = window.frameCount || 0; // ジャンプ開始フレームを記録

        this.movementState = 'Jumping';
        this.grounded = false; // 即座に接地状態を解除

        // ボタン長押し時間に基づいてジャンプ強度を選択
        // 長押しフレーム数が多いほど強力なジャンプインデックスを選択
        let idx = 0; // デフォルトは小ジャンプ

        if (this.jumpButtonHoldFrames >= 15) {
            idx = 4; // 最大ジャンプ
        } else if (this.jumpButtonHoldFrames >= 10) {
            idx = 3; // 大ジャンプ
        } else if (this.jumpButtonHoldFrames >= 5) {
            idx = 2; // 中ジャンプ
        } else if (this.jumpButtonHoldFrames >= 2) {
            idx = 1; // 小～中ジャンプ
        }

        // 横速度も考慮（オプション - 現在はコメントアウト）
        /*
        HORIZONTAL_SPEED_THRESHOLDS.forEach((threshold, i) => {
            if (this.horizontalSpeed >= threshold) {
                idx = Math.min(idx + 1, 4); // インデックスは0-4の範囲に制限
            }
        });
        */

        // ジャンプパラメータを設定
        this.verticalForce = MARIO_JUMP_PARAMS.VERTICAL_FORCE[idx];
        this.verticalForceFall = MARIO_JUMP_PARAMS.VERTICAL_FALL_FORCE[idx];
        this.verticalForceDecimalPart =
            MARIO_JUMP_PARAMS.INITIAL_FORCE_DECIMAL[idx];
        this.verticalSpeed = MARIO_JUMP_PARAMS.INITIAL_SPEEDS[idx];

        console.log(
            `ジャンプ開始: 長押しフレーム=${this.jumpButtonHoldFrames}, インデックス=${idx}, 初速=${this.verticalSpeed}, 上昇力=${this.verticalForce}`
        );
    }

    /**
     * マリオスタイルの物理演算処理
     * @param {boolean} jumpBtnPress ジャンプボタンが押されているか
     */
    moveProcess(jumpBtnPress) {
        if (this.movementState === 'OnGround') {
            return; // 接地状態なら何もしない
        }

        // 速度がプラスなら画面下へ進んでいるものとして落下状態の加速度に切り替える
        if (this.verticalSpeed >= 0) {
            this.verticalForce = this.verticalForceFall;
        } else {
            // ボタンが離された＆上昇中？
            if (!jumpBtnPress && this.jumpBtnPrevPress) {
                // 落下時の加速度値に切り替える（すぐに落下開始するように）
                this.verticalForce = this.verticalForceFall;
            }

            // ジャンプ力が弱まっていくように
            const jumpDuration = this.verticalPositionOrigin - this.y;
            if (jumpDuration >= 50) {
                // 一定高度以上は必ず落下加速度に切り替え
                this.verticalForce = this.verticalForceFall;
            }
        }

        // 物理演算
        this.physics(); // 滞空時間が長すぎる場合の緊急落下処理
        // 長時間滞空対策は更に緩和（より長く滞空できるようにする）
        const airTime = window.frameCount - this.jumpStartFrame;
        if (airTime > 150) {
            // 120から150に増やして滞空時間を延長
            // 約2.5秒間滞空したら緩やかに落下速度を上げる
            this.verticalSpeed = Math.max(this.verticalSpeed, 1.5); // 2から1.5に減らして落下を緩やかに
            if (window.debugMode) {
                console.log('長時間滞空状態を検知: 落下処理適用（緩やかに）');
            }
        }
    }

    /**
     * マリオスタイルの物理演算
     */
    physics() {
        // 前の位置を保存（デバッグ用）
        const prevY = this.y;

        // 累積計算での補正値
        let cy = 0;
        this.correctionValue += this.verticalForceDecimalPart;
        if (this.correctionValue >= 256) {
            this.correctionValue -= 256;
            cy = 1;
        }

        // 速度を加算 (累積計算での補正値も加算)
        this.y += this.verticalSpeed + cy;

        // 小数点部への加算
        // オーバーフローしたら、速度が加算される。その時、加速度の整数部は0に戻される
        this.verticalForceDecimalPart += this.verticalForce;
        if (this.verticalForceDecimalPart >= 256) {
            this.verticalForceDecimalPart -= 256;
            this.verticalSpeed++;
        }

        // 落下速度制限チェック - 必ず適用されるようにする
        if (this.verticalSpeed >= MARIO_JUMP_PARAMS.DOWN_SPEED_LIMIT) {
            this.verticalSpeed = MARIO_JUMP_PARAMS.DOWN_SPEED_LIMIT;
            this.verticalForceDecimalPart = 0x00;
        }

        // 従来のvelocity変数も更新（互換性のため）
        this.velocity = this.verticalSpeed;

        // 位置変化がない場合の対策（浮遊バグ防止）
        if (
            Math.abs(this.y - prevY) < 0.1 &&
            !this.grounded &&
            this.verticalSpeed >= 0
        ) {
            // 静止状態になってしまったら少し押し下げる
            this.y += 1;
            this.verticalSpeed = Math.max(1, this.verticalSpeed);
            if (window.debugMode) {
                console.log('静止状態検知: 位置調整');
            }
        }
    }

    /**
     * 足場との衝突判定
     * @param {Array} platforms 足場オブジェクトの配列
     */
    checkCollision(platforms) {
        if (!platforms || platforms.length === 0) {
            // 足場がない場合は接地状態を解除
            if (this.grounded) {
                this.grounded = false;
                this.movementState = 'Jumping';
                if (window.debugMode) {
                    console.log('足場なし: 空中状態に設定');
                }
            }
            return;
        }

        // 前回の接地状態を保存
        const isStartingPosition = Math.abs(this.velocity) < 0.1;
        let isOnAnyPlatform = false;

        // プレイヤーの位置情報（デバッグ用）
        const playerBottom = this.y + PLAYER_SIZE / 2;
        const prevPlayerBottom = playerBottom - this.velocity;

        // デバッグ情報を出力
        if (window.debugMode && window.frameCount % 60 === 0) {
            console.log(
                `プレイヤー状態: grounded=${this.grounded}, state=${
                    this.movementState
                }, y=${Math.floor(this.y)}, vSpeed=${this.verticalSpeed.toFixed(
                    2
                )}`
            );
        }

        // 最適化: プレイヤーの近くにある足場のみを処理
        const nearbyPlatforms = this.getNearbyPlatforms(platforms);

        // 衝突判定の優先度を設定: 落下中の場合は上にある足場を優先
        if (this.verticalSpeed > 0) {
            nearbyPlatforms.sort((a, b) => a.y - b.y);
        }

        // p5.playのスプライト位置を同期
        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }

        // 衝突判定を実行
        for (let platform of nearbyPlatforms) {
            if (!platform.sprite) continue;

            // スプライトの位置を同期
            platform.sprite.x = platform.x + platform.width / 2;
            platform.sprite.y = platform.y + platform.height / 2;

            // 衝突判定
            let isColliding = false;

            // p5.playのネイティブ衝突判定を使用
            try {
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

            // 衝突していない場合はバックアップ判定を使用
            if (!isColliding) {
                isColliding = this.checkBackupCollision(
                    platform,
                    isStartingPosition
                );
            }

            // 衝突している場合、着地処理を行う
            if (isColliding) {
                const platformTop = platform.y;

                // 上からの衝突の場合のみ着地と判定
                if (
                    prevPlayerBottom <= platformTop + 10 ||
                    isStartingPosition ||
                    this.verticalSpeed >= 0
                ) {
                    // 足場の上に位置を補正
                    this.y = platformTop - PLAYER_SIZE / 2;
                    this.velocity = 0;
                    this.grounded = true;
                    isOnAnyPlatform = true;

                    // マリオスタイルのジャンプ状態も更新
                    this.movementState = 'OnGround';
                    this.verticalSpeed = 0;
                    this.verticalForceDecimalPart = 0;

                    if (window.debugMode) {
                        console.log(
                            `足場に着地: platform.id=${
                                platform._id
                            }, x=${Math.floor(this.x)}, y=${Math.floor(this.y)}`
                        );
                    }
                    break; // 一度着地したら他の足場の判定は不要
                }
            }
        }

        // 着地状態の更新（いずれの足場にも乗っていなければ空中にいる）
        this.updateAirborneState(isOnAnyPlatform);
    }

    /**
     * プレイヤーの近くにある足場を抽出する
     * @param {Array} platforms 足場オブジェクトの配列
     * @returns {Array} プレイヤーの近くにある足場の配列
     */
    getNearbyPlatforms(platforms) {
        // プラットフォームがない場合は空配列を返す（エラー防止）
        if (!platforms || platforms.length === 0) return [];

        // プレイヤーの位置情報
        const playerLeft = this.x - PLAYER_SIZE / 2;
        const playerRight = this.x + PLAYER_SIZE / 2;
        const playerTop = this.y - PLAYER_SIZE / 2;
        const playerBottom = this.y + PLAYER_SIZE / 2;

        // 垂直方向の検出範囲（プレイヤーの状態に応じて動的に調整）
        let verticalRange = PLAYER_SIZE * 4; // デフォルトの検出範囲

        // 落下速度が速い場合は検出範囲を広げる（見逃し防止）
        if (this.verticalSpeed > 2) {
            verticalRange += this.verticalSpeed * 10;
        }

        // 水平方向の検出範囲も速度に基づいて調整
        const horizontalBackRange = 100; // 後方の検出範囲
        const horizontalForwardRange = 200 + this.horizontalSpeed * 10; // 前方の検出範囲（横スクロール速度の影響を考慮）

        // 最適化：platforms配列を直接参照する代わりに、新しい配列を作成
        const nearbyPlatforms = [];

        for (let i = 0; i < platforms.length; i++) {
            const platform = platforms[i];

            // プレイヤーの後方（左側）にある足場は無視
            if (
                platform.x + platform.width <
                playerLeft - horizontalBackRange
            ) {
                continue;
            }

            // プレイヤーの前方（右側）にある足場も距離に応じて無視
            if (platform.x > playerRight + horizontalForwardRange) {
                continue;
            }

            // 垂直方向のフィルタリング
            const verticalDistance = Math.abs(platform.y - this.y);
            if (verticalDistance < verticalRange) {
                nearbyPlatforms.push(platform);
            }
        }

        // デバッグ情報
        if (window.debugMode && window.frameCount % 180 === 0) {
            console.log(
                `総プラットフォーム数: ${platforms.length}, 検出範囲内: ${nearbyPlatforms.length}`
            );
        }

        return nearbyPlatforms;
    }
    /**
     * バックアップの衝突判定（p5.playの判定が失敗した場合に使用）
     * @param {Object} platform 足場オブジェクト
     * @param {boolean} isStartingPosition 初期位置かどうか
     * @returns {boolean} 衝突しているかどうか
     */
    checkBackupCollision(platform, isStartingPosition) {
        const playerBottom = this.y + PLAYER_SIZE / 2;
        const playerTop = this.y - PLAYER_SIZE / 2;
        const playerLeft = this.x - PLAYER_SIZE / 2;
        const playerRight = this.x + PLAYER_SIZE / 2;

        const platformTop = platform.y;
        const platformBottom = platform.y + platform.height;
        const platformLeft = platform.x;
        const platformRight = platform.x + platform.width;

        // 水平方向の重なりを確認
        const isOverlappingHorizontally =
            playerRight > platformLeft && playerLeft < platformRight;

        if (!isOverlappingHorizontally) return false;

        // プレイヤーの垂直方向の状態を評価
        const isFalling = this.verticalSpeed >= 0;

        // 垂直方向の重なりもチェック（完全に足場の中にいる場合は衝突とみなさない）
        const isOverlappingVertically =
            playerBottom > platformTop && playerTop < platformBottom;

        if (!isOverlappingVertically && !isStartingPosition) return false;

        // プレイヤーの足元から足場の表面までの距離
        const distanceToSurface = playerBottom - platformTop;

        // 衝突判定の閾値を動的に設定（落下速度が速いほど大きい値、最低10ピクセル）
        const collisionThreshold = Math.max(
            10,
            12 + Math.abs(this.verticalSpeed) * 2
        ); // 落下中で足場の表面に近い場合、または初期位置の場合
        const isValidCollision =
            (isFalling &&
                distanceToSurface >= -2 && // わずかに足場の上にいる場合も許容
                distanceToSurface < collisionThreshold) ||
            (isStartingPosition && Math.abs(distanceToSurface) < 20);

        if (isValidCollision) {
            if (window.collisionDebugMode) {
                console.log(
                    `着地判定(バックアップ): 距離=${distanceToSurface.toFixed(
                        2
                    )}, ` +
                        `落下中=${isFalling}, 速度=${this.verticalSpeed.toFixed(
                            2
                        )}, ` +
                        `閾値=${collisionThreshold.toFixed(2)}`
                );
            }
            return true;
        }

        return false;
    }

    /**
     * 着地状態の更新（足場に乗っていない場合は空中状態に）
     * @param {boolean} isOnAnyPlatform いずれかの足場に乗っているかどうか
     */
    updateAirborneState(isOnAnyPlatform) {
        // いずれの足場にも乗っていなければ空中にいる
        if (this.grounded && !isOnAnyPlatform) {
            this.grounded = false;
            this.movementState = 'Jumping';

            // 落下開始時に少し下向きの初速を与える（停滞防止）
            if (this.velocity <= 0) {
                this.verticalSpeed = 0.5;
                this.velocity = 0.5;
            }

            if (window.debugMode) {
                console.log('足場から離れた - 落下開始');
            }
        }

        // 浮遊状態の修正 - 空中で速度が極めて小さい場合は強制的に落下させる
        if (
            this.grounded === false &&
            Math.abs(this.verticalSpeed) < 0.1 &&
            this.movementState === 'Jumping'
        ) {
            this.verticalSpeed = 1;
            this.velocity = 1;
            if (window.debugMode) {
                console.log('浮遊状態を検知: 強制的に落下処理を適用');
            }
        }
    }

    /**
     * 外部からのジャンプ要求に対応するメソッド
     */
    jump() {
        // デバッグ情報を追加
        console.log(
            `ジャンプ要求: grounded=${this.grounded}, state=${this.movementState}`
        );

        // 接地状態の場合のみジャンプを実行
        if (this.grounded && this.movementState === 'OnGround') {
            this.preparingJump();
            if (window.debugMode) {
                console.log('外部からジャンプが要求されました！');
            }
        } else {
            // ジャンプできない理由をログに出力
            console.log(
                `ジャンプ拒否: grounded=${this.grounded}, state=${this.movementState}`
            );
        }
    }

    /**
     * プレイヤーの状態をリセットする
     * ゲームをリセットする際に呼び出される
     */
    reset() {
        // 初期位置と速度を設定
        this.x = this.initialX;
        this.y = this.initialY;
        this.velocity = 0;
        this.grounded = true;

        // マリオスタイルのジャンプパラメータをリセット
        this.resetJumpParams();

        // アニメーション状態をリセット
        this.frameCount = 0;
        this.isJumping = false;

        if (window.debugMode) {
            console.log('プレイヤー状態をリセットしました');
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
            window.text(
                `v:${this.verticalSpeed.toFixed(1)},g:${
                    this.grounded ? 'YES' : 'NO'
                }`,
                0,
                -PLAYER_SIZE - 12
            );
        }

        window.pop();
    }
}
