/**
 * ゲーム設定と定数
 * ゲーム全体で使用される定数値をここで定義します
 */

// キャンバスサイズ
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// プレイヤー設定
export const PLAYER_SIZE = 30;
export const PLAYER_JUMP_FORCE = 15;
export const GRAVITY = 0.8;
export const INITIAL_PLAYER_X = 200;
export const INITIAL_PLAYER_Y = 300;

// プラットフォーム設定
export const PLATFORM_SPEED = 3;
export const PLATFORM_MIN_WIDTH = 100;
export const PLATFORM_MAX_WIDTH = 200;
export const PLATFORM_HEIGHT = 20;
export const PLATFORM_MIN_HEIGHT = 150;
export const PLATFORM_MAX_HEIGHT = 450;
// フレーム数単位でのプラットフォーム生成間隔
export const PLATFORM_SPAWN_INTERVAL = 100;

// ゲームオーバー判定用の設定
export const GAME_OVER_MARGIN = 50; // 画面下限からのマージン（ゲームオーバーと判定する距離）

// 色設定
export const COLOR_PALETTE = {
    BACKGROUND: '#87CEEB', // 空色の背景
    PLAYER: '#FF5722', // オレンジ色のプレイヤー
    PLAYER_OUTLINE: '#8B2500', // プレイヤーの輪郭/シャドウ
    PLAYER_HIGHLIGHT: '#FFAB91', // プレイヤーのハイライト
    PLATFORM: '#4CAF50', // 緑色の足場
    PLATFORM_GRASS: '#8BC34A', // 足場の上の草
    PLATFORM_STONE: '#607D8B', // 石の足場
    PLATFORM_STONE_DETAIL: '#455A64', // 石の模様
    TEXT: '#333333', // 黒に近いテキスト
    UI_BACKGROUND: 'rgba(255, 255, 255, 0.7)', // 半透明の白色UI背景
};

// ゲーム状態
export const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
};

// フォント設定
export const FONT_SIZE_SCORE = 24;
export const FONT_SIZE_TITLE = 48;
export const FONT_SIZE_TEXT = 18;
