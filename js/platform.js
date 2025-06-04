/**
 * プラットフォームを表すクラス
 */
import { PLATFORM_HEIGHT, PLATFORM_SPEED, COLOR_PALETTE } from './config.js';

// p5.js関数は window.p5Globals 経由で直接アクセス

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
    } /** 初期化処理（必要に応じて） */
    setup() {
        // Spriteを作成
        this.sprite = new window.Sprite(
            this.x + this.width / 2,
            this.y + this.height / 2
        );
        this.sprite.width = this.width;
        this.sprite.height = this.height;
        this.sprite.immovable = true; // 静的なスプライト（動かない物体）
        this.sprite.visible = false; // カスタム描画を使用するため、デフォルトのスプライト表示を無効化
        this.sprite.collider = 'static'; // 静的なコライダーとして設定
    } /** プラットフォームの移動を更新 */
    update() {
        this.x -= this.speed;

        // スプライトの位置も更新
        if (this.sprite) {
            this.sprite.x = this.x + this.width / 2;
            this.sprite.y = this.y + this.height / 2;

            // スプライトのサイズを再設定（衝突判定のため）
            this.sprite.width = this.width;
            this.sprite.height = this.height;
            this.sprite.debug = false; // デバッグ表示をオフ（必要に応じてオンにする）
        }
    }

    /** プラットフォームを描画 */
    draw() {
        window.push(); // 描画スタイルを保存

        // 描画モードをCENTERに設定（スプライト座標系と合わせる）
        window.rectMode(window.CENTER);
        window.noStroke(); // 輪郭線なし

        // 実際の衝突判定と同じ座標に描画するため、中心座標を使用
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        switch (this.type) {
            case PLATFORM_TYPE_BASIC: // 基本的な足場
                window.fill(COLOR_PALETTE.PLATFORM);
                window.rect(centerX, centerY, this.width, this.height);
                break;

            case PLATFORM_TYPE_GRASSY: // 草地の足場
                // 土台部分
                window.fill(COLOR_PALETTE.PLATFORM);
                window.rect(centerX, centerY, this.width, this.height);

                // 草の部分（上部の装飾）
                window.fill(COLOR_PALETTE.PLATFORM_GRASS);
                const grassHeight = 5;

                // 一時的に描画モードをコーナーモードに変更して草を描画
                window.rectMode(window.CORNER);
                for (let i = 0; i < this.width; i += GRASS_PIXEL_SIZE) {
                    if (window.random() > 0.5) {
                        // 草の密度
                        window.rect(
                            this.x + i,
                            this.y - grassHeight, // 足場の上端より少し上に配置
                            GRASS_PIXEL_SIZE,
                            grassHeight
                        );
                    }
                }
                // 描画モードを戻す
                window.rectMode(window.CENTER);
                break;

            case PLATFORM_TYPE_STONE: // 石の足場
                window.fill(COLOR_PALETTE.PLATFORM_STONE);
                window.rect(centerX, centerY, this.width, this.height);

                // 石のテクスチャ（ディテール）
                window.fill(COLOR_PALETTE.PLATFORM_STONE_DETAIL);
                const detailSize = STONE_DETAIL_SIZE;
                const numDetails = Math.floor(
                    ((this.width * this.height) / (detailSize * detailSize)) *
                        0.15
                );

                // 一時的に描画モードをコーナーモードに変更してディテールを描画
                window.rectMode(window.CORNER);
                for (let i = 0; i < numDetails; i++) {
                    const detailX = this.x + window.random(this.width);
                    const detailY = this.y + window.random(this.height);
                    window.rect(detailX, detailY, detailSize, detailSize);
                }
                // 描画モードを戻す
                window.rectMode(window.CENTER);
                break;
        }

        // 衝突判定の境界を明確にするため、枠線を表示
        window.noFill();
        window.stroke(255, 255, 255, 100); // 少し明確な白色
        window.strokeWeight(1);
        window.rect(centerX, centerY, this.width, this.height);

        // デバッグ情報を表示（オプション）
        // window.fill(255);
        // window.textSize(10);
        // window.text(`x:${Math.floor(this.x)},y:${Math.floor(this.y)}`, centerX, centerY);

        window.pop(); // 描画スタイルを復元
    } // 個別の描画メソッドは draw() メソッドに統合されました

    /**
     * 画面外判定
     * @returns {boolean} 足場が画面外に出た場合はtrue
     */
    isOffScreen() {
        // 足場全体が画面外に出たらtrue
        const result = this.x + this.width < 0;

        // 画面外に出たらスプライトも削除
        if (result && this.sprite) {
            this.sprite.remove();
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
