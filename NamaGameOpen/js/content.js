let url = "https://site.live.nicovideo.jp/recent/namagame.html";
let classNameDataList = [
    {
        "data": "li.namagame-GamePlayProgram_Item",
        "gameTitle": "span.namagame-GamePlayProgram_GameTitleText",
        "url": "a.namagame-GamePlayProgram_Link",
        "icon": "img.namagame-GamePlayProgram_UserIcon"
    },
    {
        "data": "li.namagame-PlayerWantedProgram_Item",
        "gameTitle": "span.namagame-PlayerWantedProgram_GameTitleText",
        "url": "a.namagame-PlayerWantedProgram_Link",
        "icon": "img.namagame-PlayerWantedProgram_UserIcon"
    }
];

/**
 * 初期処理
 */
(async () => {
    // 動的ロード
    const src = chrome.runtime.getURL("js/setting.js");
    let module = await import(src);
    let Setting = module.Setting;
    let setting = new Setting();

    // 設定情報取得
    setting.loadStorage().then(() => {
        settingData = setting.SettingData;
        executeNicogeOpen(settingData);
    });
})();

/**
 * ニコげオープン処理
 * @param {Object} settingData - Settingクラスのインスタンス
 */
function executeNicogeOpen(settingData) {
    // 視聴者を待っている番組の表示反映
    changeDisplayWaitGame(settingData["flagDisplayWaitGame"]);

    // 開かないUserの放送に色付ける
    showUserId();

    //// ONであれば以下処理
    if (settingData["onoff"] === true) {
        // 該当するデータがあれば開く
        // プレイ中の番組
        let resultOpenNicoge1 = openNicoNameGame(settingData, classNameDataList[0], "プレイ中");
        if (resultOpenNicoge1 === true) { return; }

        // 視聴者を待っている番組
        let resultOpenNicoge2 = openNicoNameGame(settingData, classNameDataList[1], "プレイ待");
        if (resultOpenNicoge2 === true) { return; }

        // 時間がきたら再度ページを開く
        let second = Number(settingData["reloadSecond"]);
        setInterval(() => { location.href = url; }, second * 1000);
    }
}

/**
 * 視聴者待ち　または　プレイ中　のHTMLデータから必要なデータを抜き取り、条件に該当するゲームを起動する
 * @param {Object} settingData - 設定値
 * @param {Array} classNameData - 視聴者待ち、プレイ中データのクラス名
 * @param {string} status - プレイ中 or プレイ待
 * @returns {boolean} true: 該当するゲームがあり(処理中断) / false: 該当するゲームがなし(処理継続)
 */
function openNicoNameGame(settingData, classNameData, status) {
    let flagOpenNamaGame = false;

    // プレイ待ちの番組は、無視する設定の場合処理を終了する
    if (status === "プレイ待" && settingData["flagExcludeWaitGame"] === true) {
        return flagOpenNamaGame;
    }

    // 検索ワード
    let searchWordList = settingData["searchWord"].split(",").map(word => word.trim());
    // 除外UserId
    let excludeUseridList = settingData["excludeUserid"].split(",").map(userId => userId.replaceAll(" ", ""));

    // プレイ中の番組から探す
    let nodeList = document.querySelectorAll(classNameData["data"]);

    // プレイ中のゲーム検索対象数
    let targetPlayGameCount = nodeList.length;
    if (status === "プレイ中" && Number(settingData["targetGameCountInPlay"]) < targetPlayGameCount) {
        targetPlayGameCount = Number(settingData["targetGameCountInPlay"]);
    }

    for (let n = 0; n < targetPlayGameCount; n++) {
        // 開かないUserIdの場合無視する
        // URLからUserIdを取得
        let imgNode = nodeList[n].querySelector(classNameData["icon"]);
        if (imgNode !== null) {
            let src = imgNode.getAttribute("src");
            let match = src.match(/usericon\/\d+\/(\d+)\./i);
            if (match !== null) {
                // matchした場合
                let userId = match[1];

                if (excludeUseridList.includes(userId)) {
                    // 除外対象UserIdと一致するときは無視する
                    continue;
                }
            }
        }

        // タイトル取得
        let gameTitle = nodeList[n].querySelector(classNameData["gameTitle"]).textContent;

        // 検索ワードがゲームタイトルに含まれている場合開く
        for (let searchWord of searchWordList) {
            if (-1 < gameTitle.toLowerCase().indexOf(searchWord.toLowerCase())) {
                // 放送のurlを取得
                let url = nodeList[n].querySelector(classNameData["url"]).getAttribute("href");
                window.open(url, "");
                //chrome.tabs.create({ url: url });

                flagOpenNamaGame = true;
                break;
            }
        }

        if (flagOpenNamaGame === true) { break; }
    }

    return flagOpenNamaGame;
}

/**
 * 視聴者待ちゲームを非表示設定の場合、非表示とする
 * @param {boolean} flagDisplayWaitGame - true: 視聴者待ちゲーム表示 / false: 視聴者待ちゲーム非表示 
 */
function changeDisplayWaitGame(flagDisplayWaitGame) {
    if (flagDisplayWaitGame === false) {
        return;
    }

    // 視聴者を待っている番組
    let node = document.querySelector(".namagame-PlayerWantedProgram");
    node.style.display = "none";
}

/**
 * ユーザーIDを表示
 */
function showUserId() {
    let pattern = '/usericon/\d+/(\d+)\.';

    for (let classNameData of classNameDataList) {
        let nodeList = document.querySelectorAll(classNameData["data"]);
        for (let node of nodeList) {
            // URLからUserIdを取得
            let imgNode = node.querySelector(classNameData["icon"]);
            if (imgNode === null) { continue; }

            let src = imgNode.getAttribute("src");
            let match = src.match(/usericon\/\d+\/(\d+)\./i);
            if (match === null) { continue; }

            // matchした場合
            let userId = match[1];

            // UserI表示
            node.insertAdjacentHTML("beforeend", `<div class="copy_userid"><span>userId:</span><span>${userId}</span></div>`);
        }
    }
}
