/**
 * メインスケッチファイル
 * p5.jsのセットアップと描画ループを含みます
 */

// ゲーム変数
let gameManager;

/**
 * p5.js のセットアップ関数
 * キャンバスの作成と初期化処理を行います
 */
function setup() {
    // キャンバスを作成
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // テスト描画のための一時的なコード
    // 最終的にはGameManagerクラスでゲーム管理を行います
}

/**
 * p5.js のドロー関数（メインループ）
 * フレームごとに呼び出され、ゲームの状態を更新し描画します
 */
function draw() {
    // 背景を描画
    background(COLOR_PALETTE.BACKGROUND);

    // テスト描画のための一時的なコード
    fill(COLOR_PALETTE.PLAYER);
    ellipse(width / 2, height / 2, PLAYER_SIZE, PLAYER_SIZE);

    // テキスト表示テスト
    fill(COLOR_PALETTE.TEXT);
    textSize(FONT_SIZE_TITLE);
    textAlign(CENTER, CENTER);
    text('ジャンピングゲーム', width / 2, height / 3);

    textSize(FONT_SIZE_TEXT);
    text('スペースキーまたはクリックでスタート', width / 2, height / 2 + 100);
}

/**
 * キーが押された時の処理
 */
function keyPressed() {
    if (key === ' ') {
        // スペースキーが押された時の処理
        console.log('スペースキーが押されました');
    }
}

/**
 * マウスがクリックされた時の処理
 */
function mousePressed() {
    // マウスクリック時の処理
    console.log('マウスがクリックされました');
}
