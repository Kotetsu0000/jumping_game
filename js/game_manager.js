/**
 * ゲーム状態管理を担当するモジュール
 * ゲームの状態、スコア、UI表示を管理します
 */
import { Player } from './player.js';
import { StageGenerator } from './stage_generator.js';
import {
    GAME_STATE,
    INITIAL_PLAYER_X,
    INITIAL_PLAYER_Y,
    COLOR_PALETTE,
    FONT_SIZE_TITLE,
    FONT_SIZE_TEXT,
    FONT_SIZE_SCORE,
    GAME_OVER_MARGIN,
    PLAYER_SIZE,
} from './config.js';

// ローカルストレージキー
const HIGH_SCORE_KEY = 'jumping_game_high_score';

// p5.js関数は window.p5Globals 経由で直接アクセス

export class GameManager {
    /**
     * ゲームマネージャーを初期化する
     */ constructor() {
        this.state = GAME_STATE.START;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.player = new Player(INITIAL_PLAYER_X, INITIAL_PLAYER_Y);
        this.stageGenerator = new StageGenerator();
        this.spaceKeyPressed = false; // スペースキー押下状態を追跡
    }

    /**
     * ローカルストレージからハイスコアを読み込む
     * @returns {number} ハイスコア
     */
    loadHighScore() {
        const savedScore = localStorage.getItem(HIGH_SCORE_KEY);
        return savedScore ? parseInt(savedScore) : 0;
    }

    /**
     * ハイスコアをローカルストレージに保存する
     * @param {number} score - 保存するスコア
     */
    saveHighScore(score) {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }

    /**
     * ゲームの初期設定を行う
     */
    setup() {
        this.player.setup();
        this.stageGenerator.setup();
    }

    /**
     * ゲームの状態を更新する
     */ update() {
        if (this.state === GAME_STATE.PLAYING) {
            this.stageGenerator.update();
            // プレイヤー更新処理に足場の配列を渡す
            this.player.update(this.stageGenerator.platforms);

            // キー入力状態を更新（スペースキーが離されたらフラグをリセット）
            if (!window.keyIsDown(32)) {
                this.spaceKeyPressed = false;
            } // ゲームオーバー判定
            if (this.isGameOver()) {
                this.state = GAME_STATE.GAME_OVER;
                console.log('ゲームオーバー: ' + this.player.y);

                // ハイスコア更新チェック
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    this.saveHighScore(this.highScore);
                    console.log('新しいハイスコア: ' + this.highScore);
                }
            } else {
                // 難易度係数に応じてスコアを増加（最低1、最大は難易度の2倍）
                const difficultyBonus = Math.ceil(
                    this.stageGenerator.difficultyFactor
                );
                this.score += difficultyBonus;
            }
        }
    }
    /**
     * ゲームオーバー判定
     * @returns {boolean} ゲームオーバーの場合true
     */
    isGameOver() {
        // p5.jsではCANVAS_HEIGHTで定義された画面高さを基準に判定
        // 画面下限を超えた場合、ゲームオーバー
        // GAME_OVER_MARGINはプレイヤーがちょうど見えなくなるくらい
        const isOffScreen = this.player.y > window.height + PLAYER_SIZE;

        // デバッグ出力
        if (isOffScreen) {
            console.log(
                `ゲームオーバー検出: プレイヤー位置y=${this.player.y}, 画面高さ: ${window.height}`
            );
        }

        return isOffScreen;
    }

    /**
     * ゲーム画面を描画する
     */ draw() {
        this.stageGenerator.draw();
        this.player.display(); // issue #4の命名規則に合わせて変更

        window.fill(COLOR_PALETTE.TEXT);
        window.textSize(FONT_SIZE_TITLE);
        window.textAlign(window.CENTER, window.CENTER);

        if (this.state === GAME_STATE.START) {
            window.text(
                'ジャンピングゲーム',
                window.width / 2,
                window.height / 3
            );
            window.textSize(FONT_SIZE_TEXT);
            window.text(
                'スペースキーまたはクリックでスタート',
                window.width / 2,
                window.height / 2 + 50
            );
        } else if (this.state === GAME_STATE.PLAYING) {
            // スコア表示
            window.textSize(FONT_SIZE_SCORE);
            window.textAlign(window.RIGHT, window.TOP);
            window.text(`Score: ${this.score}`, window.width - 20, 50);

            // ハイスコア表示
            window.fill(COLOR_PALETTE.HIGH_SCORE);
            window.text(`High Score: ${this.highScore}`, window.width - 20, 20);
        } else if (this.state === GAME_STATE.GAME_OVER) {
            window.text('ゲームオーバー', window.width / 2, window.height / 3);
            window.textSize(FONT_SIZE_TEXT);
            window.text(
                `スコア: ${this.score}`,
                window.width / 2,
                window.height / 2 - 20
            );

            // ハイスコア表示（新記録かどうかで色を変える）
            if (this.score >= this.highScore) {
                window.fill(COLOR_PALETTE.HIGH_SCORE);
                window.text(
                    `ハイスコア: ${this.highScore} - 新記録!`,
                    window.width / 2,
                    window.height / 2 + 20
                );
            } else {
                window.text(
                    `ハイスコア: ${this.highScore}`,
                    window.width / 2,
                    window.height / 2 + 20
                );
            }

            window.fill(COLOR_PALETTE.TEXT);
            window.text(
                'スペースキーまたはクリックでリトライ',
                window.width / 2,
                window.height / 2 + 70
            );
        }
    }
    /**
     * キー入力処理
     */
    keyPressed() {
        if (this.state === GAME_STATE.START) {
            this.startGame();
        } else if (this.state === GAME_STATE.PLAYING) {
            // スペースキーが押された場合ジャンプ（連続入力防止）
            if (window.keyCode === 32 && !this.spaceKeyPressed) {
                // 32はスペースキーのキーコード
                this.spaceKeyPressed = true; // キー状態をマーク
                this.player.jump();
            }
        } else if (this.state === GAME_STATE.GAME_OVER) {
            this.resetGame();
        }
    }
    /**
     * マウス入力の処理
     */
    mousePressed() {
        // マウス入力時の処理を明示的に実装
        if (this.state === GAME_STATE.START) {
            this.startGame();
        } else if (this.state === GAME_STATE.PLAYING) {
            this.player.jump();
        } else if (this.state === GAME_STATE.GAME_OVER) {
            this.resetGame();
        }
    }

    /**
     * キーが離された時の処理
     */
    keyReleased() {
        // スペースキーが離されたらフラグをリセット
        if (window.keyCode === 32) {
            this.spaceKeyPressed = false;
        }
    }

    /**
     * ゲームを開始状態にする
     */
    startGame() {
        this.state = GAME_STATE.PLAYING;
        this.score = 0;

        // ステージを先にリセット（初期足場を生成）
        this.stageGenerator.reset();

        // プレイヤーをリセット
        this.player.reset();

        // プレイヤーを強制的に最初の足場の上に配置
        if (this.stageGenerator.platforms.length > 0) {
            const platform = this.stageGenerator.platforms[0];
            this.player.y = platform.y - PLAYER_SIZE / 2; // 足場の上に配置
            console.log(
                `プレイヤーを足場の上に配置: x=${this.player.x}, y=${this.player.y}`
            );

            // プレイヤーを着地状態に設定
            this.player.grounded = true;
            this.player.velocity = 0;
        }
    }

    /**
     * ゲームをリセットする
     */
    resetGame() {
        this.state = GAME_STATE.START;
        this.player.reset();
        this.stageGenerator.reset();
    }
}
