/**
 * フォームを管理
 */
export class Form {
    /**
    * @returns {string} エラーメッセージ
    */
    get errorMessage() {
        return this._errorMessage;
    }

    /**
     * @returns {Object} フォームの値 
     */
    get FormData() {
        return { ...this.data };
    }

    /**
     * コンストラクタ
     * @param {Object} data - 設定の値 
     */
    constructor(data = {}) {
        this.data = data;
        this._errorMessage = "";
    }

    /**
     * フォームのデータを設定
     */
    setFormData() {
        // 共通設定
        document.querySelector("#updateTime").value = this.data["reloadSecond"];
        document.querySelector("#searchWord").value = this.data["searchWord"];
        document.querySelector("#userId").value = this.data["excludeUserid"];
        document.querySelector("#toggle").checked = this.data["onoff"];

        // プレイ待ちの番組
        document.querySelector("#flagWantedNoCheck").checked = this.data["flagExcludeWaitGame"];
        document.querySelector("#flagWantedHidden").checked = this.data["flagDisplayWaitGame"];

        // プレイ中の番組
        document.querySelector("#checkLvCount").value = this.data["targetGameCountInPlay"];
    }

    /**
     * フォームからデータを取得する
     */
    getFormData() {
        // 共通設定
        this.data["reloadSecond"] = document.querySelector("#updateTime").value;
        this.data["searchWord"] = document.querySelector("#searchWord").value;
        this.data["excludeUserid"] = document.querySelector("#userId").value;
        this.data["onoff"] = document.querySelector("#toggle").checked;

        // プレイ待ちの番組
        this.data["flagExcludeWaitGame"] = document.querySelector("#flagWantedNoCheck").checked;
        this.data["flagDisplayWaitGame"] = document.querySelector("#flagWantedHidden").checked;

        // プレイ中の番組
        this.data["targetGameCountInPlay"] = document.querySelector("#checkLvCount").value;
    }

    /**
     * データをチェックする
     * @returns {boolean} true: OK / false: NG
     */
    checkData() {
        let errorList = [];

        // 自動更新時間
        if (isNaN(this.data["reloadSecond"])) {
            errorList.push("[共通設定]自動更新時間(秒)に数値が設定されていません");
        } else {
            this.data["reloadSecond"] = Number(this.data["reloadSecond"]);

            if (!Number.isInteger(this.data["reloadSecond"])) {
                errorList.push("[共通設定]自動更新時間(秒)に整数が設定されていません");
            } else if (this.data["reloadSecond"] < 10) {
                errorList.push("[共通設定]自動更新時間(秒)は10以上の整数を指定してください");
            }
        }

        // プレイ中の番組チェック数
        if (isNaN(this.data["targetGameCountInPlay"])) {
            errorList.push("[プレイ中の番組]チェック対象の番組の数に数値が設定されていません");
        } else {
            this.data["targetGameCountInPlay"] = Number(this.data["targetGameCountInPlay"]);

            if (!Number.isInteger(this.data["targetGameCountInPlay"])) {
                errorList.push("[プレイ中の番組]チェック対象の番組の数に整数が設定されていません");
            } else if (this.data["targetGameCountInPlay"] < 1) {
                errorList.push("[プレイ中の番組]チェック対象の番組の数1以上の整数を指定してください");
            }
        }

        // エラーチェック
        if (errorList.length === 0) {
            this._errorMessage = "";
            return true;
        } else {
            this._errorMessage = errorList.join("\n");
            return false;
        }
    }
}