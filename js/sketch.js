// ゲームモジュールのインポート
import { GameManager } from './game_manager.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_PALETTE } from './config.js';

// p5.js関数は window経由で直接アクセスする

// ゲーム変数
window.gameManager = null; // グローバル変数として公開
let canvasCreated = false;

// デバッグモード（初期設定、URLパラメータで制御可能）
window.debugMode = window.debugMode || false;

// パフォーマンスモニタリング用の変数
let frameRates = [];
const MAX_FRAME_HISTORY = 60; // 直近60フレームの履歴を保持
let lastFrameTime = 0;
let frameTimeHistory = [];
let minFrameRate = 60;
let maxFrameRate = 0;
let avgFrameRate = 0;
let showPerformanceStats = false; // Pキーでトグル可能

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
    window.gameManager = new GameManager();
    window.gameManager.setup(); // パフォーマンスモニタリングの初期化
    lastFrameTime = window.millis();

    // Ensure kb is globally available
    if (typeof window.kb === 'object') {
        window.kb = window.kb;
        console.log('p5.play keyboard controller (kb) is available');
    } else {
        console.warn(
            'p5.play keyboard controller (kb) not found, using fallback'
        );
        // Simple fallback for keyboard input
        window.kb = {
            presses: function (key) {
                return window.keyIsPressed && window.key === key;
            },
        };
    }

    // デバッグ情報を表示
    if (window.debugMode) {
        console.log('デバッグモードでゲームを初期化しました');
        console.log('Player:', window.gameManager.player);
    }
}

/**
 * p5.js のドロー関数（メインループ）
 * フレームごとに呼び出され、ゲームの状態を更新し描画します
 */
window.draw = function () {
    // パフォーマンス測定開始
    const startTime = performance.now();

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

        // パフォーマンス測定処理
        updatePerformanceMetrics();
        if (showPerformanceStats || window.debugMode) {
            displayPerformanceStats();
        }

        // 1フレームの処理時間を記録（実際のフレーム時間ではなく、処理時間）
        const processingTime = performance.now() - startTime;
        if (window.debugMode) {
            console.log(
                `Frame processing time: ${processingTime.toFixed(2)}ms`
            );
        }
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
 * パフォーマンスメトリクスを更新する
 */
function updatePerformanceMetrics() {
    // 現在のフレームレートを記録（異常値を除外）
    const currentFrameRate = window.frameRate();

    // 極端に低いまたは高いFPS値は異常として除外（0に近いか、1000を超える場合）
    if (currentFrameRate > 0.1 && currentFrameRate < 1000) {
        frameRates.push(currentFrameRate);

        // 最大MAX_FRAME_HISTORYフレームまで記録
        if (frameRates.length > MAX_FRAME_HISTORY) {
            frameRates.shift();
        }

        // 統計値を計算（配列が空でないことを確認）
        if (frameRates.length > 0) {
            minFrameRate = Math.min(...frameRates);
            maxFrameRate = Math.max(...frameRates);

            // 平均フレームレートを計算（直近の値ほど重みを大きくする加重平均）
            let weightedSum = 0;
            let weightSum = 0;

            for (let i = 0; i < frameRates.length; i++) {
                const weight = i + 1; // 古い値ほど小さい重み
                weightedSum += frameRates[i] * weight;
                weightSum += weight;
            }

            avgFrameRate = weightedSum / weightSum;
        }
    }

    // フレーム時間の記録（1フレームの処理にかかる時間、ms）
    const now = performance.now();
    if (lastFrameTime > 0) {
        const frameTime = now - lastFrameTime;

        // 極端な値を除外（例：タブが非アクティブだった場合など）
        if (frameTime > 0 && frameTime < 1000) {
            // 1秒以上の遅延は無視
            frameTimeHistory.push(frameTime);
            if (frameTimeHistory.length > MAX_FRAME_HISTORY) {
                frameTimeHistory.shift();
            }
        }
    }
    lastFrameTime = now;
}

/**
 * パフォーマンス統計を表示する
 */
function displayPerformanceStats() {
    const padding = 10;
    const lineHeight = 15;
    const width = 200;
    const height = 120;
    const x = CANVAS_WIDTH - width - padding;
    const y = padding;

    // 背景を描画
    window.push();
    window.fill(0, 0, 0, 180); // 半透明の黒
    window.stroke(255, 255, 255, 100); // 薄い白の枠線
    window.strokeWeight(1);
    window.rect(x, y, width, height, 5); // 角を少し丸くする

    // テキスト設定
    window.fill(255);
    window.textSize(12);
    window.textAlign(window.LEFT, window.TOP);
    window.noStroke();

    // タイトル
    window.fill(255, 255, 0); // 黄色でタイトル表示
    window.text(`パフォーマンスモニター`, x + 5, y + 5);
    window.fill(255);

    // フレームレート情報を表示
    const currentFPS = window.frameRate();
    window.fill(getFPSColor(currentFPS)); // FPSに応じた色
    window.text(
        `現在のFPS: ${currentFPS.toFixed(1)}`,
        x + 5,
        y + 5 + lineHeight
    );
    window.fill(255);

    window.text(
        `平均FPS: ${avgFrameRate.toFixed(1)}`,
        x + 5,
        y + 5 + lineHeight * 2
    );
    window.text(
        `最小FPS: ${minFrameRate.toFixed(1)}`,
        x + 5,
        y + 5 + lineHeight * 3
    );
    window.text(
        `最大FPS: ${maxFrameRate.toFixed(1)}`,
        x + 5,
        y + 5 + lineHeight * 4
    );

    // フレーム時間情報を表示
    if (frameTimeHistory.length > 0) {
        const avgFrameTime =
            frameTimeHistory.reduce((a, b) => a + b, 0) /
            frameTimeHistory.length;
        window.text(
            `フレーム処理時間: ${avgFrameTime.toFixed(2)}ms`,
            x + 5,
            y + 5 + lineHeight * 5
        );
    }

    // メモリ使用量を表示（可能な場合）
    if (window.performance && window.performance.memory) {
        const memUsed =
            window.performance.memory.usedJSHeapSize / (1024 * 1024);
        const memTotal =
            window.performance.memory.totalJSHeapSize / (1024 * 1024);
        window.text(
            `メモリ: ${memUsed.toFixed(1)}MB / ${memTotal.toFixed(1)}MB`,
            x + 5,
            y + 5 + lineHeight * 6
        );
    }

    // ヒントを表示
    window.fill(200, 200, 200);
    window.text(
        'Pキー: パフォーマンス表示切替 / Dキー: デバッグモード',
        x + 5,
        y + 5 + lineHeight * 7
    );
    window.pop();
}

/**
 * FPSの値に応じた色を返す
 * @param {number} fps - フレームレート
 * @returns {array} - [r, g, b]の色配列
 */
function getFPSColor(fps) {
    if (fps >= 55) return [0, 255, 0]; // 良好: 緑
    if (fps >= 40) return [255, 255, 0]; // 注意: 黄色
    return [255, 0, 0]; // 警告: 赤
}

/**
 * キーが押された時の処理
 */
window.keyPressed = function () {
    // デバッグモード切替 (Dキー)
    if (kb.presses('d') || kb.presses('D')) {
        window.debugMode = !window.debugMode;
        console.log(`デバッグモード: ${window.debugMode ? 'オン' : 'オフ'}`);
        return;
    }

    // パフォーマンス統計情報の表示切替 (Pキー)
    if (kb.presses('p') || kb.presses('P')) {
        showPerformanceStats = !showPerformanceStats;
        console.log(
            `パフォーマンス統計情報: ${
                showPerformanceStats ? '表示' : '非表示'
            }`
        );
        return;
    }

    // 初期化に失敗した場合、Rキーでリロード
    if (!gameManager && (kb.presses('r') || kb.presses('R'))) {
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
