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
     */
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = PLATFORM_HEIGHT;
        this.speed = PLATFORM_SPEED;
        this.sprite = null;
        this.type = Math.floor(window.random(PLATFORM_TYPE_COUNT)); // ランダムなプラットフォームタイプを選択
    }

    /** 初期化処理（必要に応じて） */
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
    }

    /** プラットフォームの移動を更新 */
    update() {
        this.x -= this.speed;

        // スプライトの位置も更新
        if (this.sprite) {
            this.sprite.x = this.x + this.width / 2;
            this.sprite.y = this.y + this.height / 2;
        }
    }

    /** プラットフォームを描画 */
    draw() {
        window.push(); // タイプに応じて描画を変える
        switch (this.type) {
            case PLATFORM_TYPE_BASIC: // 基本的な足場
                this.drawBasicPlatform();
                break;
            case PLATFORM_TYPE_GRASSY: // ドット絵風の草地
                this.drawGrassyPlatform();
                break;
            case PLATFORM_TYPE_STONE: // 石のような足場
                this.drawStonePlatform();
                break;
        }

        // デバッグ用：衝突範囲の表示（必要に応じてコメントアウト）
        // window.noFill();
        // window.stroke('#ff0000');
        // window.rect(this.x + this.width/2, this.y + this.height/2, this.width, this.height);

        window.pop();
    }

    /**
     * 基本的な足場を描画
     */
    drawBasicPlatform() {
        window.fill(COLOR_PALETTE.PLATFORM);
        window.rect(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width,
            this.height
        );
    }

    /**
     * 草地風の足場を描画
     */
    drawGrassyPlatform() {
        // 足場のベース部分
        window.fill(COLOR_PALETTE.PLATFORM);
        window.rect(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width,
            this.height
        );

        // 草の部分（上部の装飾）
        window.fill(COLOR_PALETTE.PLATFORM_GRASS);
        const grassHeight = 5; // 草のピクセル表現
        const pixelSize = GRASS_PIXEL_SIZE;
        const numGrass = Math.floor(this.width / pixelSize);

        for (let i = 0; i < numGrass; i++) {
            if (window.random() > 0.6) {
                // 一部の場所だけ草を生やす
                let grassX = this.x + i * pixelSize;
                if (grassX < this.x + this.width) {
                    window.rect(
                        grassX,
                        this.y - grassHeight / 2,
                        pixelSize,
                        grassHeight
                    );
                }
            }
        }
    }

    /**
     * 石のような足場を描画
     */
    drawStonePlatform() {
        window.fill(COLOR_PALETTE.PLATFORM_STONE);
        window.rect(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width,
            this.height
        ); // 石のテクスチャ表現
        window.fill(COLOR_PALETTE.PLATFORM_STONE_DETAIL);
        const detailSize = STONE_DETAIL_SIZE;
        const numDetails = Math.floor(
            ((this.width * this.height) / (detailSize * detailSize)) * 0.1
        ); // 10%程度の密度

        for (let i = 0; i < numDetails; i++) {
            const detailX = this.x + window.random(this.width);
            const detailY = this.y + window.random(this.height);
            window.rect(detailX, detailY, detailSize, detailSize);
        }
    }

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
