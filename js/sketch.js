/**
 * メインの p5.js スケッチファイル
 * ゲーム全体の初期化とメインループを管理します
 */

// ゲームマネージャーのインスタンス
let gameManager;

/**
 * p5.jsの初期化関数
 */
function setup() {
    // キャンバスの作成
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // フレームレートの設定
    frameRate(FRAME_RATE);

    // p5.playのワールド初期化
    world.gravity.y = 0; // ゲーム内で独自の重力を使用するため、p5.playの重力は無効化

    // ゲームマネージャーの初期化
    gameManager = new GameManager();

    // テキスト描画の設定
    textFont('Arial');
}

/**
 * p5.jsのメインループ
 */
function draw() {
    // 背景クリア
    background(COLOR_PALETTE.BACKGROUND);

    // 入力処理
    gameManager.handleInput();

    // ゲーム状態の更新
    gameManager.updateGame();

    // ゲーム状態の描画（スコア表示など）
    gameManager.display();

    // p5.playのアップデート（すべてのスプライトを自動的に更新・描画）
    world.step();
    world.draw();
}

/**
 * キーが離された時の処理
 */
function keyReleased() {
    // スペースキーが離された場合の処理（連続ジャンプ防止など必要に応じて）
    return false; // デフォルトのイベント処理を防ぐ
}

/**
 * マウスが離された時の処理
 */
function mouseReleased() {
    // マウスクリックが離された場合の処理（連続ジャンプ防止など必要に応じて）
    return false; // デフォルトのイベント処理を防ぐ
}

/**
 * ウィンドウサイズが変更された時の処理
 */
function windowResized() {
    // 必要に応じてキャンバスをリサイズ
    // resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
}
