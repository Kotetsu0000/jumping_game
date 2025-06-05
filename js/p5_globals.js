// p5.jsとp5.playのグローバル関数をエクスポートするヘルパースクリプト
// このスクリプトは、ES6モジュールとグローバルp5.js関数の橋渡しをします

// デバッグモードの初期設定（キーボードの「D」キーでトグル可能）
window.debugMode = false;

// キーボード入力処理のため、グローバルにアクセス可能にする
window.toggleDebugMode = function () {
    window.debugMode = !window.debugMode;
    console.log('デバッグモード: ' + (window.debugMode ? 'オン' : 'オフ'));
};

// p5とplanckのグローバル化を確認する関数
function ensureGlobals() {
    // グローバルp5オブジェクトの確認
    if (typeof p5 !== 'undefined') {
        console.log('p5.js検出: バージョン ' + p5.VERSION);
    } else {
        console.error('p5.jsが検出できません！');
        return false;
    }

    // planckのグローバル化を確認
    if (typeof planck !== 'undefined') {
        window.planck = planck;
        console.log('planck.jsをグローバル変数として設定しました');
    } else if (window.planck) {
        console.log('window.planckが既に存在します');
    } else {
        console.error('planck.jsが検出できません！');
        return false;
    }

    return true;
}

// グローバル変数の確認を実行
ensureGlobals();

// p5.play v3.xのグローバル化
// 注意: p5.play v3.xではSpriteクラスはp5.prototypeに追加されるため、
// インスタンス作成後にwindowから参照できるようにする必要がある
(function () {
    console.log('p5.js と p5.play の初期化を確認しています...');

    // p5インスタンス作成後に実行される関数
    window.p5Ready = function (p5Instance) {
        if (!p5Instance) return;

        // p5.play v3.xで利用可能なクラスをグローバルに公開
        window.Sprite = p5Instance.Sprite;
        window.Group = p5Instance.Group;
        window.World = p5Instance.World;
        window.Camera = p5Instance.Camera;

        // p5インスタンスのworld、allSpritesなどもグローバル化
        window.world = p5Instance.world;
        window.allSprites = p5Instance.allSprites;

        console.log(
            'p5.play のグローバル変数を設定しました。Sprite利用可能: ' +
                (typeof window.Sprite === 'function')
        );
    };

    // p5.jsのインスタンス化を監視し、作成されたら通知
    const originalP5 = window.p5;
    if (originalP5) {
        window.p5 = function (...args) {
            const p5Instance = new originalP5(...args);
            // p5インスタンスが作成されたら少し待ってからp5Readyを呼び出す
            setTimeout(() => {
                if (window.p5Ready) window.p5Ready(p5Instance);
            }, 100);
            return p5Instance;
        };
        window.p5.prototype = originalP5.prototype;
    }
})();
