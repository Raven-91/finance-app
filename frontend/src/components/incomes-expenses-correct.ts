import { CustomHttp } from "../services/custom-http";
import config from "../config/config";
import { UserData } from "../services/user-data";
import { Validation } from "../services/validation";
import { CategoryFieldType } from "../types/category-field.type";
import { DefaultResponseType } from "../types/default-response.type";
import { OperationsResponseType } from "../types/operations-response.type";
import { CategoryOperation } from "../services/category-operation";
import {funcId} from "../utils/shared";

export class IncomesExpensesCorrection {
    fields: CategoryFieldType[] = [];
    inputType: HTMLSelectElement | null = null;
    categoriesForSelect: HTMLSelectElement | null = null;
    amount: HTMLInputElement | null = null;
    date: HTMLInputElement | null = null;
    comment: HTMLInputElement | null = null;
    actionElement: HTMLElement | null;
    id: number | null = null;

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

        this.inputType = funcId('type') as HTMLSelectElement;
        this.categoriesForSelect = funcId('category') as HTMLSelectElement;
        this.amount = funcId('amount') as HTMLInputElement;
        this.date = funcId('date') as HTMLInputElement;
        this.comment = funcId('comment') as HTMLInputElement;
        this.actionElement = funcId('correct') as HTMLElement;
        this.id = Number(localStorage.getItem('indexLine'));

        this.init();
        new UserData();
        UserData.userBalance();
    }

    private async init(): Promise<void> {
        try {
            const result: DefaultResponseType | OperationsResponseType = await CustomHttp.request(config.host + '/operations/' + this.id);
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                const categoryData = result as OperationsResponseType;
                this.getValue(categoryData);
                this.validation();
                this.correctAction();
                this.selectType();
                CategoryOperation.cancelAction();
            }
        } catch (error) {
            return console.log(error);
        }
    }

    private async getValue(result: OperationsResponseType): Promise<void> {
        if (this.inputType) {
            this.inputType.value = result.type;
            if (this.inputType.value) {
                this.fields.find(field => {
                    if (field.name === 'type') field.valid = true;
                })
            }

            if (this.inputType.value && result.category) {
                if (this.inputType.value === 'income' || this.inputType.value === 'expense') {
                    const value = result.category;

                    if (this.categoriesForSelect) {
                        await CategoryOperation.getCategories(
                            (this.inputType as HTMLSelectElement).value,
                            (this.categoriesForSelect as HTMLSelectElement)
                        );

                        for (let i = 0; i < (this.categoriesForSelect as HTMLSelectElement).length; i++) {
                            if ((this.categoriesForSelect[i] as HTMLOptionElement).text === value) {
                                (this.categoriesForSelect[i] as HTMLOptionElement).selected = true;

                                this.fields.find(field => {
                                    if (field.name === 'category') field.valid = true;
                                })
                            }
                        }
                    }
                }
            }
        }

        if (this.amount) {
            this.amount.value = String(result.amount);
            if (this.amount.value) {
                this.fields.find(field => {
                    if (field.name === 'amount') field.valid = true;
                })
            }
        }

        if (this.date) {
            this.date.value = result.date;
            if (this.date.value) {
                this.fields.find(field => {
                    if (field.name === 'date') field.valid = true;
                })
            }
        }

        if (this.comment) {
            this.comment.value = result.comment;
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

    private correctAction(): void {
        const that: IncomesExpensesCorrection = this;
        if (this.actionElement) {
            this.actionElement.onclick = () => {
                that.correctProcess();
            }
        }
    }

    private validation(): void {
        const that: IncomesExpensesCorrection = this;
        this.fields.forEach(item => {
            item.element = funcId(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.oninput = function () {
                    Validation.validateFieldCategoryPage.call(that, item, <HTMLInputElement>this);
                    Validation.validateForm(that.fields, (that.actionElement as HTMLElement));
                }
            }
        });
    }

    private async correctProcess(): Promise<void> {
        const that: IncomesExpensesCorrection = this;
        if (Validation.validateForm(that.fields, (that.actionElement as HTMLElement))) {
            const type = (this.inputType as HTMLSelectElement).value;
            const category = Number((this.categoriesForSelect as HTMLSelectElement).value);
            const amount = Number(this.fields.find(item => item.name === 'amount')?.element?.value);
            const date = this.fields.find(item => item.name === 'date')?.element?.value;

            if (!(this.comment as HTMLInputElement).value) {
                (this.comment as HTMLInputElement).value = ' ';
            }

            try {
                const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + this.id, 'PUT', {
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
                    localStorage.removeItem('indexLine');
                    location.href = '#/incomes-expenses-data';
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}