import { CustomHttp } from "../services/custom-http";
import config from "../config/config";
import { UserData } from "../services/user-data";
import { Validation } from "../services/validation";
import { FormFieldType } from "../types/form-field.type";
import { DefaultResponseType } from "../types/default-response.type";
import { CategoriesResponseType } from "../types/categories-response.type";
import { pageListType } from "../types/page-list.type";
import {funcId} from "../utils/shared";

export class Correction {
    readonly input: HTMLInputElement | null;
    readonly actionElement: HTMLElement | null;
    readonly page: pageListType.incomes_correct | pageListType.expenses_correct;
    readonly fields: FormFieldType[] = [];

    constructor(page: pageListType.incomes_correct | pageListType.expenses_correct) {
        this.input = funcId('input-title') as HTMLInputElement;
        this.actionElement = funcId('correct');
        this.page = page;

        this.fields = [
            {
                name: 'title',
                id: 'input-title',
                element: null,
                regex: /^([А-ЯЁ][а-яё]+\s*)+([,.а-яА-ЯёЁ0-9\s]+)$/,
                valid: false,
            },
        ]

        this.init();
        new UserData();
        UserData.userBalance();
    }

    private async init(): Promise<void> {
        try {
            const index: number = Number(localStorage.getItem('changingTitleCategory'));
            let result: DefaultResponseType | CategoriesResponseType | undefined;
            if (this.page === pageListType.incomes_correct) {
                result = await CustomHttp.request(config.host + '/categories/income/' + index);
            } else if (this.page === pageListType.expenses_correct) {
                result = await CustomHttp.request(config.host + '/categories/expense/' + index);
            }

            if (result !== undefined) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                (this.input as HTMLInputElement).value = (result as CategoriesResponseType).title;
                this.validation();
                this.action();
                this.cancelAction();
            }
        } catch (error) {
            return console.log(error);
        }
    }

    validation() {
        const that: Correction = this;
        this.fields.forEach((item: FormFieldType) => {
            item.element = funcId(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function () {
                    Validation.validateField.call(that, item, <HTMLInputElement>this);
                    Validation.validateForm(that.fields as FormFieldType[], that.actionElement as HTMLElement);
                }
            }
        });
    }

    private action(): void {
        const that: Correction = this;
        (this.actionElement as HTMLElement).onclick = function () {
            let indexChangingTitleElement: number = Number(localStorage.getItem('changingTitleCategory'));
            if (indexChangingTitleElement) {
                that.processAction(indexChangingTitleElement);
            }
        }
    }

    private async processAction(index: number): Promise<void> {
        if (Validation.validateForm(this.fields as FormFieldType[], this.actionElement as HTMLElement)) {
            const titleName = this.fields.find(item => item.name === 'title')?.element?.value;
            try {
                let result: DefaultResponseType | undefined;
                if (this.page === pageListType.incomes_correct) {
                    result = await CustomHttp.request(config.host + '/categories/income/' + index, 'PUT', {
                        title: titleName,
                    });
                } else if (this.page === pageListType.expenses_correct) {
                    result = await CustomHttp.request(config.host + '/categories/expense/' + index, 'PUT', {
                        title: titleName,
                    });
                }
                if (result !== undefined) {
                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    if (this.page === pageListType.incomes_correct) {
                        location.href = '#/incomes';
                        localStorage.removeItem('changingTitleCategory');
                    } else if (this.page === pageListType.expenses_correct) {
                        location.href = '#/expenses';
                        localStorage.removeItem('changingTitleCategory');
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private cancelAction(): void {
        const buttonCancel: HTMLElement | null = funcId('cancel');
        if (buttonCancel) {
            buttonCancel.onclick = () => {
                localStorage.removeItem('changingTitleCategory');
                if (this.page === pageListType.incomes_correct) {
                    location.href = '#/incomes';
                } else if (this.page === pageListType.expenses_correct) {
                    location.href = '#/expenses';
                }
            }
        }
    }
}