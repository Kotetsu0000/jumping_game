/**
 * ゲーム全体の設定値を定義するモジュール
 */

// ゲームの基本設定
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const FRAME_RATE = 60;

// 物理系
const GRAVITY = 0.6;
const SCROLL_SPEED = 5;

// プレイヤー設定
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 30;
const PLAYER_INITIAL_X = 200;
const PLAYER_INITIAL_Y = 300;
const PLAYER_JUMP_FORCE = 12;

// 足場設定
const PLATFORM_MIN_WIDTH = 100;
const PLATFORM_MAX_WIDTH = 300;
const PLATFORM_HEIGHT = 20;
const PLATFORM_MIN_Y = 150;
const PLATFORM_MAX_Y = 350;
const PLATFORM_INITIAL_COUNT = 5;
const PLATFORM_SPAWN_INTERVAL_MIN = 200;
const PLATFORM_SPAWN_INTERVAL_MAX = 400;

// カラーパレット
const COLOR_PALETTE = {
    BACKGROUND: '#87CEEB', // 空色
    PLAYER: '#FF5252', // 赤色
    PLATFORM: '#4CAF50', // 緑色
    TEXT: '#333333', // 濃いグレー
    UI_BG: 'rgba(0, 0, 0, 0.7)', // 半透明黒
    UI_TEXT: '#FFFFFF', // 白色
};

// ゲーム状態
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
};

// UI設定
const UI_FONT_SIZE = 24;
const UI_SMALL_FONT_SIZE = 18;
const UI_MARGIN = 20;
