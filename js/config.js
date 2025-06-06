/**
 * ゲーム設定と定数
 * ゲーム全体で使用される定数値をここで定義します
 */

// キャンバスサイズ
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// プレイヤー設定
export const PLAYER_SIZE = 30;
export const PLAYER_JUMP_FORCE = 20; // 互換性のために残しておく（新しいジャンプシステムでは使用しない）
export const GRAVITY = 0.8; // 互換性のために残しておく（新しいジャンプシステムでは使用しない）

// マリオスタイルのジャンプパラメータ
export const MARIO_JUMP_PARAMS = {
    // 初期ジャンプ速度 - 横速度に応じて選択される（より高く飛ぶために値を大きくする）
    INITIAL_SPEEDS: [-11, -14, -16, -18, -20],
    // 上昇中の加速度係数（小さくすると上昇時間が長くなる）
    VERTICAL_FORCE: [0x16, 0x14, 0x12, 0x10, 0x0e],
    // 落下中の加速度係数（必ず落下するように十分大きな値に設定）
    VERTICAL_FALL_FORCE: [0x80, 0x80, 0x70, 0x80, 0x80],
    // 初期加速度の小数部分
    INITIAL_FORCE_DECIMAL: [0x40, 0x40, 0x40, 0x40, 0x40],
    // 落下速度上限（必ず落下するように十分な値に設定）
    DOWN_SPEED_LIMIT: 8,
    // ボタン長押し効果の設定
    HOLD_JUMP_FRAMES: 15, // 長押し効果が続くフレーム数
    HOLD_JUMP_POWER_FACTOR: 0.4, // 長押し時の追加パワー係数
};

// 横方向の移動速度しきい値（ジャンプパラメータ選択用）
export const HORIZONTAL_SPEED_THRESHOLDS = [0x09, 0x10, 0x19, 0x1c];

export const INITIAL_PLAYER_X = 200;
export const INITIAL_PLAYER_Y = 300;

// プラットフォーム設定
export const PLATFORM_SPEED = 4.5; // スピードをやや落として余裕を持たせる
export const PLATFORM_MIN_WIDTH = 100; // 最小幅を増やして着地しやすくする
export const PLATFORM_MAX_WIDTH = 170; // 最大幅も増やして全体的に広く
export const PLATFORM_HEIGHT = 20;
export const PLATFORM_MIN_HEIGHT = 150;
export const PLATFORM_MAX_HEIGHT = 450;
// フレーム数単位でのプラットフォーム生成間隔
export const PLATFORM_SPAWN_INTERVAL = 70;

// ゲームオーバー判定用の設定
export const GAME_OVER_MARGIN = 100; // 画面下限からのマージン（ゲームオーバーと判定する距離）

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
    SCORE: '#FFFFFF', // スコア表示の色（白）
    HIGH_SCORE: '#FFEB3B', // ハイスコア表示の色（黄色）
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
