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
    PLATFORM_SPEED,
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

        if (window.debugMode) {
            console.log(
                `初期足場を配置: x=${
                    INITIAL_PLAYER_X - initialWidth / 2
                }, y=${initialY}, width=${initialWidth}`
            );
            console.log(
                `プレイヤー初期位置: x=${INITIAL_PLAYER_X}, y=${INITIAL_PLAYER_Y}`
            );
        }

        // 残りの足場を配置
        let currentX = INITIAL_PLAYER_X + initialWidth / 2 + 50; // 最初の足場の右端から適度な距離を空ける
        let currentY = initialY; // 最初は同じ高さからスタート

        // ジャンプの最大高さを計算
        const maxJumpHeight = this.calculateMaxJumpHeight(
            PLAYER_JUMP_FORCE,
            GRAVITY
        ); // 画面の右端から少し先までプラットフォームを配置
        while (currentX < window.width + 200) {
            const width = window.random(PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH);

            // プラットフォームを生成
            const platform = new Platform(currentX, currentY, width);
            platform.setup();
            this.platforms.push(platform);

            // 次の足場の水平距離を決定（初期足場は確実に到達できるように近めに配置）
            const horizontalGap = window.random(70, 100);
            currentX += width + horizontalGap; // 次の足場のY座標を計算（初期配置では非常に簡単に）
            // 初期足場は非常に到達しやすく配置
            let heightDiff;

            // 足場数に応じてパターンを少しずつ変化
            const platformNumber = this.platforms.length;

            if (platformNumber <= 3) {
                // 最初の数個は完全に水平に近い配置（非常に簡単）
                heightDiff = window.random(-5, 5);
            } else if (platformNumber % 3 === 0) {
                // 少し上り坂（少し上に）
                heightDiff = window.random(-15, -5);
            } else if (platformNumber % 3 === 1) {
                // 平坦に
                heightDiff = window.random(-8, 8);
            } else {
                // 少し下り坂（少し下に）
                heightDiff = window.random(5, 15);
            }

            // 画面内に収める
            currentY = Math.max(
                PLATFORM_MIN_HEIGHT,
                Math.min(PLATFORM_MAX_HEIGHT, currentY + heightDiff)
            );

            // 最後の足場情報を更新
            this.lastPlatformX = currentX;
            this.lastPlatformY = currentY;
            this.lastPlatformWidth = width;

            if (window.debugMode) {
                console.log(
                    `初期足場: x=${Math.floor(currentX)}, y=${Math.floor(
                        currentY
                    )}, width=${Math.floor(width)}`
                );
            }
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
        // 難易度に応じて足場の幅を調整
        // 難易度が上がると、狭い足場が出現しやすくなる
        const minWidth = PLATFORM_MIN_WIDTH - (this.difficultyFactor - 1) * 10;
        const finalMinWidth = Math.max(minWidth, 70); // 最小幅の下限を設定

        // ゲーム序盤は広めの足場にする（初心者に優しく）
        const widthBonus = Math.max(0, 1000 - this.gameTime) / 20;
        const adjustedMaxWidth = Math.min(PLATFORM_MAX_WIDTH + widthBonus, 220);

        // 足場の幅をランダム生成
        const width = window.random(finalMinWidth, adjustedMaxWidth);

        // 前回の足場の情報
        const lastPlatform = this.platforms[this.platforms.length - 1];

        // 水平方向の距離を計算（難易度と経過時間に応じて調整）
        // ゲーム開始直後は足場を近くに生成し、徐々に難しくする
        const gameProgressFactor = Math.min(1.0, this.gameTime / 3000); // 基本の間隔（ゲーム進行で徐々に開いていく）
        const baseGap = 40 + gameProgressFactor * 20; // 60から40に減らして間隔を狭く

        // 難易度による間隔調整（難しいほど広くなる）
        const diffGap = (this.difficultyFactor - 1) * 10; // 15から10に減らして増加幅を小さく

        // 最終的な間隔の範囲を計算
        const minGap = baseGap;
        const maxGap = baseGap + diffGap + 15; // 20から15に減らして上限を下げる

        // 間隔をランダム生成（上限を設ける）
        const horizontalGap = window.random(minGap, Math.min(maxGap, 100)); // 130から100に減らして最大間隔を縮小

        // X座標は画面の右端から適切な距離に配置
        const x = window.width + horizontalGap;

        // Y座標を計算（プレイヤーが確実に到達可能な位置）
        const y = this.calculateReachablePosition(lastPlatform, horizontalGap);

        // 最後の足場情報を更新
        this.lastPlatformX = x;
        this.lastPlatformY = y;
        this.lastPlatformWidth = width; // デバッグ情報を表示（必要に応じて）
        if (window.debugMode) {
            console.log(
                `新しい足場: x=${Math.floor(x)}, y=${Math.floor(
                    y
                )}, width=${Math.floor(width)}, gap=${Math.floor(
                    horizontalGap
                )}`
            );
        }

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
     * @deprecated 代わりに calculateReachablePosition() を使用してください
     */
    getNextPlatformY(currentY) {
        // 互換性のために残しておく
        console.warn(
            'getNextPlatformY is deprecated, use calculateReachablePosition instead'
        );

        // ジャンプの最大高さを計算
        const maxJumpHeight = this.calculateMaxJumpHeight(
            PLAYER_JUMP_FORCE,
            GRAVITY
        );

        // 安全な範囲を計算
        let minY = currentY - maxJumpHeight * 0.5;
        let maxY = currentY + maxJumpHeight * 0.2;

        // 画面内に収める
        minY = Math.max(minY, PLATFORM_MIN_HEIGHT);
        maxY = Math.min(maxY, PLATFORM_MAX_HEIGHT);

        // 新しいY座標をランダムに決定
        return window.random(minY, maxY);
    }
    /**
     * プレイヤーが到達可能な次の足場の位置を計算する
     * @param {Object} lastPlatform 直近の足場オブジェクト
     * @param {number} horizontalGap 水平方向の間隔
     * @returns {number} 次の足場のY座標
     */
    calculateReachablePosition(lastPlatform, horizontalGap) {
        // ジャンプの最大高さを計算
        const maxJumpHeight = this.calculateMaxJumpHeight(
            PLAYER_JUMP_FORCE,
            GRAVITY
        );

        // 前の足場の情報
        const lastY = lastPlatform.y;
        const lastWidth = lastPlatform.width;

        // 足場の移動速度を取得
        const platformSpeed = PLATFORM_SPEED * this.difficultyFactor;

        // 水平移動にかかる時間（フレーム数）を計算
        // 足場の右端からジャンプした場合の水平距離を考慮
        const effectiveDistance = horizontalGap + lastWidth / 2; // 実効距離
        const timeToReach = Math.ceil(effectiveDistance / platformSpeed);

        // ジャンプの軌道計算（物理的に正確なジャンプ弾道）
        // 初速度v0で打ち上げられた物体の時刻tでの高さ h = v0*t - 0.5*g*t^2
        const initialVelocity = -PLAYER_JUMP_FORCE; // 上向きが負なので負の値

        // ジャンプから到達までの時間での最大到達高さを計算
        // 最大高さに到達する時間: tmax = v0/g
        const timeToMaxHeight = Math.abs(initialVelocity) / GRAVITY;

        // 飛んでいる時間を推定（水平移動分を考慮）
        // 進行中の足場に着地するため、時間は短めに見積もる
        const flightTime = Math.min(timeToReach * 0.8, timeToMaxHeight * 2);

        // 難易度により到達範囲を調整（難しくするほど狭く）
        const difficultyFactor = Math.max(
            0.5,
            1.5 - this.difficultyFactor * 0.2
        );

        // 最も到達しやすい位置（理想的な着地点）
        // 前の足場からやや下がった位置が最も着地しやすい
        const optimalY = lastY + 30; // 上下の許容範囲（難易度によって変動）
        // ジャンプ力の範囲を狭めて、より到達しやすい範囲に配置
        const upwardRange = maxJumpHeight * 0.35 * difficultyFactor; // 0.5から0.35に減少
        const downwardRange = maxJumpHeight * 0.15 * difficultyFactor; // 0.25から0.15に減少

        // 上下の限界を設定
        const upperLimit = Math.max(
            optimalY - upwardRange,
            PLATFORM_MIN_HEIGHT
        );
        const lowerLimit = Math.min(
            optimalY + downwardRange,
            PLATFORM_MAX_HEIGHT - 50
        );

        // 最終的な範囲（画面内に収める）
        let minY = Math.max(upperLimit, PLATFORM_MIN_HEIGHT);
        let maxY = Math.min(lowerLimit, PLATFORM_MAX_HEIGHT);

        // ほぼ平坦なコースにして簡単にする（ゲームの初期段階）
        if (this.gameTime < 1000) {
            // ゲーム開始から一定時間は簡単に
            const easierY = lastY + window.random(-10, 10);
            return Math.max(
                PLATFORM_MIN_HEIGHT,
                Math.min(easierY, PLATFORM_MAX_HEIGHT)
            );
        }

        // デバッグ表示
        if (window.debugMode) {
            console.log(
                `距離: ${Math.floor(effectiveDistance)}, ` +
                    `時間: ${timeToReach}f, ` +
                    `ジャンプ高さ: ${Math.floor(maxJumpHeight)}, ` +
                    `範囲: ${Math.floor(minY)}-${Math.floor(maxY)}`
            );
        }
        // 安全対策：範囲が不適切な場合
        if (minY >= maxY || maxY - minY < 20) {
            // 確実に到達可能な高さ（前の足場とほぼ同じ高さ）に設定
            return lastY + window.random(-5, 15);
        } // 増加する難易度に従って、ランダム性を調整
        // 難易度が低いときは「到達しやすい位置」に足場を配置する確率を高める
        const easyPlacementChance = Math.max(
            0,
            0.9 - (this.difficultyFactor - 1) * 0.25 // 0.8から0.9に増加、減少率も調整
        );

        if (window.random() < easyPlacementChance) {
            // 簡単な位置（前の足場とほぼ同じ高さ±少し）
            return lastY + window.random(-10, 20); // 範囲を-15,25から-10,20に変更してより平坦に
        }

        // それ以外は計算された範囲内でランダム配置
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
        // プラットフォームを描画
        this.platforms.forEach((p) => p.draw());

        // グローバルデバッグモード：プラットフォームとプレイヤーの位置関係を確認
        if (window.debugMode) {
            window.push();
            window.fill(255);
            window.textSize(10);

            // 各足場の情報を表示
            this.platforms.forEach((p, index) => {
                const centerX = p.x + p.width / 2;
                const centerY = p.y + p.height / 2;
                window.text(
                    `P${index}: x=${Math.floor(p.x)},y=${Math.floor(
                        p.y
                    )},w=${Math.floor(p.width)}`,
                    centerX,
                    centerY - 10
                );
            });

            // ジャンプ到達可能範囲の視覚化
            if (this.platforms.length > 0) {
                // 最後から2番目の足場までを取得（存在する場合）
                const lastPlatformIndex = this.platforms.length - 1;
                const lastPlatform = this.platforms[lastPlatformIndex];
                const prevPlatformIndex = Math.max(0, lastPlatformIndex - 1);
                const prevPlatform = this.platforms[prevPlatformIndex];

                const maxJumpHeight = this.calculateMaxJumpHeight(
                    PLAYER_JUMP_FORCE,
                    GRAVITY
                );

                // プラットフォームの移動速度（デバッグ表示用）
                const platformSpeed = PLATFORM_SPEED * this.difficultyFactor;

                // 足場間の接続線を描画
                if (lastPlatformIndex > 0) {
                    window.stroke(0, 255, 0, 150); // 緑色半透明
                    window.strokeWeight(2);
                    window.line(
                        prevPlatform.x + prevPlatform.width / 2,
                        prevPlatform.y,
                        lastPlatform.x + lastPlatform.width / 2,
                        lastPlatform.y
                    );
                }

                // 足場からのジャンプ予測を視覚化
                window.push();
                // 足場の中心から描画開始
                window.translate(
                    lastPlatform.x + lastPlatform.width / 2,
                    lastPlatform.y
                );

                // ジャンプ可能範囲の半円を描画
                window.stroke(255, 255, 0, 100);
                window.fill(255, 255, 0, 30);
                window.arc(
                    0,
                    0,
                    maxJumpHeight * 1.5,
                    maxJumpHeight * 1.5,
                    window.PI,
                    window.TWO_PI
                );

                // ジャンプ軌道を曲線で表示
                window.stroke(0, 255, 0, 180); // 緑色の軌道
                window.strokeWeight(2);
                window.noFill();

                // 標準的なジャンプでの軌道
                const jumpDuration = (PLAYER_JUMP_FORCE * 2) / GRAVITY;
                window.beginShape();
                for (let t = 0; t <= jumpDuration; t += 2) {
                    // X座標は経過時間に比例（スクロール速度で動く）
                    const x = platformSpeed * t;
                    // Y座標はジャンプの物理計算
                    const y = -PLAYER_JUMP_FORCE * t + 0.5 * GRAVITY * t * t;
                    window.vertex(x, y);
                }
                window.endShape();

                // 最大ジャンプ到達点をマーク
                window.stroke(255, 0, 0, 200);
                window.strokeWeight(4);
                window.point(0, -maxJumpHeight);

                window.pop();

                // 難易度情報と到達可能範囲を表示
                window.textAlign(window.LEFT);
                window.fill(255);
                window.textSize(12);
                window.text(
                    `難易度: ${this.difficultyFactor.toFixed(2)}x | ` +
                        `ジャンプ高さ: ${Math.floor(maxJumpHeight)}px | ` +
                        `足場間隔: ${Math.floor(
                            lastPlatform.x - prevPlatform.x
                        )}px`,
                    10,
                    window.height - 10
                );
            }

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
