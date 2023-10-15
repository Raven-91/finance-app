import { Auth } from "../services/auth";
import { CustomHttp } from "../services/custom-http";
import config from "../config/config";
import { FormFieldType } from "../types/form-field.type";
import { SignupResponseType } from "../types/signup-response.type";
import { LoginResponseType } from "../types/login-response.type";
import {funcId} from "../utils/shared";

export class Form {
    readonly actionElement: HTMLElement | null = null;
    private checkPassword: boolean | null = null;
    readonly email: HTMLInputElement | null = null;
    readonly password: HTMLInputElement | null = null;
    readonly passwordRepeat: HTMLInputElement | null = null;
    readonly rememberMe: HTMLInputElement | null = null;
    readonly page: 'login' | 'signup';
    private fields: FormFieldType[] = [];

    constructor(page: 'login' | 'signup') {
        this.page = page;

        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/main';
            return;
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^([А-ЯЁ][а-яё]+\s*)+([А-ЯЁ][а-яё]+\s*)+([А-ЯЁ][а-яё]+\s*)$/,
                    valid: false,
                });
            this.fields.push(
                {
                    name: 'password-repeat',
                    id: 'password-repeat',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false,
                })
        }

        const that: Form = this;
        this.fields.forEach((item: FormFieldType) => {
            item.element = funcId(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function () {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                }
            }
        });

        this.actionElement = funcId('action');
        this.email = funcId('email') as HTMLInputElement;
        this.password = funcId('password') as HTMLInputElement;
        this.passwordRepeat = funcId('password-repeat') as HTMLInputElement;

        if (this.actionElement) {
            this.actionElement.onclick = function () {
                that.processForm();
            }
        }

        if (this.page === 'login') {
            this.rememberMe = funcId('rememberMe') as HTMLInputElement;
            if (this.rememberMe) {
                this.rememberMe.onclick = function () {
                    that.setCookie();
                }
                const body: HTMLElement | null = funcId('body');
                if (body) {
                    body.onload = function () {
                        that.getCookieData()
                    }
                }
            }
        }
    }

    private validateField(field: FormFieldType, element: HTMLInputElement): void {
        if (element.parentNode && (element.parentNode as HTMLElement).previousElementSibling) {
            if (!element.value || !element.value.match(field.regex)) {
                element.style.cssText = 'border: 3px solid #dc3545; border-left: none;';
                ((element.parentNode as HTMLElement).previousElementSibling as HTMLElement).style.cssText = 'border: 3px solid #dc3545; border-right: none;'
                field.valid = false;
            } else {
                element.removeAttribute('style');
                ((element.parentNode as HTMLElement).previousElementSibling as HTMLElement).removeAttribute('style');
                field.valid = true;
            }
        }
        this.validateForm();
    }

    private validateForm(): boolean {
        const validForm: boolean = this.fields.every(item => item.valid);

        if (this.page === 'signup') {
            this.checkPassword = (this.password as HTMLInputElement).value === (this.passwordRepeat as HTMLInputElement).value;
            if ((this.password as HTMLInputElement).parentNode && ((this.password as HTMLInputElement).parentNode as HTMLElement).previousElementSibling) {
                if (!this.checkPassword) {
                    (this.password as HTMLInputElement).style.cssText = 'border: 3px solid #dc3545; border-left: none;';
                    (((this.password as HTMLInputElement).parentNode as HTMLElement).previousElementSibling as HTMLElement).style.cssText = 'border: 3px solid #dc3545; border-right: none;';
                    (this.passwordRepeat as HTMLInputElement).style.cssText = 'border: 3px solid #dc3545; border-left: none;';
                    (((this.passwordRepeat as HTMLInputElement).parentNode as HTMLElement).previousElementSibling as HTMLElement).style.cssText = 'border: 3px solid #dc3545; border-right: none;'
                } else {
                    (this.password as HTMLInputElement).removeAttribute('style');
                    (((this.password as HTMLInputElement).parentNode as HTMLElement).previousElementSibling as HTMLElement).removeAttribute('style');
                    (this.passwordRepeat as HTMLInputElement).removeAttribute('style');
                    (((this.passwordRepeat as HTMLInputElement).parentNode as HTMLElement).previousElementSibling as HTMLElement).removeAttribute('style');
                }
            }
        }

        if (validForm) {
            if (this.page === 'signup') {
                if (this.checkPassword) {
                    (this.actionElement as HTMLElement).removeAttribute('disabled');
                }
            }
            (this.actionElement as HTMLElement).removeAttribute('disabled');
        } else {
            (this.actionElement as HTMLElement).setAttribute('disabled', 'disabled');
        }
        return validForm;
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email')?.element?.value;
            const password = this.fields.find(item => item.name === 'password')?.element?.value;

            if (this.page === 'signup') {
                try {
                    const result: SignupResponseType = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'name')?.element?.value.split(' ')[1],
                        lastName: this.fields.find(item => item.name === 'name')?.element?.value.split(' ')[0],
                        email: email,
                        password: password,
                        passwordRepeat: this.fields.find(item => item.name === 'password-repeat')?.element?.value
                    });

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (error) {
                    console.log(error);
                    return;
                }
            }
            try {
                const result: LoginResponseType = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password
                });

                if (result) {
                    if (result.error || !result.tokens || !result.user) {
                        throw new Error(result.message);
                    }

                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken)
                    Auth.setUserInfo({
                        name: result.user.name,
                        lastName: result.user.lastName,
                        userId: result.user.id,
                        userEmail: email,
                    })
                    location.href = '#/main';
                }
            } catch (error) {
                console.log(error);
                return;
            }
        }
    }

    private setCookie(): void {
        document.cookie = "user_email=" + (this.email as HTMLInputElement).value + ";path= http://localhost:9000/#/login";
        document.cookie = "user_password=" + (this.password as HTMLInputElement).value + ";path= http://localhost:9000/#/login";
    }

    private getCookieData(): void {
        (this.email as HTMLInputElement).value = this.getCookie('user_email');
        (this.password as HTMLInputElement).value = this.getCookie('user_password');

        if ((this.email as HTMLInputElement).value && (this.password as HTMLInputElement).value) {
            this.fields.find((item: FormFieldType) => {
                if (item.name === 'email') {
                    return item.valid = true;
                }
            });

            this.fields.find((item: FormFieldType) => {
                if (item.name === 'password') {
                    return item.valid = true;
                }
            });
            this.validateForm();
        }
    }

    private getCookie(cookieName: string): string {
        let name: string = cookieName + "=";
        let decodeCookie = decodeURIComponent(document.cookie);
        let ca: string[] = decodeCookie.split(";");
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}