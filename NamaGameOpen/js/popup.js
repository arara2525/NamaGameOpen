import { Setting } from './setting.js';
import { Form } from './form.js';

/**
 * 初期処理
 */
(function () {
    // イベント設定
    setEvent();

    // ストレージから設定値取得(無ければデフォルト値)
    let setting = new Setting();
    setting.loadStorage().then(() => {
        // フォームに設定
        let data = setting.SettingData;
        let form = new Form(data);
        form.setFormData();
    });
})();


/**
 * イベント設定
 */
function setEvent() {
    // 保存ボタン
    document.querySelector("#updateSettings").addEventListener("click", (evt) => {
        evt.preventDefault();

        // フォームの値取得
        let form = new Form();
        form.getFormData();

        // 値チェック
        if (!form.checkData()) {
            alert(form.errorMessage);
            return;
        }

        // データ保存
        let data = form.FormData;
        let setting = new Setting(data);
        setting.saveStorage();

        // 閉じる
        closePopup();
    });

    /**
     * 生ゲームリストへのリンク
     */
    document.querySelector("#namagame_page_open").addEventListener("click", (evt) => {
        evt.preventDefault();

        chrome.tabs.create({ url: "https://site.live.nicovideo.jp/recent/namagame.html" });
    });
}

/**
 * popup.htmlを閉じる
 */
function closePopup() {
    let views = chrome.extension.getViews({ type: "popup" });

    if (0 < views.length) {
        views[0].close();
    }
}

