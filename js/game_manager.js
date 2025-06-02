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
    constructor() {
        this.state = GAME_STATE.START;
        this.score = 0;
        this.player = new Player(INITIAL_PLAYER_X, INITIAL_PLAYER_Y);
        this.stageGenerator = new StageGenerator();
    }

    setup() {
        this.player.setup();
        this.stageGenerator.setup();
    }

    update() {
        if (this.state === GAME_STATE.PLAYING) {
            this.stageGenerator.update();
            this.player.update();
            this.score++;
        }
    }

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

    keyPressed(key) {
        if (this.state === GAME_STATE.START) {
            this.startGame();
        } else if (this.state === GAME_STATE.PLAYING) {
            this.player.jump();
        } else if (this.state === GAME_STATE.GAME_OVER) {
            this.resetGame();
        }
    }
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

    startGame() {
        this.state = GAME_STATE.PLAYING;
        this.score = 0;
    }

    resetGame() {
        this.state = GAME_STATE.START;
        this.player.reset();
        this.stageGenerator.reset();
    }
}
