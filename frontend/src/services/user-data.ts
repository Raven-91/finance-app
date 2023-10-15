import config from "../config/config";
import { Auth } from "./auth";
import { CustomHttp } from "./custom-http";
import { UserInfoType } from "../types/user-info.type";
import { DefaultResponseType } from "../types/default-response.type";
import { BalanceResponseType } from "../types/balance-response.type";

export class UserData {

    constructor() {
        this.userProfile();
        this.exitProfile();
    }

    public static async userBalance(): Promise<void> {
        try {
            const result: DefaultResponseType | BalanceResponseType = await CustomHttp.request(config.host + '/balance');
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                const userBalance: HTMLElement | null = document.getElementById('balance');
                if (userBalance) {
                    userBalance.innerText = (result as BalanceResponseType).balance + '$';
                }
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private userProfile(): void {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        const userProfile: HTMLElement | null = document.getElementById('user-profile');
        if (userInfo && accessToken && userProfile) {
            userProfile.innerText = userInfo.name + ' ' + userInfo.lastName;
        }
    }

    private exitProfile(): void {
        const buttonExit: HTMLElement | null = document.getElementById('exit');
        if (buttonExit) {
            buttonExit.onclick = (e) => {
                e.preventDefault();
                Auth.removeTokens();
                localStorage.clear();
                location.href = '#/login';
            }
        }
    }


}

