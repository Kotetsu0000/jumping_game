// p5.jsとp5.playのグローバル関数をエクスポートするヘルパースクリプト
// このスクリプトは、ES6モジュールとグローバルp5.js関数の橋渡しをします

// グローバルp5関数を保存するオブジェクト
window.p5Globals = {
    // p5.jsのコア関数
    createCanvas: window.createCanvas,
    background: window.background,
    fill: window.fill,
    ellipse: window.ellipse,
    rect: window.rect,
    text: window.text,
    textAlign: window.textAlign,
    textSize: window.textSize,
    random: window.random, // プロパティ（ゲッターで常に最新の値を返す）
    get width() {
        return window.width;
    },
    get height() {
        return window.height;
    },
    get frameCount() {
        return window.frameCount;
    },
    // イベント関数
    keyPressed: window.keyPressed,
    mousePressed: window.mousePressed,
    // その他必要な関数やプロパティ
    CENTER: window.CENTER,
    key: window.key,
};
