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
    PLATFORM_SPEED,
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
     */ update() {
        if (this.state === GAME_STATE.PLAYING) {
            // ゲームの進行度に基づく難易度調整をステージジェネレータに伝達
            const progressFactor = Math.min(1.0, this.score / 10000);
            const timeBasedDifficulty = Math.min(1.0, window.frameCount / 3600); // 60秒で最大難易度
            const currentDifficulty = Math.max(
                progressFactor,
                timeBasedDifficulty
            );

            // ステージジェネレータに難易度情報を設定
            // StageGeneratorクラスのdifficultyFactorを直接更新
            this.stageGenerator.difficultyFactor =
                this.stageGenerator.difficultyFactor * 0.95 +
                currentDifficulty * 0.05;

            // プラットフォームの速度を難易度に応じて調整
            const baseSpeed = PLATFORM_SPEED;
            const maxSpeedIncrease = 1.5; // 最大で1.5倍まで速くなる
            const currentSpeedFactor =
                1.0 + this.stageGenerator.difficultyFactor * maxSpeedIncrease;

            // すべてのプラットフォームの速度を更新
            for (let i = 0; i < this.stageGenerator.platforms.length; i++) {
                const platform = this.stageGenerator.platforms[i];
                platform.speed = baseSpeed * currentSpeedFactor;
            }

            this.stageGenerator.update(); // スペースキー押下状態をリアルタイムで検出（持続的ジャンプ効果のため）
            const spaceIsPressed =
                window.keyIsDown(32) || window.mouseIsPressed; // 32はスペースキーのキーコード

            // キーが押されたばかりの状態を検出（新たなジャンプ開始のため）
            if (spaceIsPressed && !this.spaceKeyPressed) {
                console.log('入力検出：ジャンプ開始');
                this.player.jump();
                this.spaceKeyPressed = true;
            }
            // キーが離された状態を検出
            else if (!spaceIsPressed && this.spaceKeyPressed) {
                console.log('入力解除');
                this.spaceKeyPressed = false;
            }

            // プレイヤー更新（入力状態も渡す）
            this.player.update(this.stageGenerator.platforms, spaceIsPressed);

            // ゲームオーバー判定
            if (this.isGameOver()) {
                this.state = GAME_STATE.GAME_OVER;
                console.log('ゲームオーバー: ' + this.player.y);

                // ハイスコア更新チェック
                this.isNewHighScore = false;
                if (this.score > this.highScore) {
                    this.isNewHighScore = true;
                    this.highScore = this.score;
                    this.saveHighScore(this.highScore);
                    console.log('新しいハイスコア: ' + this.highScore);
                }
            } else {
                // 進行距離と難易度に基づいてスコアを更新
                this.updateScore();
            }
        }
    }

    /**
     * スコアを更新する
     * 進行距離と難易度に基づいてスコアを計算
     */
    updateScore() {
        // 基本スコアは難易度係数に基づく
        const difficultyBonus = Math.ceil(this.stageGenerator.difficultyFactor);

        // 進行距離に基づいたボーナス（足場の速度に応じて進んだ距離として計算）
        const distanceBonus = Math.floor(this.stageGenerator.gameTime / 60); // 1秒あたり1ポイント

        // 実際の距離メートルを計算（表示用）
        this.distanceMeters = Math.floor(
            (this.stageGenerator.gameTime *
                this.stageGenerator.difficultyFactor) /
                12
        );

        // 合計スコアを更新
        const addedScore = difficultyBonus;
        this.score += addedScore;

        // 一定間隔でスコアデバッグ情報を表示
        if (window.debugMode && this.stageGenerator.gameTime % 60 === 0) {
            console.log(
                `スコア更新: ${this.score}, 距離: ${
                    this.distanceMeters
                }m, 難易度: ${this.stageGenerator.difficultyFactor.toFixed(2)}`
            );
        }
    }
    /**
     * ゲームオーバー判定
     * @returns {boolean} ゲームオーバーの場合true
     */
    isGameOver() {
        // p5.jsではCANVAS_HEIGHTで定義された画面高さを基準に判定
        // 画面下限を超えた場合、ゲームオーバー
        // GAME_OVER_MARGINはプレイヤーが完全に画面外に出たことを判定するために使用します
        const isOffScreen = this.player.y > window.height + GAME_OVER_MARGIN;

        // デバッグ出力
        if (isOffScreen) {
            console.log(
                `ゲームオーバー検出: プレイヤー位置y=${this.player.y}, 画面高さ: ${window.height}`
            );
        }

        return isOffScreen;
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
