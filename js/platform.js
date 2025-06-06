/**
 * プラットフォームを表すクラス
 */
import { PLATFORM_HEIGHT, PLATFORM_SPEED, COLOR_PALETTE } from './config.js';

// p5.js関数は window 経由で直接アクセス

// プラットフォームの種類と表現に関する定数
const PLATFORM_TYPE_COUNT = 3; // プラットフォームのタイプ数
const PLATFORM_TYPE_BASIC = 0;
const PLATFORM_TYPE_GRASSY = 1;
const PLATFORM_TYPE_STONE = 2;
const GRASS_PIXEL_SIZE = 3; // 草のピクセルサイズ
const STONE_DETAIL_SIZE = 4; // 石のディテールサイズ

export class Platform {
    /**
     * プラットフォームを初期化する
     * @param {number} x プラットフォームのX座標
     * @param {number} y プラットフォームのY座標
     * @param {number} width プラットフォームの幅
     */ constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = PLATFORM_HEIGHT;
        this.speed = PLATFORM_SPEED;
        this.baseSpeed = PLATFORM_SPEED; // 基本速度を保存（難易度調整用）
        this.sprite = null;
        this.type = Math.floor(window.random(PLATFORM_TYPE_COUNT)); // ランダムなプラットフォームタイプを選択

        // デバッグ用に一意のID（タイムスタンプベース）を割り当て
        this._id =
            Date.now().toString().slice(-5) + Math.floor(Math.random() * 100);
    }
    /** 初期化処理（必要に応じて） */ setup() {
        try {
            // p5.play v3.xでのスプライト作成
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            if (window.Sprite) {
                // グローバル化されたSpriteクラスを使用
                this.sprite = new window.Sprite(centerX, centerY);
            } else {
                console.error('Spriteクラスが見つかりません');
                // ダミースプライトオブジェクト
                this.sprite = {
                    x: centerX,
                    y: centerY,
                    width: this.width,
                    height: this.height,
                    visible: false,
                };
                return;
            } // スプライトのプロパティを設定
            this.sprite.width = this.width;
            this.sprite.height = this.height;
            this.sprite.static = true; // 静的なスプライト（動かない物体）- immovableは非推奨
            this.sprite.visible = false; // カスタム描画を使用
            this.sprite.collider = 'static'; // 静的なコライダーとして設定

            // 衝突判定を確実にするための追加設定
            if (typeof this.sprite.friction === 'number') {
                this.sprite.friction = 0; // 摩擦なし
            }
        } catch (e) {
            console.error(
                'プラットフォームスプライトの初期化中にエラーが発生しました:',
                e
            );
            // ダミースプライトオブジェクト
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            this.sprite = {
                x: centerX,
                y: centerY,
                width: this.width,
                height: this.height,
                visible: false,
            };
        }
    } /** プラットフォームの移動を更新 */
    update() {
        this.x -= this.speed; // プラットフォームを左に移動

        // スプライトが存在する場合は位置を同期
        if (this.sprite) {
            // 中心座標を計算（p5.playのスプライトは中心座標系）
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            // スプライトの位置と寸法を更新
            this.sprite.x = centerX;
            this.sprite.y = centerY;
            this.sprite.width = this.width;
            this.sprite.height = this.height;

            // 物理的な性質を設定
            this.sprite.static = true;
            this.sprite.collider = 'static'; // 静的な衝突判定として設定

            // 摩擦値を設定（存在する場合のみ）
            if (typeof this.sprite.friction !== 'undefined') {
                this.sprite.friction = 0; // 摩擦なし
            }

            // デバッグ表示の設定
            this.sprite.debug = window.collisionDebugMode || window.debugMode;
        }
    } /** プラットフォームを描画 */
    draw() {
        // 最適化：描画範囲のカリング（余裕を持たせつつも厳格に判定）
        // 足場が完全に画面外なら描画をスキップ
        if (this.x > window.width || this.x + this.width < 0) {
            return;
        }

        // 縦方向も同様に画面外なら描画しない（上下にも余裕を持たせる）
        if (this.y > window.height || this.y + this.height < 0) {
            return;
        }

        // 画面内の足場のみ描画
        window.push(); // 描画スタイルを保存

        // 描画モードをCENTERに設定（スプライト座標系と合わせる）
        window.rectMode(window.CENTER);
        window.noStroke(); // 輪郭線なし

        // 中心座標を計算（一度だけ計算して再利用）
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // メモリキャッシュを活用するため、ローカル変数を使用
        const platformType = this.type;
        const platformWidth = this.width;
        const platformHeight = this.height;
        const platformX = this.x;
        const platformY = this.y;

        // 足場タイプに応じた描画処理
        switch (platformType) {
            case PLATFORM_TYPE_BASIC: // 基本的な足場
                window.fill(COLOR_PALETTE.PLATFORM);
                window.rect(centerX, centerY, platformWidth, platformHeight);
                break;

            case PLATFORM_TYPE_GRASSY: // 草地の足場
                // 土台部分
                window.fill(COLOR_PALETTE.PLATFORM);
                window.rect(centerX, centerY, platformWidth, platformHeight);

                // 草の部分（上部の装飾）- 事前計算による最適化
                window.fill(COLOR_PALETTE.PLATFORM_GRASS);
                const grassHeight = 5;

                // グラフィック範囲を画面内に制限し、処理を効率化
                const startX = Math.max(0, platformX);
                const endX = Math.min(platformX + platformWidth, window.width);

                // 草の描画を最適化（毎回random()を呼び出す代わりに事前パターンを使用）
                window.rectMode(window.CORNER);
                for (let i = 0; i < platformWidth; i += GRASS_PIXEL_SIZE) {
                    // 決定論的な草パターン（シード値ベース）
                    const grassSeed = (platformX + i) % 10; // 位置に基づく擬似ランダム
                    if (grassSeed > 5) {
                        // 50%の確率で草を描画
                        window.rect(
                            platformX + i,
                            platformY - grassHeight,
                            GRASS_PIXEL_SIZE,
                            grassHeight
                        );
                    }
                }
                window.rectMode(window.CENTER);
                break;

            case PLATFORM_TYPE_STONE: // 石の足場
                window.fill(COLOR_PALETTE.PLATFORM_STONE);
                window.rect(centerX, centerY, platformWidth, platformHeight);

                // 石のテクスチャ（ディテール）- 描画の最適化
                window.fill(COLOR_PALETTE.PLATFORM_STONE_DETAIL);
                const detailSize = STONE_DETAIL_SIZE;

                // ディテール数を画面内の見える部分だけに制限して最適化
                const detailDensity = 0.15; // ディテールの密度係数
                const visibleWidth = Math.min(
                    platformWidth,
                    window.width - platformX
                );
                const visibleArea = visibleWidth * platformHeight;
                const numDetails = Math.floor(
                    (visibleArea / (detailSize * detailSize)) * detailDensity
                );

                // 描画領域を限定
                window.rectMode(window.CORNER);

                // 決定論的なディテール配置（毎回同じ足場は同じパターンになるように）
                const detailSeed = Math.floor(platformX / 100); // 位置に基づく擬似乱数シード
                for (let i = 0; i < numDetails; i++) {
                    // 決定論的な疑似乱数生成（Math.sinを使用）
                    const randomX =
                        Math.abs(Math.sin(detailSeed * 0.1 + i * 0.3)) *
                        platformWidth;
                    const randomY =
                        Math.abs(Math.sin(detailSeed * 0.2 + i * 0.7)) *
                        platformHeight;

                    window.rect(
                        platformX + randomX,
                        platformY + randomY,
                        detailSize,
                        detailSize
                    );
                }
                window.rectMode(window.CENTER);
                break;
        }

        // デバッグモードが有効なら詳細な衝突判定枠を表示
        if (window.debugMode) {
            window.noFill();
            window.stroke(0, 255, 0, 200); // 目立つ緑色
            window.strokeWeight(2);
            window.rect(centerX, centerY, platformWidth, platformHeight);

            // デバッグ情報を表示
            window.fill(255);
            window.textSize(10);
            window.textAlign(window.CENTER, window.CENTER);
            window.text(`ID: ${this._id || 'N/A'}`, centerX, centerY - 10);
            window.text(
                `x:${Math.floor(this.x)},y:${Math.floor(this.y)}`,
                centerX,
                centerY + 10
            );
        } else {
            // 通常モードではより控えめな枠線
            window.noFill();
            window.stroke(255, 255, 255, 50);
            window.strokeWeight(1);
            window.rect(centerX, centerY, this.width, this.height);
        }

        window.pop(); // 描画スタイルを復元
    } // 個別の描画メソッドは draw() メソッドに統合されました

    /**
     * 画面外判定
     * @returns {boolean} 足場が画面外に出た場合はtrue
     */ isOffScreen() {
        // 足場全体が画面外に出たらtrue
        const result = this.x + this.width < -20; // 余裕を持って画面外判定

        // 画面外に出たらスプライトも削除（メモリ解放）
        if (result && this.sprite) {
            try {
                this.sprite.remove();
            } catch (e) {
                console.error('スプライト削除エラー:', e);
            }
        }

        return result;
    }

    /**
     * display()メソッド（draw()と同一機能）
     * issue命名規則に合わせて追加
     */
    display() {
        this.draw();
    }
}
