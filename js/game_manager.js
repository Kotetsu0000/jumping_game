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
} from './config.js';

// p5.js関数は window.p5Globals 経由で直接アクセス

export class GameManager {
    /**
     * ゲームマネージャーを初期化する
     */
    constructor() {
        this.state = GAME_STATE.START;
        this.score = 0;
        this.player = new Player(INITIAL_PLAYER_X, INITIAL_PLAYER_Y);
        this.stageGenerator = new StageGenerator();
    }

    /**
     * ゲームの初期設定を行う
     */ /**
     * ゲームの初期設定を行う
     */
    setup() {
        this.player.setup();
        this.stageGenerator.setup();
    }

    /**
     * ゲームの状態を更新する
     */ /**
     * ゲームの状態を更新する
     */
    update() {
        if (this.state === GAME_STATE.PLAYING) {
            this.stageGenerator.update();
            this.player.update();
            this.score++;
        }
    }

    /**
     * ゲーム画面を描画する
     */
    draw() {
        this.stageGenerator.draw();
        this.player.draw();

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
            window.text(`Score: ${this.score}`, window.width - 100, 50);
        } else if (this.state === GAME_STATE.GAME_OVER) {
            window.text('ゲームオーバー', window.width / 2, window.height / 3);
            window.textSize(FONT_SIZE_TEXT);
            window.text(
                'スペースキーまたはクリックでリトライ',
                window.width / 2,
                window.height / 2 + 50
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
            this.player.jump();
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
     * ゲームを開始状態にする
     */
    startGame() {
        this.state = GAME_STATE.PLAYING;
        this.score = 0;
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
