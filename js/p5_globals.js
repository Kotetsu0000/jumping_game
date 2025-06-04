// p5.jsとp5.playのグローバル関数をエクスポートするヘルパースクリプト
// このスクリプトは、ES6モジュールとグローバルp5.js関数の橋渡しをします

// p5.play関連のオブジェクトを含む全てのグローバル関数と変数をwindowに保存
// p5.play と p5.js のグローバル関数と変数は window オブジェクトにあるので直接参照可能

// p5.playのグローバルオブジェクトと関数がwindowオブジェクトに追加されていることを確認
window.onload = function () {
    console.log('p5.js と p5.play の初期化を確認しています...');
    // p5.playの主要オブジェクトが存在するか確認
    if (window.Sprite) {
        console.log('p5.play が正しく初期化されています。');
    } else {
        console.error(
            'エラー: p5.play のグローバルオブジェクトが見つかりません。'
        );
    }

    // デバッグモードの初期設定（Dキーでトグル可能）
    window.debugMode = false;
};
