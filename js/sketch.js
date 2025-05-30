import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_PALETTE, FONT_SIZE_TITLE, FONT_SIZE_TEXT } from './config.js';
import GameManager from './game_manager.js';

// ゲーム変数
// TODO: 将来的にGameManagerインスタンスで初期化予定
let gameManager;

/**
 * p5.js のセットアップ関数
 * キャンバスの作成と初期化処理を行います
 */
function setup() {
    // キャンバスを作成
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // GameManager の初期化
    gameManager = new GameManager();
    gameManager.setup();
}

/**
 * p5.js のドロー関数（メインループ）
 * フレームごとに呼び出され、ゲームの状態を更新し描画します
 */
function draw() {
    // 背景描画
    background(COLOR_PALETTE.BACKGROUND);
    // ゲーム状態更新と描画
    gameManager.update();
    gameManager.draw();
}

/**
 * キーが押された時の処理
 */
function keyPressed() {
    if (gameManager) {
        gameManager.keyPressed(key);
    }
}

/**
 * マウスがクリックされた時の処理
 */
function mousePressed() {
    if (gameManager) {
        gameManager.mousePressed();
    }
}
