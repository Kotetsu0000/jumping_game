/**
 * ゲーム状態管理を担当するモジュール
 * ゲームの状態、スコア、UI表示を管理します
 */

import { GAME_STATE, COLOR_PALETTE, FONT_SIZE_TITLE, FONT_SIZE_TEXT, INITIAL_PLAYER_X, INITIAL_PLAYER_Y } from './config.js';
import Player from './player.js';
import StageGenerator from './stage_generator.js';

export default class GameManager {
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
        fill(COLOR_PALETTE.TEXT);
        textSize(FONT_SIZE_TITLE);
        textAlign(CENTER, CENTER);
        if (this.state === GAME_STATE.START) {
            text('ジャンピングゲーム', width / 2, height / 3);
            textSize(FONT_SIZE_TEXT);
            text('スペースキーまたはクリックでスタート', width / 2, height / 2 + 50);
        } else if (this.state === GAME_STATE.PLAYING) {
            text(`Score: ${this.score}`, width - 100, 50);
        } else if (this.state === GAME_STATE.GAME_OVER) {
            text('ゲームオーバー', width / 2, height / 3);
            textSize(FONT_SIZE_TEXT);
            text('スペースキーまたはクリックでリトライ', width / 2, height / 2 + 50);
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
        this.keyPressed();
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
