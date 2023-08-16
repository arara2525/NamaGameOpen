/**
 * 設定の値を管理
 */
export class Setting {
    /**
     * @returns {Object} 設定値
     */
    get SettingData() {
        return { ...this.data };
    }

    /**
     * コンストラクタ
     * @param {Object} data - 設定値
     */
    constructor(data = {}) {
        if (Object.keys(data).length === 0) {
            this.data = this.getDefaultData();
        } else {
            this.data = data;
        }
    }

    /**
     * デフォルトの設定値
     * @returns {Object} デフォルトの設定値
     */
    getDefaultData() {
        let data = {};

        // 共通設定
        data["reloadSecond"] = 30;     // 自動更新時間(秒)
        data["searchWord"] = "";       // 文字列を含むゲームを開く対象とする
        data["excludeUserid"] = "";    // ユーザーIDの放送は除外対象とする
        data["onoff"] = false;         // 自動オープン機能のONOFF

        // プレイ待ちの番組
        data["flagExcludeWaitGame"] = false;   // 聴者を待っているゲームがあっても開かない
        data["flagDisplayWaitGame"] = false;    // 視聴者を待っているゲームは非表示にする

        // プレイ中の番組
        data["targetGameCountInPlay"] = 3;  // 自動オープン対象のゲーム数(先頭から何ゲームまでを対象とするか)

        return data;
    }

    /**
     * ローカルストレージから設定をロードする
     * 存在しない項目はデフォルト値を設定して返す
     */
    async loadStorage() {
        let storageValue = await this.getLocalStorage("setting_data");
        if (typeof storageValue === "undefined") {
            this.data = this.getDefaultData();
        } else {
            // ローカルストレージから取得したデータを設定
            this.data = JSON.parse(storageValue);

            // デフォルト値を取得
            let defaultData = this.getDefaultData();

            // 機能拡張で増えた項目(ローカルストレージにない項目)は、デフォルト値を設定しておく
            for (let [key, value] of Object.entries(defaultData)) {
                if (!this.data.hasOwnProperty(key)) {
                    this.data[key] = value; // 存在しない場合はデフォルト値を設定しておく
                }
            }
        }
    }

    /** 
     * ローカルストレージに設定を保存する
     */
    async saveStorage() {
        let jsonStr = JSON.stringify(this.data);
        await this.setLocalStorage({ setting_data: jsonStr });
    }

    /**
     * ローカルストレージに値を設定
     * @param {Object} obj - ローカルストレージに保存する、キー名と値をセットにしたデータ
     */
    setLocalStorage(obj) {
        return new Promise((resolve) => {
            chrome.storage.local.set(obj, () => resolve());
        });
    }

    /**
     * ローカルストレージから値を取得
     * @param {string} key - キー名
     * @returns {string} 値
     */
    getLocalStorage(key = null) {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (item) => {
                key ? resolve(item[key]) : resolve(item);
            });
        });
    }
}