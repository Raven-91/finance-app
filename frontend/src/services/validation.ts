import {FormFieldType} from "../types/form-field.type";
import {CategoryFieldType} from "../types/category-field.type";

export class Validation {

    public static validateField(field: FormFieldType, element: HTMLInputElement): void {
        if (!element.value || !element.value.match(field.regex)) {
            element.style.cssText = 'border: 3px solid #dc3545 !important;';
            field.valid = false;
        } else {
            element.removeAttribute('style');
            field.valid = true;
        }
    }

    // public static validateForm(fields: FormFieldType[], actionElement: HTMLElement): boolean {
    public static validateForm(fields: Array<any>, actionElement: HTMLElement): boolean {
        const validForm: boolean = fields.every(item => item.valid);
        if (actionElement) {
            if (validForm) {
                actionElement.removeAttribute('disabled');
            } else {
                actionElement.setAttribute('disabled', 'disabled');
            }
        }
        return validForm;
    }

    public static validateFieldCategoryPage (field: CategoryFieldType, element: HTMLSelectElement | HTMLInputElement): void {
        if (element.name === 'type') {
            if (!(element as HTMLSelectElement).value || (element as HTMLSelectElement).selectedIndex === 0) {
                element.style.cssText = 'border: 3px solid #dc3545 !important;';
                field.valid = false;
            } else {
                element.removeAttribute('style');
                field.valid = true;
            }
        }

        if (element.name === 'category') {
            if (!(element as HTMLSelectElement).value || (element as HTMLSelectElement).selectedIndex === 0) {
                element.style.cssText = 'border: 3px solid #dc3545 !important;';
                field.valid = false;
            } else {
                element.removeAttribute('style');
                field.valid = true;
            }
        }

        if (element.name === 'amount') {
            if (!(element as HTMLInputElement).value || !(element as HTMLInputElement).value.match(/^[0-9.,]*$/)) {
                element.style.cssText = 'border: 3px solid #dc3545 !important;';
                field.valid = false;
            } else {
                element.removeAttribute('style');
                field.valid = true;
            }
        }

        if (element.name === 'date') {
            if (!(element as HTMLInputElement).value) {
                element.style.cssText = 'border: 3px solid #dc3545 !important;';
                field.valid = false;
            } else {
                element.removeAttribute('style');
                field.valid = true;
            }
        }
    }



}