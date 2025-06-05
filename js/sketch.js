// ゲームモジュールのインポート
import { GameManager } from './game_manager.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_PALETTE } from './config.js';

// p5.js関数は window経由で直接アクセスする

// ゲーム変数
let gameManager = null;
let canvasCreated = false;

/**
 * p5オブジェクトとプレイ環境が準備されているかチェックする
 * @returns {boolean} 準備完了しているかどうか
 */
function isP5PlayReady() {
    // p5.jsの存在確認
    if (typeof window.p5 !== 'function') {
        console.warn('p5.jsが利用できません');
        return false;
    }

    // p5.playの必須コンポーネント確認
    if (
        typeof window.world !== 'object' ||
        typeof window.Sprite !== 'function'
    ) {
        console.warn('p5.playが正しく初期化されていません');
        return false;
    }

    return true;
}

/**
 * p5.js のセットアップ関数
 * キャンバスの作成と初期化処理を行います
 */
window.setup = function () {
    console.log('セットアップを開始します...');

    // 多重初期化防止
    if (canvasCreated) {
        console.log('すでにセットアップ済みです。スキップします。');
        return;
    }

    // キャンバスを作成
    window.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasCreated = true;

    console.log('キャンバスを作成しました:', CANVAS_WIDTH, 'x', CANVAS_HEIGHT);

    // ライブラリの初期化状態をコンソールに表示
    console.log('---------- ライブラリ状態 ----------');
    console.log('p5.js:', typeof window.p5 === 'function' ? '✓' : '✗');
    console.log('planck.js:', typeof window.planck === 'object' ? '✓' : '✗');
    console.log(
        'p5.play - Sprite:',
        typeof window.Sprite === 'function' ? '✓' : '✗'
    );
    console.log(
        'p5.play - world:',
        typeof window.world === 'object' ? '✓' : '✗'
    );
    console.log('-----------------------------------');

    // p5.playが準備できているか確認
    if (!isP5PlayReady()) {
        // 基本的な表示のみ行う
        window.background(COLOR_PALETTE.BACKGROUND);
        window.fill(255);
        window.textSize(18);
        window.textAlign(window.CENTER, window.CENTER);
        window.text(
            'ライブラリ初期化中...',
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2
        );

        // 少し待ってから再試行
        console.log('p5.playの初期化を待機しています...');
        setTimeout(() => {
            tryInitGame();
        }, 500);
        return;
    }

    // すべて準備ができているので、ゲームを初期化
    initializeGame();
};
/**
 * p5.playを使ったゲームの初期化を試みる関数
 * セットアップ時にライブラリがまだ準備できていない場合に呼び出される
 */
function tryInitGame() {
    if (isP5PlayReady()) {
        console.log('p5.playの準備ができました。ゲームを初期化します。');
        initializeGame();
    } else {
        console.warn(
            'p5.playはまだ準備ができていません。手動初期化を試みます。'
        );

        // 手動で初期化を試みる
        if (typeof window.p5Ready === 'function') {
            window.p5Ready(window);

            // 再確認
            if (isP5PlayReady()) {
                console.log(
                    'p5.playを手動で初期化しました。ゲームを開始します。'
                );
                initializeGame();
                return;
            }
        }

        // 初期化に失敗した場合はエラーメッセージを表示
        window.background(COLOR_PALETTE.BACKGROUND);
        window.fill(255);
        window.textSize(18);
        window.textAlign(window.CENTER, window.CENTER);
        window.text(
            'エラー: p5.playの初期化に失敗しました',
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 - 30
        );
        window.text(
            'ページをリロードしてください',
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 + 10
        );

        console.error(
            'p5.playの初期化に失敗しました。ページをリロードしてください。'
        );
    }
}

/**
 * ゲームを実際に初期化する関数
 */
function initializeGame() {
    // 物理エンジンの設定
    console.log('物理エンジンの重力を設定します');
    window.world.gravity.y = 0; // 物理エンジンの重力はオフ（独自処理で実装）

    // バックグラウンドカラーを設定
    window.background(COLOR_PALETTE.BACKGROUND);

    // GameManagerの初期化
    console.log('GameManagerを初期化します');
    try {
        gameManager = new GameManager();
        gameManager.setup();
        console.log('ゲームの初期化が完了しました');
    } catch (error) {
        console.error('GameManager初期化時にエラーが発生しました:', error);
        window.text(
            'エラー: ゲーム初期化失敗 - ' + error.message,
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2
        );
    }
}

/**
 * p5.js のドロー関数（メインループ）
 * フレームごとに呼び出され、ゲームの状態を更新し描画します
 */
window.draw = function () {
    // 背景描画
    window.background(COLOR_PALETTE.BACKGROUND);

    // GameManagerが初期化されていない場合
    if (!gameManager) {
        // ライブラリのロード状況に応じたメッセージ
        if (!isP5PlayReady()) {
            window.fill(255);
            window.textSize(16);
            window.textAlign(window.CENTER, window.CENTER);
            window.text(
                'ライブラリ読み込み中...',
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2
            );

            // 読み込みが完了していれば初期化を試みる
            if (window.libraryStatus && window.libraryStatus.p5playReady) {
                tryInitGame();
            }
        }
        return;
    }

    try {
        // ゲーム状態更新と描画
        gameManager.update();
        gameManager.draw();
    } catch (error) {
        console.error('ゲーム実行中にエラーが発生しました:', error);
        window.fill(255, 0, 0);
        window.textSize(14);
        window.text(
            'エラー: ' + error.message,
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 30
        );
    }
};

/**
 * キーが押された時の処理
 */
window.keyPressed = function () {
    // デバッグモード切替 (Dキー)
    if (window.key === 'd' || window.key === 'D') {
        window.debugMode = !window.debugMode;
        console.log(`デバッグモード: ${window.debugMode ? 'オン' : 'オフ'}`);
        return;
    }

    // 初期化に失敗した場合、Rキーでリロード
    if (!gameManager && (window.key === 'r' || window.key === 'R')) {
        location.reload();
        return;
    }

    // ゲームマネージャーが初期化されている場合
    if (gameManager) {
        gameManager.keyPressed();
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

/**
 * キーが離された時の処理
 */
window.keyReleased = function () {
    if (gameManager) {
        gameManager.keyReleased();
    }
};
