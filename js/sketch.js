// ゲームモジュールのインポート
import { GameManager } from './game_manager.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_PALETTE } from './config.js';

// p5.js関数は window経由で直接アクセスする

// ゲーム変数
window.gameManager = null; // グローバル変数として公開
let canvasCreated = false;

// デバッグモード（HTMLで明示的に設定されていない場合のみfalseにする）
if (window.debugMode === undefined) {
    window.debugMode = false;
}

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

    //現在のURLにdebug.htmlが含まれているか確認
    if (window.location.href.includes('debug.html')) {
        window.debugMode = true; // デバッグモードを有効にする
        console.log('デバッグモードが有効になりました');
    } else {
        window.debugMode = false; // デバッグモードを無効にする
        console.log('デバッグモードは無効です');
    }

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
    } // 衝突判定デバッグモード(デフォルトはオフ)
    window.collisionDebugMode = false;

    console.log('衝突判定システムを最適化しました');
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
            //console.log(
            //    `Frame processing time: ${processingTime.toFixed(2)}ms`
            //);
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
 * 改良版：より正確な測定と異常値の適切なフィルタリング
 */
function updatePerformanceMetrics() {
    // 現在のフレームレートを記録
    const currentFrameRate = window.frameRate();

    // ハイパフォーマンスタイミング
    const now = performance.now();
    const frameTime = lastFrameTime > 0 ? now - lastFrameTime : 16.67; // デフォルト60FPS相当
    lastFrameTime = now;

    // フレームレートの異常値フィルタリング（より洗練されたアプローチ）
    const MIN_VALID_FPS = 5; // 5FPS未満は異常値とみなす
    const MAX_VALID_FPS = 120; // 120FPS超は異常値とみなす（ほとんどのディスプレイの上限）

    const isValidFrameRate =
        currentFrameRate >= MIN_VALID_FPS && currentFrameRate <= MAX_VALID_FPS;

    // フレーム時間の異常値フィルタリング
    const MIN_VALID_FRAME_TIME = 1000 / MAX_VALID_FPS; // 約8.33ms (120FPS)
    const MAX_VALID_FRAME_TIME = 1000 / MIN_VALID_FPS; // 200ms (5FPS)

    const isValidFrameTime =
        frameTime >= MIN_VALID_FRAME_TIME && frameTime <= MAX_VALID_FRAME_TIME;

    // 有効なフレームレートのみ記録
    if (isValidFrameRate) {
        // 履歴に追加（古いデータを削除）
        frameRates.push(currentFrameRate);
        if (frameRates.length > MAX_FRAME_HISTORY) {
            frameRates.shift();
        }

        // 統計値を更新（配列が空でないことを確認）
        if (frameRates.length > 0) {
            // パフォーマンス最適化：配列をコピーせずに最小/最大を計算
            let min = frameRates[0];
            let max = frameRates[0];
            let sum = 0;

            for (let i = 0; i < frameRates.length; i++) {
                const rate = frameRates[i];
                min = Math.min(min, rate);
                max = Math.max(max, rate);
                sum += rate;
            }

            minFrameRate = min;
            maxFrameRate = max;

            // 標準の平均値（より効率的）
            avgFrameRate = sum / frameRates.length;
        }
    }

    // 有効なフレーム時間のみ記録
    if (isValidFrameTime) {
        frameTimeHistory.push(frameTime);
        if (frameTimeHistory.length > MAX_FRAME_HISTORY) {
            frameTimeHistory.shift();
        }
    }

    // 目標フレームレート（60FPS）からの逸脱を検出
    const targetFPS = 60;
    const currentFPS = isValidFrameRate ? currentFrameRate : avgFrameRate;
    const fpsDifference = targetFPS - currentFPS;

    // フレームレートが目標より10%以上低い場合、パフォーマンス警告
    if (fpsDifference > 6 && window.frameCount % 300 === 0) {
        console.warn(
            `パフォーマンス警告: 目標60FPSに対して${Math.floor(
                currentFPS
            )}FPSで動作中`
        );

        // 極端に低い場合は詳細情報をコンソールに出力
        if (currentFPS < 30 && window.debugMode) {
            const avgFrameTime =
                frameTimeHistory.reduce((a, b) => a + b, 0) /
                Math.max(1, frameTimeHistory.length);
            console.warn(
                `深刻なパフォーマンス低下: 平均フレーム時間=${avgFrameTime.toFixed(
                    2
                )}ms`
            );
        }
    }
}

/**
 * パフォーマンス統計を表示する
 * 最適化された表示ロジック
 */
function displayPerformanceStats() {
    const padding = 10;
    const lineHeight = 15;
    const width = 200;
    const height = 140;
    const x = CANVAS_WIDTH - width - padding;
    const y = padding;

    // 背景を描画（透明度を調整してゲーム画面の視認性を確保）
    window.push();
    window.fill(0, 0, 0, 170); // やや透明な黒
    window.stroke(255, 255, 255, 80); // より薄い枠線
    window.strokeWeight(1);
    window.rect(x, y, width, height, 6); // より丸い角

    // 一度だけテキスト設定（効率化）
    window.textSize(12);
    window.textAlign(window.LEFT, window.TOP);
    window.noStroke();

    // テキストのY位置を計算する関数（DRY原則）
    const textY = (line) => y + 5 + lineHeight * line;

    // タイトル - より目立つ表示
    window.fill(255, 255, 0);
    window.textSize(13);
    window.text(`パフォーマンスモニター`, x + 5, textY(0));
    window.textSize(12);

    // 現在の状態を数値化（パフォーマンススコア）
    const targetFPS = 60;
    const currentFPS = window.frameRate();
    const performanceRatio = Math.min(1, currentFPS / targetFPS);

    // パフォーマンススコアを計算（0-100%）
    const performanceScore = Math.floor(performanceRatio * 100);

    // パフォーマンススコアに基づく総合評価
    let performanceRating = '';
    if (performanceScore >= 95) performanceRating = '最高';
    else if (performanceScore >= 85) performanceRating = '良好';
    else if (performanceScore >= 70) performanceRating = '普通';
    else if (performanceScore >= 50) performanceRating = '注意';
    else performanceRating = '低下';

    // 総合評価をカラフルに表示
    window.fill(getFPSColor(currentFPS));
    window.textSize(13);
    window.text(
        `パフォーマンス: ${performanceRating} (${performanceScore}%)`,
        x + 5,
        textY(1)
    );
    window.textSize(12);
    window.fill(255);

    // FPS情報をコンパクトに表示
    window.text(
        `現在FPS: ${currentFPS.toFixed(1)} (平均: ${avgFrameRate.toFixed(1)})`,
        x + 5,
        textY(2)
    );
    window.text(
        `FPS範囲: ${minFrameRate.toFixed(1)} - ${maxFrameRate.toFixed(1)}`,
        x + 5,
        textY(3)
    );

    // フレーム時間とメモリ情報を表示（利用可能な場合のみ）
    if (frameTimeHistory.length > 0) {
        // 異常値を除外した平均計算
        const validTimes = frameTimeHistory.filter((t) => t > 0 && t < 1000);
        const avgFrameTime =
            validTimes.length > 0
                ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
                : 0;

        // 16.67msが60FPS相当（目標値）
        const frameTimeQuality = Math.min(1, 16.67 / avgFrameTime);
        const frameTimeColor = getQualityColor(frameTimeQuality);

        window.fill(frameTimeColor);
        window.text(
            `フレーム処理時間: ${avgFrameTime.toFixed(2)}ms`,
            x + 5,
            textY(4)
        );
        window.fill(255);
    }

    // メモリ使用量（利用可能な場合のみ）
    if (window.performance && window.performance.memory) {
        const memUsed =
            window.performance.memory.usedJSHeapSize / (1024 * 1024);
        const memTotal =
            window.performance.memory.totalJSHeapSize / (1024 * 1024);
        const memUsage = memUsed / memTotal; // メモリ使用率

        // メモリ使用率に応じた色
        window.fill(getQualityColor(1 - memUsage)); // 使用率が低いほど良い
        window.text(
            `メモリ: ${memUsed.toFixed(1)}MB / ${memTotal.toFixed(1)}MB (${(
                memUsage * 100
            ).toFixed(0)}%)`,
            x + 5,
            textY(5)
        );
        window.fill(255);
    }

    // オブジェクト数情報（デバッグ向け）
    if (window.gameManager && window.gameManager.stageGenerator) {
        const platformCount =
            window.gameManager.stageGenerator.platforms.length;
        window.text(`オブジェクト数: ${platformCount}個`, x + 5, textY(6));
    }

    // コントロール情報
    window.fill(180, 180, 180);
    window.text(
        'Pキー: 統計表示切替 / Dキー: デバッグ / Cキー: 衝突検出',
        x + 5,
        textY(7)
    );
    window.pop();
}

/**
 * 品質スコアに応じた色を返す（赤→黄→緑のグラデーション）
 * @param {number} quality - 0.0〜1.0の品質スコア
 * @returns {array} - [r, g, b]の色配列
 */
function getQualityColor(quality) {
    quality = Math.max(0, Math.min(1, quality)); // 0〜1に制限

    if (quality < 0.5) {
        // 赤から黄色へのグラデーション (0.0-0.5)
        const ratio = quality * 2;
        return [255, 255 * ratio, 0];
    } else {
        // 黄色から緑へのグラデーション (0.5-1.0)
        const ratio = (quality - 0.5) * 2;
        return [255 * (1 - ratio), 255, 0];
    }
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
    } // シークレットモード: 衝突判定の詳細分析モード (Cキー)
    if (kb.presses('c') || kb.presses('C')) {
        window.collisionDebugMode = !window.collisionDebugMode;
        console.log(
            `衝突判定分析モード: ${window.collisionDebugMode ? 'オン' : 'オフ'}`
        );

        // 衝突判定モードがオンの場合は自動的にデバッグモードも有効化
        if (window.collisionDebugMode && !window.debugMode) {
            window.debugMode = true;
            console.log('デバッグモードも自動的に有効化されました');
        }

        // プレイヤーと足場のスプライトのデバッグ表示を更新
        if (gameManager) {
            if (gameManager.player && gameManager.player.sprite) {
                gameManager.player.sprite.debug = window.collisionDebugMode;
            }

            if (
                gameManager.stageGenerator &&
                gameManager.stageGenerator.platforms
            ) {
                gameManager.stageGenerator.platforms.forEach((platform) => {
                    if (platform.sprite) {
                        platform.sprite.debug = window.collisionDebugMode;
                    }
                });
            }
        }
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
 * マウスがクリックされた時の処理（クリックイベント用）
 * mouseClickedイベントも処理することで入力の信頼性を向上
 */
window.mouseClicked = function () {
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
