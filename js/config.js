/**
 * ゲーム設定と定数
 * ゲーム全体で使用される定数値をここで定義します
 */

// キャンバスサイズ
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// プレイヤー設定
const PLAYER_SIZE = 30;
const PLAYER_JUMP_FORCE = 15;
const GRAVITY = 0.8;
const INITIAL_PLAYER_X = 200;
const INITIAL_PLAYER_Y = 300;

// プラットフォーム設定
const PLATFORM_SPEED = 3;
const PLATFORM_MIN_WIDTH = 100;
const PLATFORM_MAX_WIDTH = 200;
const PLATFORM_HEIGHT = 20;
const PLATFORM_MIN_HEIGHT = 150;
const PLATFORM_MAX_HEIGHT = 450;
// フレーム数単位でのプラットフォーム生成間隔
const PLATFORM_SPAWN_INTERVAL = 100;

// 色設定
const COLOR_PALETTE = {
    BACKGROUND: '#87CEEB', // 空色の背景
    PLAYER: '#FF5722', // オレンジ色のプレイヤー
    PLATFORM: '#4CAF50', // 緑色の足場
    TEXT: '#333333', // 黒に近いテキスト
    UI_BACKGROUND: 'rgba(255, 255, 255, 0.7)', // 半透明の白色UI背景
};

// ゲーム状態
const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
};

// フォント設定
const FONT_SIZE_SCORE = 24;
const FONT_SIZE_TITLE = 48;
const FONT_SIZE_TEXT = 18;
