import {DefaultResponseType} from "../types/default-response.type";
import {CategoriesResponseType} from "../types/categories-response.type";
import {CustomHttp} from "./custom-http";
import config from "../config/config";
import {funcClass} from "../utils/shared";

export class CategoryOperation {
    public static async getCategories(type: string, categoriesForSelect: HTMLSelectElement): Promise<void> {
        try {
            const result: DefaultResponseType | CategoriesResponseType[] = await CustomHttp.request(config.host + '/categories/' + type);
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                this.deletePreviousCategories();
                const categories = result as CategoriesResponseType[];
                this.showCategories(categoriesForSelect, categories);
            }
        } catch (error) {
            return console.log(error);
        }
    }

    public static showCategories(categoriesForSelect: HTMLSelectElement, array: CategoriesResponseType[]): void {
        array.forEach(item => {
            const optionElement: HTMLOptionElement | null = document.createElement('option');
            if (optionElement) {
                optionElement.setAttribute('value', String(item.id));
                optionElement.classList.add('select-item');
                optionElement.innerText = item.title;
                categoriesForSelect.appendChild(optionElement);
            }
        });
    }

    public static deletePreviousCategories(): void {
        let selectItems: Element[] = [];
        if (funcClass('select-item')) {
            selectItems = Array.from(funcClass('select-item'));
            selectItems.forEach((item: Element) => {
                item.remove();
            })
        }
    }

    public static cancelAction(): void {
        const buttonCancel: HTMLElement | null = document.getElementById('cancel');
        if (buttonCancel) {
            buttonCancel.onclick = () => {
                location.href = '#/incomes-expenses-data';
            }
        }
    }
}