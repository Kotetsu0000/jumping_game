// ゲームモジュールのインポート
import { GameManager } from './game_manager.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_PALETTE } from './config.js';

// p5.js関数は window.p5Globals 経由で直接アクセスするため変数は不要

// ゲーム変数
let gameManager;

/**
 * p5.js のセットアップ関数
 * キャンバスの作成と初期化処理を行います
 */
window.setup = function () {
    // キャンバスを作成
    window.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // GameManager の初期化
    gameManager = new GameManager();
    gameManager.setup();
};

/**
 * p5.js のドロー関数（メインループ）
 * フレームごとに呼び出され、ゲームの状態を更新し描画します
 */
window.draw = function () {
    // 背景描画
    window.background(COLOR_PALETTE.BACKGROUND);
    // ゲーム状態更新と描画
    gameManager.update();
    gameManager.draw();
};

/**
 * キーが押された時の処理
 */
window.keyPressed = function () {
    if (gameManager) {
        gameManager.keyPressed(key);
    }
};

/**
 * マウスがクリックされた時の処理
 */
window.mousePressed = function () {
    if (gameManager) {
        gameManager.mousePressed();
    }
};
