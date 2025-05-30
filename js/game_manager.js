/**
 * ゲームの状態管理を担当するクラス
 */
class GameManager {
    /**
     * ゲームマネージャーのコンストラクタ
     */
    constructor() {
        // ゲームの状態
        this.state = GAME_STATE.MENU;

        // スコア関連
        this.score = 0;
        this.highScore = 0;

        // プレイヤーとステージの生成
        this.player = new Player();
        this.stageGenerator = new StageGenerator();
    }

    /**
     * ゲームの状態に応じた更新処理
     */
    updateGame() {
        switch (this.state) {
            case GAME_STATE.MENU:
                // メニュー画面の更新（特に処理はない）
                break;

            case GAME_STATE.PLAYING:
                // プレイ中の更新
                this.updatePlaying();
                break;

            case GAME_STATE.GAME_OVER:
                // ゲームオーバー画面の更新（特に処理はない）
                break;
        }
    }

    /**
     * プレイ中の更新処理
     */
    updatePlaying() {
        // プレイヤーの更新
        const isGameOver = this.player.update();

        // ゲームオーバー判定
        if (isGameOver) {
            this.state = GAME_STATE.GAME_OVER;
            if (this.score > this.highScore) {
                this.highScore = this.score;
            }
            return;
        }

        // ステージの更新
        this.stageGenerator.update();

        // 足場との衝突判定
        for (let platform of this.stageGenerator.platforms) {
            this.player.checkCollision(platform);
        }

        // スコアの更新（進んだ距離に応じて加算）
        this.updateScore();
    }

    /**
     * スコアを更新する
     */
    updateScore() {
        this.score += SCROLL_SPEED / 10;
    }

    /**
     * スコアを表示する
     */
    displayScore() {
        textSize(UI_FONT_SIZE);
        fill(COLOR_PALETTE.TEXT);
        textAlign(LEFT, TOP);
        text(`スコア: ${Math.floor(this.score)}m`, UI_MARGIN, UI_MARGIN);
    }

    /**
     * ゲームオーバー画面を表示する
     */
    displayGameOverScreen() {
        // 半透明の背景
        fill(COLOR_PALETTE.UI_BG);
        rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // ゲームオーバーメッセージとスコア
        fill(COLOR_PALETTE.UI_TEXT);
        textAlign(CENTER, CENTER);

        textSize(UI_FONT_SIZE * 1.5);
        text('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

        textSize(UI_FONT_SIZE);
        text(
            `スコア: ${Math.floor(this.score)}m`,
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2
        );
        text(
            `ハイスコア: ${Math.floor(this.highScore)}m`,
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 + UI_FONT_SIZE * 1.5
        );

        textSize(UI_SMALL_FONT_SIZE);
        text(
            'スペースキーまたはクリックでリスタート',
            CANVAS_WIDTH / 2,
            (CANVAS_HEIGHT * 3) / 4
        );
    }

    /**
     * メニュー画面を表示する
     */
    displayMenuScreen() {
        // 半透明の背景
        fill(COLOR_PALETTE.UI_BG);
        rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // タイトルとスタート方法
        fill(COLOR_PALETTE.UI_TEXT);
        textAlign(CENTER, CENTER);

        textSize(UI_FONT_SIZE * 2);
        text('ジャンピングゲーム', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

        textSize(UI_FONT_SIZE);
        text(
            'スペースキーまたはクリックでジャンプ',
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2
        );

        textSize(UI_SMALL_FONT_SIZE);
        text(
            'スペースキーまたはクリックでスタート',
            CANVAS_WIDTH / 2,
            (CANVAS_HEIGHT * 3) / 4
        );
    }

    /**
     * 入力処理
     */
    handleInput() {
        // スペースキーか左クリックが押されたか
        const input = (keyIsPressed && keyCode === 32) || mouseIsPressed;

        switch (this.state) {
            case GAME_STATE.MENU:
                // メニューでの入力
                if (input) {
                    this.state = GAME_STATE.PLAYING;
                }
                break;

            case GAME_STATE.PLAYING:
                // プレイ中の入力（ジャンプ）
                if (input) {
                    this.player.jump();
                }
                break;

            case GAME_STATE.GAME_OVER:
                // ゲームオーバー画面での入力（リスタート）
                if (input) {
                    this.resetGame();
                    this.state = GAME_STATE.PLAYING;
                }
                break;
        }
    }

    /**
     * ゲームをリセットする
     */
    resetGame() {
        this.score = 0;
        this.player.reset();
        this.stageGenerator.reset();
    }

    /**
     * ゲームの描画処理（p5.playのsprite機能を使うので基本的にはスコアとUI部分のみ）
     */
    display() {
        // 状態に応じた描画
        switch (this.state) {
            case GAME_STATE.MENU:
                this.displayMenuScreen();
                break;

            case GAME_STATE.PLAYING:
                this.displayScore();
                break;

            case GAME_STATE.GAME_OVER:
                this.displayGameOverScreen();
                break;
        }
    }
}
