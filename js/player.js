/**
 * プレイヤーキャラクターを管理するクラス
 */
class Player {
    /**
     * プレイヤークラスのコンストラクタ
     */
    constructor() {
        // プレイヤーのスプライトを作成
        this.sprite = new Sprite();
        this.sprite.width = PLAYER_WIDTH;
        this.sprite.height = PLAYER_HEIGHT;
        this.sprite.x = PLAYER_INITIAL_X;
        this.sprite.y = PLAYER_INITIAL_Y;
        this.sprite.color = COLOR_PALETTE.PLAYER;

        // ゲーム特性
        this.jumpForce = PLAYER_JUMP_FORCE;
        this.isGrounded = false;
        this.isFalling = false;

        // 物理特性の設定
        this.sprite.collider = 'dynamic';
        this.sprite.vel.y = 0;
    }

    /**
     * プレイヤーの状態を更新
     */
    update() {
        // 重力の適用
        this.sprite.vel.y += GRAVITY;

        // 下降中かどうかを判定
        if (this.sprite.vel.y > 0) {
            this.isFalling = true;
        }

        // 画面から出ないように制限
        if (this.sprite.x < PLAYER_WIDTH / 2) {
            this.sprite.x = PLAYER_WIDTH / 2;
        }

        // 画面下に落ちた場合はゲームオーバー判定のためにフラグを立てる
        if (this.sprite.y > CANVAS_HEIGHT + PLAYER_HEIGHT) {
            return true; // ゲームオーバー
        }

        return false; // ゲーム続行
    }

    /**
     * プレイヤーのジャンプ処理
     */
    jump() {
        // 接地している場合のみジャンプ可能
        if (this.isGrounded) {
            this.sprite.vel.y = -this.jumpForce;
            this.isGrounded = false;
        }
    }

    /**
     * 足場との衝突判定
     * @param {Platform} platform 判定対象の足場オブジェクト
     */
    checkCollision(platform) {
        // プレイヤーが落下中で、足場の上辺に衝突した場合
        if (
            this.isFalling &&
            this.sprite.y + PLAYER_HEIGHT / 2 <=
                platform.sprite.y - PLATFORM_HEIGHT / 2 + 10 &&
            this.sprite.collides(platform.sprite)
        ) {
            this.isGrounded = true;
            this.isFalling = false;
            this.sprite.vel.y = 0;
            this.sprite.y =
                platform.sprite.y - PLATFORM_HEIGHT / 2 - PLAYER_HEIGHT / 2;
            return true;
        }
        return false;
    }

    /**
     * プレイヤーの描画処理（p5.playのsprite機能を使うので基本的には不要）
     */
    display() {
        // Spriteを使用しているので、このメソッドは空でOK
    }

    /**
     * プレイヤーをリセットする
     */
    reset() {
        this.sprite.x = PLAYER_INITIAL_X;
        this.sprite.y = PLAYER_INITIAL_Y;
        this.sprite.vel.y = 0;
        this.isGrounded = false;
        this.isFalling = false;
    }
}
