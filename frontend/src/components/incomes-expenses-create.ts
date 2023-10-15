import {CustomHttp} from "../services/custom-http";
import config from "../config/config";
import {UserData} from "../services/user-data";
import {Validation} from "../services/validation";
import {CategoryFieldType} from "../types/category-field.type";
import {DefaultResponseType} from "../types/default-response.type";
import {CategoryOperation} from "../services/category-operation";
import {funcId} from "../utils/shared";

export class IncomesExpensesCreation {
    fields: CategoryFieldType[] = [];
    inputType: HTMLSelectElement | null = null;
    categoriesForSelect: HTMLSelectElement | null = null;
    amount: HTMLInputElement | null = null;
    date: HTMLInputElement | null = null;
    comment: HTMLInputElement | null = null;
    actionElement: HTMLElement | null;

    constructor() {
        this.fields = [
            {
                name: 'type',
                id: 'type',
                element: null,
                valid: false,
            },
            {
                name: 'category',
                id: 'category',
                element: null,
                valid: false,
            },
            {
                name: 'amount',
                id: 'amount',
                element: null,
                valid: false,
            },
            {
                name: 'date',
                id: 'date',
                element: null,
                valid: false,
            },
        ];
        const that: IncomesExpensesCreation = this;
        this.inputType = funcId('type') as HTMLSelectElement;
        this.categoriesForSelect = funcId('category') as HTMLSelectElement;
        this.amount = funcId('amount') as HTMLInputElement;
        this.date = funcId('date') as HTMLInputElement;
        this.comment = funcId('comment') as HTMLInputElement;
        this.actionElement = funcId('create');

        if (this.actionElement) {
            this.fields.forEach((item: CategoryFieldType) => {
                item.element = funcId(item.id) as HTMLInputElement;
                if (item.element) {
                    item.element.oninput = function () {
                        Validation.validateFieldCategoryPage.call(that, item, <HTMLSelectElement | HTMLInputElement>this);
                        Validation.validateForm(that.fields, (that.actionElement as HTMLElement));
                    }
                }
            });
        }

        if (this.actionElement) {
            this.actionElement.onclick = function () {
                that.processCreate();
            }
        }
        new UserData();
        UserData.userBalance();
        this.selectType();
        CategoryOperation.cancelAction();
    }

    private async processCreate(): Promise<void> {
        if (Validation.validateForm(this.fields, (this.actionElement as HTMLElement))) {
            const type = (this.inputType as HTMLSelectElement).value;
            const category = Number((this.categoriesForSelect as HTMLSelectElement).value);
            const amount = Number(this.fields.find(item => item.name === 'amount')?.element?.value);
            const date = this.fields.find(item => item.name === 'date')?.element?.value;

            if (!(this.comment as HTMLInputElement).value) {
                (this.comment as HTMLInputElement).value = ' ';
            }

            try {
                const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations', 'POST', {
                    type: type,
                    amount: amount,
                    date: date,
                    comment: (this.comment as HTMLInputElement).value,
                    category_id: category,
                });

                if (result) {
                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    location.href = '#/incomes-expenses-data';
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private selectType(): void {
        if (this.inputType) {
            this.inputType.onchange = () => {
                if ((this.inputType as HTMLSelectElement).value === 'income' || (this.inputType as HTMLSelectElement).value === 'expense') {
                    CategoryOperation.getCategories(
                        (this.inputType as HTMLSelectElement).value,
                        (this.categoriesForSelect as HTMLSelectElement)
                    );
                }
            }
        }
    }
}