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
    FONT_SIZE_SCORE,
    GAME_OVER_MARGIN,
    PLAYER_SIZE,
} from './config.js';

// ローカルストレージキー
const HIGH_SCORE_KEY = 'jumping_game_high_score';

// p5.js関数は window.p5Globals 経由で直接アクセス

export class GameManager {
    /**
     * ゲームマネージャーを初期化する     */ constructor() {
        this.state = GAME_STATE.START;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.isNewHighScore = false; // 新記録フラグを追加
        this.player = new Player(INITIAL_PLAYER_X, INITIAL_PLAYER_Y);
        this.stageGenerator = new StageGenerator();
        this.spaceKeyPressed = false; // スペースキー押下状態を追跡
    }

    /**
     * ローカルストレージからハイスコアを読み込む
     * @returns {number} ハイスコア
     */
    loadHighScore() {
        const savedScore = localStorage.getItem(HIGH_SCORE_KEY);
        return savedScore ? parseInt(savedScore) : 0;
    }

    /**
     * ハイスコアをローカルストレージに保存する
     * @param {number} score - 保存するスコア
     */
    saveHighScore(score) {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }

    /**
     * ゲームの初期設定を行う
     */
    setup() {
        this.player.setup();
        this.stageGenerator.setup();
    }
    /**
     * ゲームの状態を更新する
     */
    update() {
        if (this.state === GAME_STATE.PLAYING) {
            // ステージジェネレーターを更新し、難易度情報を取得
            const difficultyInfo = this.stageGenerator.update();

            // 入力処理の最適化
            // 複数の入力方法をサポート（キーボード、タッチ、マウス）
            const spaceIsPressed = kb.pressing(' ') || window.mouseIsPressed;

            // 前回の入力状態と比較して変化を検出
            const inputStateChanged = spaceIsPressed !== this.spaceKeyPressed;

            // 入力の状態変化に応じた処理
            if (inputStateChanged) {
                if (spaceIsPressed) {
                    // ジャンプボタンが押された瞬間
                    if (window.debugMode) {
                        console.log('入力検出：ジャンプ開始');
                    }
                    this.player.jump();
                } else {
                    // ジャンプボタンが離された瞬間
                    if (window.debugMode) {
                        console.log('入力解除');
                    }
                }
                // 入力状態を更新
                this.spaceKeyPressed = spaceIsPressed;
            }

            // プレイヤー更新（足場情報と入力状態を渡す）
            this.player.update(this.stageGenerator.platforms, spaceIsPressed);

            // ゲームオーバー判定と処理
            if (this.isGameOver()) {
                this.handleGameOver();
            } else {
                // 正常プレイ中：進行距離と難易度に基づいてスコアを更新
                this.updateScore(difficultyInfo);
            }
        }
    }

    /**
     * ゲームオーバー時の処理
     */
    handleGameOver() {
        // ゲーム状態を更新
        this.state = GAME_STATE.GAME_OVER;
        console.log(
            `ゲームオーバー: y=${Math.floor(this.player.y)}, スコア=${
                this.score
            }`
        );

        // ハイスコア更新チェック
        this.checkHighScore();

        // ゲームオーバーサウンド（実装されていれば）
        // this.playGameOverSound();
    }

    /**
     * ハイスコア更新チェックと保存
     */
    checkHighScore() {
        this.isNewHighScore = false;
        if (this.score > this.highScore) {
            this.isNewHighScore = true;
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
            console.log('新しいハイスコア達成: ' + this.highScore);
        }
    }
    /**
     * スコアを更新する
     * 進行距離と難易度に基づいてスコアを計算
     * @param {Object} difficultyInfo 難易度情報（オプション）
     */
    updateScore(difficultyInfo) {
        // 難易度係数を取得（引数から取得するか、直接アクセスするか）
        const difficulty =
            difficultyInfo?.difficulty || this.stageGenerator.difficultyFactor;

        // 基本スコアは難易度係数に基づく（より高い精度で計算）
        const difficultyBonus = Math.ceil(difficulty * 1.5);

        // 進行距離に基づいたボーナス（足場の速度に応じて進んだ距離として計算）
        const gameTime = this.stageGenerator.gameTime;
        const timeBonus = Math.floor(gameTime / 180); // 3秒ごとに1ポイント追加

        // 継続ジャンプボーナス（連続ジャンプ回数に応じたボーナス）
        // 実装予定の機能のためのプレースホルダ
        const jumpBonus = 0; // 未実装

        // 実際の距離メートルを計算（表示用）
        // より現実的な距離計算：時間 * 速度 * スケール係数
        const distanceScale = 0.05; // メートルへの変換係数
        this.distanceMeters = Math.floor(gameTime * difficulty * distanceScale);

        // 合計スコアを更新
        const baseScore = difficultyBonus + timeBonus + jumpBonus;
        this.score += baseScore;

        // 10秒ごとにスコアデバッグ情報を表示（デバッグモード時）
        if (window.debugMode && gameTime % 600 === 0) {
            console.log(
                `スコア更新: ${this.score} (+${baseScore}), ` +
                    `距離: ${this.distanceMeters}m, ` +
                    `難易度: ${difficulty.toFixed(2)}x, ` +
                    `時間: ${Math.floor(gameTime / 60)}秒`
            );
        }

        // ミニマイルストーン達成（100点ごと）
        if (
            Math.floor(this.score / 100) >
            Math.floor((this.score - baseScore) / 100)
        ) {
            const milestone = Math.floor(this.score / 100) * 100;
            console.log(`マイルストーン達成: ${milestone}点!`);
            // ここに達成エフェクトなどを追加できます
        }
    }
    /**
     * ゲームオーバー判定
     * @returns {boolean} ゲームオーバーの場合true
     */
    isGameOver() {
        // 条件1: 画面下限を超えた場合
        // GAME_OVER_MARGINはプレイヤーが完全に画面外に出たことを判定するために使用
        const isOffScreen = this.player.y > window.height + GAME_OVER_MARGIN;

        // 条件2: 長時間浮遊状態（フォールバック安全装置、バグ対策）
        const maxAirborneFrames = 300; // 5秒間
        const isStuckInAir =
            !this.player.grounded &&
            this.player.movementState === 'Jumping' &&
            window.frameCount - this.player.jumpStartFrame > maxAirborneFrames;

        // 条件3: 無効な位置にいる場合（バグ対策）
        const hasInvalidPosition =
            isNaN(this.player.y) || this.player.y < -1000;

        // どれか一つの条件でもtrueならゲームオーバー
        const gameOver = isOffScreen || isStuckInAir || hasInvalidPosition;

        // デバッグ出力 - 原因も表示
        if (gameOver && window.debugMode) {
            let reason = '';
            if (isOffScreen) reason = '画面外落下';
            else if (isStuckInAir) reason = '浮遊バグ';
            else if (hasInvalidPosition) reason = '無効な位置';
            console.log(
                `ゲームオーバー検出: 理由=${reason}, ` +
                    `プレイヤー位置y=${Math.floor(this.player.y)}, ` +
                    `速度=${this.player.verticalSpeed.toFixed(1)}, ` +
                    `画面高さ=${window.height}`
            );
        }
        return gameOver;
    }

    /**
     * ゲーム画面を描画する
     */ draw() {
        this.stageGenerator.draw();
        this.player.display(); // issue #4の命名規則に合わせて変更

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
            // スコア表示パネル背景（半透明）
            window.push();
            window.fill(0, 0, 0, 100);
            window.noStroke();
            window.rectMode(window.CORNER);
            window.rect(window.width - 200, 5, 190, 110, 5);
            window.pop(); // スコア表示 - 位置調整
            window.textSize(FONT_SIZE_SCORE);
            window.textAlign(window.RIGHT, window.TOP);
            window.fill(COLOR_PALETTE.SCORE);
            window.text(`スコア: ${this.score}`, window.width - 20, 50);

            // 距離表示
            window.textSize(FONT_SIZE_SCORE - 2);
            window.text(
                `距離: ${this.distanceMeters || 0}m`,
                window.width - 20,
                80
            );

            // ハイスコア表示
            window.fill(COLOR_PALETTE.HIGH_SCORE);
            window.text(`ハイスコア: ${this.highScore}`, window.width - 20, 20);
        } else if (this.state === GAME_STATE.GAME_OVER) {
            // ゲームオーバー画面の半透明背景
            window.push();
            window.fill(0, 0, 0, 180);
            window.noStroke();
            window.rectMode(window.CENTER);
            window.rect(window.width / 2, window.height / 2, 400, 250, 10);
            window.pop(); // ゲームオーバーテキスト（明るい色で表示）- 位置を上に調整
            window.fill(COLOR_PALETTE.HIGH_SCORE);
            window.text(
                'ゲームオーバー',
                window.width / 2,
                window.height / 3 + 20
            );

            // スコア表示（白色で表示）- 位置を上に調整
            window.textSize(FONT_SIZE_TEXT);
            window.fill(COLOR_PALETTE.SCORE);
            window.text(
                `スコア: ${this.score}`,
                window.width / 2,
                window.height / 2 - 10
            ); // 距離表示を追加（白色で表示）- 位置を上に調整
            window.text(
                `走行距離: ${this.distanceMeters || 0}m`,
                window.width / 2,
                window.height / 2 + 20
            );

            // ハイスコア表示（新記録かどうかで色を変える）- 位置を上に調整
            if (this.isNewHighScore) {
                window.fill(COLOR_PALETTE.HIGH_SCORE);
                window.text(
                    `ハイスコア: ${this.highScore}  新記録!`,
                    window.width / 2,
                    window.height / 2 + 50
                );
            } else {
                window.fill(COLOR_PALETTE.SCORE);
                window.text(
                    `ハイスコア: ${this.highScore}`,
                    window.width / 2,
                    window.height / 2 + 50
                );
            }

            // リトライメッセージ（白色で表示して視認性を高める）- 位置を上に調整
            window.fill(COLOR_PALETTE.SCORE);
            window.text(
                'スペースキーまたはクリックでリトライ',
                window.width / 2,
                window.height / 2 + 90
            );
        }
    }
    /**
     * キー入力処理
     */ keyPressed() {
        if (this.state === GAME_STATE.START) {
            this.startGame();
        } else if (this.state === GAME_STATE.PLAYING) {
            // スペースキーが押された場合ジャンプ（連続入力防止）
            // p5.jsの標準キーボード検出を使用
            if (window.keyCode === 32 && !this.spaceKeyPressed) {
                // 32はスペースキーのキーコード
                console.log('スペースキー検出: ジャンプ要求');
                this.spaceKeyPressed = true; // キー状態をマーク
                this.player.jump();
            }
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
            console.log('マウスクリック検出: ジャンプ要求');
            // 追加した専用のジャンプメソッドを呼び出す
            if (this.player && typeof this.player.jump === 'function') {
                this.player.jump();
            }
        } else if (this.state === GAME_STATE.GAME_OVER) {
            this.resetGame();
        }
    }
    /**
     * キーが離された時の処理
     */
    keyReleased() {
        // スペースキーが離されたらフラグをリセット
        if (window.key === ' ' || window.keyCode === 32) {
            console.log('スペースキー解放');
            this.spaceKeyPressed = false;
        }
    }

    /**
     * ゲームを開始状態にする
     */
    startGame() {
        this.state = GAME_STATE.PLAYING;
        this.score = 0;

        // ステージを先にリセット（初期足場を生成）
        this.stageGenerator.reset();

        // プレイヤーをリセット
        this.player.reset();

        // プレイヤーを強制的に最初の足場の上に配置
        if (this.stageGenerator.platforms.length > 0) {
            const platform = this.stageGenerator.platforms[0];
            this.player.y = platform.y - PLAYER_SIZE / 2; // 足場の上に配置
            console.log(
                `プレイヤーを足場の上に配置: x=${this.player.x}, y=${this.player.y}`
            );

            // プレイヤーを着地状態に設定
            this.player.grounded = true;
            this.player.velocity = 0;
        }
    }
    /**
     * ゲームをリセットする
     */
    resetGame() {
        this.state = GAME_STATE.START;
        this.score = 0;
        this.distanceMeters = 0;
        this.isNewHighScore = false;
        this.player.reset();
        this.stageGenerator.reset();

        if (window.debugMode) {
            console.log('ゲームをリセットしました');
        }
    }
}
