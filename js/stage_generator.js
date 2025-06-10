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

// p5.js関数は window 経由で直接アクセス

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
        const initialWidth = 400; // 初期足場をより広く設定（右側に長く伸ばす）

        // 重要：プレイヤーの足元に確実に足場を配置
        // プレイヤーのサイズも考慮して正確に計算
        const initialY = INITIAL_PLAYER_Y + PLAYER_SIZE / 2;

        // プレイヤーが足場の左側に立つように位置を調整
        // 左側にはプレイヤーサイズの2倍、右側により長く伸ばす
        const initialPlatform = new Platform(
            INITIAL_PLAYER_X - PLAYER_SIZE * 2,
            initialY,
            initialWidth
        );
        initialPlatform.setup();
        this.platforms.push(initialPlatform);

        // 最初の足場の位置を保存（次の足場生成の参照点として使用）
        this.lastPlatformX = INITIAL_PLAYER_X - PLAYER_SIZE * 2;
        this.lastPlatformWidth = initialWidth;

        if (window.debugMode) {
            console.log(
                `初期足場を配置: x=${
                    INITIAL_PLAYER_X - PLAYER_SIZE * 2
                }, y=${initialY}, width=${initialWidth}`
            );
            console.log(
                `プレイヤー初期位置: x=${INITIAL_PLAYER_X}, y=${INITIAL_PLAYER_Y}`
            );
        } // 残りの足場を配置
        // 初期足場の右端から開始
        let currentX = INITIAL_PLAYER_X - PLAYER_SIZE * 2 + initialWidth + 30; // 初期足場の右端から短い距離で開始
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
            this.platforms.push(platform); // 最初の数個の足場は確実に到達できるように非常に近めに配置
            // 足場の数に応じて徐々に間隔を広げていく
            const isFirstPlatforms = this.platforms.length < 8; // より多くの足場を「初期足場」として扱う
            const horizontalGap = isFirstPlatforms
                ? window.random(40, 70) // 最初の数個は非常に近く配置（さらに近く）
                : window.random(60, 90); // それ以降は通常の間隔（こちらも近くする）
            currentX += width + horizontalGap; // 次の足場のY座標を計算（初期配置では非常に簡単に）
            // 初期足場は非常に到達しやすく配置
            let heightDiff;

            // 足場数に応じてパターンを少しずつ変化
            const platformNumber = this.platforms.length;
            if (platformNumber <= 5) {
                // 最初の数個は完全に水平に近い配置（非常に簡単）- より多くの足場を完全平坦に
                heightDiff = window.random(-3, 3);
            } else if (platformNumber <= 10) {
                // 次の数個は若干の起伏だけ（まだかなり簡単）
                heightDiff = window.random(-5, 5);
            } else if (platformNumber % 3 === 0) {
                // 少し上り坂（少し上に）- 上りの勾配を緩やかに
                heightDiff = window.random(-10, -2);
            } else if (platformNumber % 3 === 1) {
                // 平坦に - より平坦に
                heightDiff = window.random(-6, 6);
            } else {
                // 少し下り坂（少し下に）- 下りの勾配も緩やかに
                heightDiff = window.random(2, 10);
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
        // ゲーム時間を更新（フレーム数をカウント）
        this.gameTime++;

        // 新しい足場の生成を管理
        this.nextSpawnInterval--;
        if (this.nextSpawnInterval <= 0) {
            const platform = this.generateNewPlatform();
            platform.setup();
            this.platforms.push(platform);

            // 難易度に応じて次の生成間隔を設定
            // 難易度が上がると、より短い間隔で生成される
            const baseInterval = PLATFORM_SPAWN_INTERVAL;
            const difficultyFactor = Math.min(
                1.0,
                (this.difficultyFactor - 1.0) * 2
            );
            this.nextSpawnInterval = Math.max(
                40,
                Math.floor(baseInterval * (1.0 - difficultyFactor * 0.3))
            );
        }

        // 難易度を更新
        this.updateDifficulty();

        // プラットフォームの最適化された更新
        // 画面に近い足場のみ更新処理を行う
        const margin = window.width * 0.5; // 画面幅の半分の余裕を持たせる
        for (let i = 0; i < this.platforms.length; i++) {
            const platform = this.platforms[i];

            // 画面の範囲から大きく離れた足場は更新を省略
            if (platform.x > window.width + margin) {
                // 画面から遠く離れた足場は概算で位置を更新（精密な更新は不要）
                platform.x -= platform.speed;
                continue;
            }

            // 画面内または近い足場は通常通り更新
            platform.update();
        }

        // 画面外のプラットフォームを削除
        this.cleanupPlatforms();
    }
    /**
     * 外部からの難易度設定を受け取るメソッド
     * @param {number} difficultyValue - 0.0～1.0の難易度値
     */
    setDifficulty(difficultyValue) {
        // 有効範囲内の値に制限
        const validDifficulty = Math.max(0.0, Math.min(1.0, difficultyValue));
        // 前回の難易度から緩やかに変化させる（急激な難易度変化を防止）
        this.difficultyFactor =
            this.difficultyFactor * 0.95 + validDifficulty * 0.05;

        // プラットフォームのスピードを難易度に応じて調整
        const baseSpeed = PLATFORM_SPEED;
        const maxSpeedIncrease = 1.5; // 最大で1.5倍まで速くなる
        const currentSpeedFactor =
            1.0 + this.difficultyFactor * maxSpeedIncrease;

        // すべてのプラットフォームの速度を更新
        for (let i = 0; i < this.platforms.length; i++) {
            const platform = this.platforms[i];
            platform.speed = baseSpeed * currentSpeedFactor;
        }

        if (window.debugMode) {
            console.log(
                `難易度更新: ${this.difficultyFactor.toFixed(
                    2
                )}, 速度係数: ${currentSpeedFactor.toFixed(2)}`
            );
        }
    }

    /**
     * 難易度を更新する
     */
    updateDifficulty() {
        // 難易度上昇を緩やかに - 60秒（3600フレーム）ごとに難易度を0.1増加
        this.difficultyFactor = 1.0 + (this.gameTime / 3600) * 0.15;

        // ゲーム序盤は難易度を下げる（開始から30秒間）
        if (this.gameTime < 1800) {
            // 徐々に1.0まで上昇
            this.difficultyFactor = Math.max(0.8, this.difficultyFactor); // 最低0.8から
        }

        // 最大難易度を1.6に制限（通常の1.6倍の速さに抑える）
        this.difficultyFactor = Math.min(this.difficultyFactor, 1.6);

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
        // 難易度が上がると、狭い足場が出現しやすくなるが、最低幅は十分に確保する
        const minWidth = PLATFORM_MIN_WIDTH - (this.difficultyFactor - 1) * 8; // 難易度による減少を緩和
        const finalMinWidth = Math.max(minWidth, 90); // 最小幅の下限を増加して着地しやすく

        // ゲーム序盤はさらに広めの足場にする（初心者に優しく）
        const widthBonus = Math.max(0, 2000 - this.gameTime) / 15; // 効果時間を2倍に延長、効果も強化
        const adjustedMaxWidth = Math.min(PLATFORM_MAX_WIDTH + widthBonus, 250); // 最大幅も増加

        // 足場の幅をランダム生成
        const width = window.random(finalMinWidth, adjustedMaxWidth);

        // 前回の足場の情報
        const lastPlatform = this.platforms[this.platforms.length - 1];

        // 水平方向の距離を計算（難易度と経過時間に応じて調整）
        // ゲーム開始直後は足場を近くに生成し、徐々に難しくする
        const gameProgressFactor = Math.min(1.0, this.gameTime / 3000); // 基本の間隔（ゲーム進行で徐々に開いていく）
        const baseGap = 40 + gameProgressFactor * 20; // 60から40に減らして間隔を狭く

        // 難易度による間隔調整（難しいほど広くなる）
        const diffGap = (this.difficultyFactor - 1) * 10; // 15から10に減らして増加幅を小さく        // 最終的な間隔の範囲を計算
        const minGap = baseGap - 5; // 最小間隔をさらに縮小
        const maxGap = baseGap + diffGap + 10; // 最大間隔も縮小

        // 間隔をランダム生成（上限を設ける）
        const horizontalGap = window.random(minGap, Math.min(maxGap, 90)); // 最大間隔をさらに縮小

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
        const optimalY = lastY + 30; // 上下の許容範囲（難易度によって変動）        // ジャンプ力の範囲をさらに狭めて、より到達しやすい範囲に配置
        const upwardRange = maxJumpHeight * 0.25 * difficultyFactor; // 0.35から0.25にさらに減少
        const downwardRange = maxJumpHeight * 0.1 * difficultyFactor; // 0.15から0.10にさらに減少

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
        let maxY = Math.min(lowerLimit, PLATFORM_MAX_HEIGHT); // ほぼ平坦なコースにして簡単にする（ゲームの初期段階）
        if (this.gameTime < 3000) {
            // 初期簡易期間を3倍に延長
            // ゲーム開始から一定時間は簡単に
            const easierY = lastY + window.random(-8, 8); // 変化をさらに小さく
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
            0.2, // 最低でも20%の確率で簡単な配置にする
            0.95 - (this.difficultyFactor - 1) * 0.2 // 初期確率を95%に引き上げ、減少率も緩和
        );
        if (window.random() < easyPlacementChance) {
            // 簡単な位置（前の足場とほぼ同じ高さ±少し）
            return lastY + window.random(-8, 15); // 範囲をさらに狭めて、より平坦に
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
        // 最適化：画面外の足場を一括削除（先頭から連続する画面外プラットフォームのみ）
        // これにより、配列の再構築コストを削減し、パフォーマンスを向上させる
        if (this.platforms.length === 0) return;

        // 最初のインデックスから連続して画面外になっているプラットフォームを数える
        let offScreenCount = 0;
        for (let i = 0; i < this.platforms.length; i++) {
            if (this.platforms[i].isOffScreen()) {
                offScreenCount++;
            } else {
                break; // 画面内のプラットフォームが見つかったら終了
            }
        }

        // 画面外のプラットフォームがあれば削除（spliceを使用して一度に削除）
        if (offScreenCount > 0) {
            if (window.debugMode && offScreenCount > 1) {
                console.log(
                    `${offScreenCount}個の画面外プラットフォームを一括削除`
                );
            }
            this.platforms.splice(0, offScreenCount);
        }
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
     * ステージジェネレーターのリセット
     * ゲームをリセットする際に呼び出される
     */
    reset() {
        // 既存のsetup()メソッドを呼び出してリセット処理を行う
        this.setup();

        if (window.debugMode) {
            console.log('ステージジェネレーターをリセットしました');
        }
    }
}
