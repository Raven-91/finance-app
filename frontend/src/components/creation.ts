import { CustomHttp } from "../services/custom-http";
import config from "../config/config";
import { UserData } from "../services/user-data";
import { Validation } from "../services/validation";
import { FormFieldType } from "../types/form-field.type";
import { pageListType } from "../types/page-list.type";
import { DefaultResponseType } from "../types/default-response.type";
import {funcId} from "../utils/shared";

export class Creation {
    readonly page: pageListType.incomes_create | pageListType.expenses_create;
    readonly actionElement: HTMLElement | null;
    readonly fields: FormFieldType[] = [];


    constructor(page: pageListType.incomes_create | pageListType.expenses_create) {
        this.page = page;
        this.actionElement = funcId('create');
        this.fields = [
            {
                name: 'title',
                id: 'input-title',
                element: null,
                regex: /^([А-ЯЁ][а-яё]+\s*)+([-/,.а-яА-ЯёЁ0-9\s]+)$/,
                valid: false,
            },
        ]

        const that: Creation = this;
        this.fields.forEach((item: FormFieldType) => {
            item.element = funcId(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function () {
                    Validation.validateField.call(that, item, <HTMLInputElement>this);
                    Validation.validateForm(that.fields as FormFieldType[], that.actionElement as HTMLElement);
                }
            }
        });

        if (this.actionElement) {
            (this.actionElement as HTMLElement).onclick = function () {
                that.processAction();
            }
        }

        new UserData();
        UserData.userBalance();
        this.cancelAction();
    }

    private async processAction(): Promise<void> {
        if (Validation.validateForm(this.fields as FormFieldType[], this.actionElement as HTMLElement)) {
            const titleName = this.fields.find(item => item.name === 'title')?.element?.value;
            try {
                let result: DefaultResponseType | undefined;
                if (this.page === pageListType.incomes_create) {
                    result = await CustomHttp.request(config.host + '/categories/income', 'POST', {
                        title: titleName,
                    });
                } else if (this.page === pageListType.expenses_create) {
                    result = await CustomHttp.request(config.host + '/categories/expense', 'POST', {
                        title: titleName,
                    });
                }
                if (result !== undefined) {
                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    if (this.page === pageListType.incomes_create) {
                        location.href = '#/incomes';
                    } else if (this.page === pageListType.expenses_create) {
                        location.href = '#/expenses';
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
                if (this.page === pageListType.incomes_create) {
                    location.href = '#/incomes';
                } else if (this.page === pageListType.expenses_create) {
                    location.href = '#/expenses';
                }
            }
        }
    }
}