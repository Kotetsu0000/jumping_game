/**
 * 足場を管理するクラス
 */
class Platform {
    /**
     * 足場クラスのコンストラクタ
     * @param {number} x X座標（左端）
     * @param {number} y Y座標（中央）
     * @param {number} width 幅
     */
    constructor(x, y, width) {
        // スプライトの作成
        this.sprite = new Sprite();
        this.sprite.width = width;
        this.sprite.height = PLATFORM_HEIGHT;
        this.sprite.x = x + width / 2; // 中心座標設定
        this.sprite.y = y;
        this.sprite.color = COLOR_PALETTE.PLATFORM;

        // 物理特性の設定
        this.sprite.collider = 'static'; // 動かない静的な物体
    }

    /**
     * 足場の更新処理（横スクロール）
     * @returns {boolean} 画面外に出たかどうか
     */
    update() {
        // 左にスクロール
        this.sprite.x -= SCROLL_SPEED;

        // 画面外に出たかどうかを確認
        return this.isOffScreen();
    }

    /**
     * 足場の描画処理（p5.playのsprite機能を使うので基本的には不要）
     */
    display() {
        // Spriteを使用しているので、このメソッドは空でOK
    }

    /**
     * 足場が画面外に出たかどうかを判定
     * @returns {boolean} 画面外に出た場合はtrue
     */
    isOffScreen() {
        return this.sprite.x + this.sprite.width / 2 < 0;
    }
}
