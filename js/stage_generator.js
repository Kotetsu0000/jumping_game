/**
 * ステージ（足場）の生成と管理を担当するクラス
 */
class StageGenerator {
    /**
     * ステージジェネレータのコンストラクタ
     */
    constructor() {
        // 足場の配列
        this.platforms = [];

        // 次の足場を生成するX座標
        this.nextPlatformX = 0;

        // 初期の足場を生成
        this.createInitialPlatforms();
    }

    /**
     * 初期の足場を生成する
     */
    createInitialPlatforms() {
        // 最初の足場は少し長めにして、プレイヤーが確実に着地できるようにする
        let firstPlatform = new Platform(
            0,
            PLAYER_INITIAL_Y + PLAYER_HEIGHT / 2 + PLATFORM_HEIGHT / 2,
            CANVAS_WIDTH / 2
        );
        this.platforms.push(firstPlatform);
        this.nextPlatformX =
            firstPlatform.sprite.x + firstPlatform.sprite.width / 2;

        // 残りの初期足場を生成
        for (let i = 0; i < PLATFORM_INITIAL_COUNT; i++) {
            this.generateNewPlatform();
        }
    }

    /**
     * ステージの更新処理
     */
    update() {
        // 既存の足場の更新と画面外に出た足場の削除
        this.platforms = this.platforms.filter(
            (platform) => !platform.update()
        );

        // 足場が減った場合、新しい足場を生成
        if (this.platforms.length < PLATFORM_INITIAL_COUNT) {
            this.generateNewPlatform();
        }

        // 最後の足場の位置を確認し、新しい足場を生成するかどうかを判断
        const lastPlatform = this.platforms[this.platforms.length - 1];
        if (lastPlatform.sprite.x < CANVAS_WIDTH - 100) {
            this.generateNewPlatform();
        }
    }

    /**
     * 新しい足場を生成する
     */
    generateNewPlatform() {
        // ランダムな足場のサイズと高さを決定
        const width = random(PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH);
        const y = random(PLATFORM_MIN_Y, PLATFORM_MAX_Y);

        // 前の足場との間隔をランダムにするが、ジャンプできる範囲内にする
        const gap = random(
            PLATFORM_SPAWN_INTERVAL_MIN,
            PLATFORM_SPAWN_INTERVAL_MAX
        );
        const x = this.nextPlatformX + gap;

        // 新しい足場を作成
        const platform = new Platform(x, y, width);
        this.platforms.push(platform);

        // 次の足場のX座標を更新
        this.nextPlatformX = x + width;

        return platform;
    }

    /**
     * 足場の描画処理（p5.playのsprite機能を使うので基本的には不要）
     */
    display() {
        // Spriteを使用しているので、このメソッドは空でOK
    }

    /**
     * 全ての足場をリセットする
     */
    reset() {
        // 全ての足場を削除
        this.platforms.forEach((platform) => platform.sprite.remove());
        this.platforms = [];

        // 初期の足場を再び生成
        this.nextPlatformX = 0;
        this.createInitialPlatforms();
    }
}
