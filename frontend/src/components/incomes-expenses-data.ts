import {CustomHttp} from "../services/custom-http";
import config from "../config/config";
import {UserData} from "../services/user-data";
import {DateFormat} from "../services/date";
import AirDatepicker from 'air-datepicker';
import {OperationsResponseType} from "../types/operations-response.type";
import {DefaultResponseType} from "../types/default-response.type";
import {CategoriesResponseType} from "../types/categories-response.type";
import {funcClass, funcCreate, funcId} from "../utils/shared";

export class IncomesExpensesData {
    readonly valueDateFrom: HTMLInputElement | null = null;
    readonly valueDateTo: HTMLInputElement | null = null;
    private items: OperationsResponseType[];

    constructor() {
        this.valueDateFrom = funcId('from-date') as HTMLInputElement;
        this.valueDateTo = funcId('to-date') as HTMLInputElement;
        this.items = [];

        this.init();
        new UserData();
        UserData.userBalance();
    }

    private async init(): Promise<void> {
        try {
            const result: DefaultResponseType | OperationsResponseType[] = await CustomHttp.request(config.host + '/operations');
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                this.items = result as OperationsResponseType[];
                this.formListItems();
                this.selectPeriod();
                new AirDatepicker(('#from-date' as any), {
                    autoClose: true,
                });
                new AirDatepicker(('#to-date' as any), {
                    autoClose: true,
                });
                this.checkHavingCategoriesForButtonCreate();
                this.createItem();
                this.correctItem();
                this.deleteItem();
                localStorage.setItem('selectedPeriod', '');
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private formListItems(): void {
        this.items.forEach((item: OperationsResponseType, index: number) => {
            this.createTable(item, index);
        });
    }

    private createTable(item: OperationsResponseType, index: number): void {
        const table: HTMLElement | null = funcId('table__body');
        if (table) {
            const lineOfTable: HTMLElement | null = funcCreate('tr');
            if (lineOfTable) {
                lineOfTable.classList.add('table__range', 'table__body-range');

                const firstCell: HTMLElement | null = funcCreate('th');
                if (firstCell) {
                    firstCell.classList.add('table__tbody-cell', 'table__cell', 'table__tbody-cell-1');
                    firstCell.innerText = String(index + 1);
                    lineOfTable.appendChild(firstCell);
                }

                const secondCell: HTMLElement | null = funcCreate('th');
                if (secondCell) {
                    secondCell.classList.add('table__tbody-cell', 'table__cell', 'table__tbody-cell-2');
                    if (item.type === 'income') {
                        secondCell.classList.add('text-success');
                        secondCell.innerText = 'доход';
                    } else if (item.type === 'expense') {
                        secondCell.classList.add('text-danger');
                        secondCell.innerText = 'расход';
                    }
                    lineOfTable.appendChild(secondCell);
                }

                const thirdCell: HTMLElement | null = funcCreate('th');
                if (thirdCell) {
                    thirdCell.classList.add('table__tbody-cell', 'table__cell', 'table__tbody-cell-3');
                    thirdCell.innerText = item.category;
                    lineOfTable.appendChild(thirdCell);
                }

                const fourthCell: HTMLElement | null = funcCreate('th');
                if (fourthCell) {
                    fourthCell.classList.add('table__tbody-cell', 'table__cell', 'table__tbody-cell-4');
                    fourthCell.innerText = item.amount + '$';
                    lineOfTable.appendChild(fourthCell);
                }

                const fifthCell: HTMLElement | null = funcCreate('th');
                if (fifthCell) {
                    fifthCell.classList.add('table__tbody-cell', 'table__cell', 'table__tbody-cell-5');
                    fifthCell.innerText = DateFormat.formatDate(item.date);
                    lineOfTable.appendChild(fifthCell);
                }

                const sixthCell: HTMLElement | null = funcCreate('th');
                if (sixthCell) {
                    sixthCell.classList.add('table__tbody-cell', 'table__cell', 'table__tbody-cell-6');
                    sixthCell.innerText = item.comment;
                    lineOfTable.appendChild(sixthCell);
                }

                const seventhCell: HTMLElement | null = funcCreate('th');
                if (seventhCell) {
                    seventhCell.classList.add('table__tbody-cell', 'table__cell', 'table__tbody-cell-7');

                    let ns: string = 'http://www.w3.org/2000/svg';
                    const svgDelete: Element = document.createElementNS(ns, 'svg');
                    svgDelete.setAttribute('width', '14');
                    svgDelete.setAttribute('height', '15');
                    svgDelete.setAttribute('viewBox', '0 0 14 15');
                    svgDelete.setAttribute('fill', 'none');
                    svgDelete.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                    svgDelete.classList.add('delete-line');

                    const svgDeleteFirstPath: Element = document.createElementNS(ns, 'path');
                    svgDeleteFirstPath.setAttribute('d', 'M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z');
                    svgDeleteFirstPath.setAttribute('fill', 'black');

                    svgDelete.appendChild(svgDeleteFirstPath);

                    const svgDeleteSecondPath: Element = document.createElementNS(ns, 'path');
                    svgDeleteSecondPath.setAttribute('d', 'M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z');
                    svgDeleteSecondPath.setAttribute('fill', 'black');

                    svgDelete.appendChild(svgDeleteSecondPath);

                    const svgDeleteThirdPath: Element = document.createElementNS(ns, 'path');
                    svgDeleteThirdPath.setAttribute('d', 'M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z');
                    svgDeleteThirdPath.setAttribute('fill', 'black');

                    svgDelete.appendChild(svgDeleteThirdPath);

                    const svgDeleteFourthPath: Element = document.createElementNS(ns, 'path');
                    svgDeleteFourthPath.setAttribute('fill-rule', 'evenodd');
                    svgDeleteFourthPath.setAttribute('clip-rule', 'evenodd');
                    svgDeleteFourthPath.setAttribute('d', 'M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z');
                    svgDeleteFourthPath.setAttribute('fill', 'black');

                    svgDelete.appendChild(svgDeleteFourthPath);

                    const svgCorrect: Element = document.createElementNS(ns, 'svg');
                    svgCorrect.setAttribute('width', '16');
                    svgCorrect.setAttribute('height', '16');
                    svgCorrect.setAttribute('viewBox', '0 0 16 16');
                    svgCorrect.setAttribute('fill', 'none');
                    svgCorrect.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                    svgCorrect.classList.add('correct-line');

                    const svgCorrectPath: Element = document.createElementNS(ns, 'path');
                    svgCorrectPath.setAttribute('d', 'M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z');
                    svgCorrectPath.setAttribute('fill', 'black');

                    svgCorrect.appendChild(svgCorrectPath);

                    seventhCell.appendChild(svgDelete);
                    seventhCell.appendChild(svgCorrect);
                    lineOfTable.appendChild(seventhCell);
                }
                table.appendChild(lineOfTable)
            }
        }
    }

    private selectPeriod(): void {
        const buttonsForPeriod: Element[] = Array.from(funcClass('time-period__item'));
        buttonsForPeriod.forEach((button: Element) => {
            button.addEventListener('click', () => {

                let period: string | undefined;
                if (button.classList.contains('today-btn')) {
                    period = '';
                    this.clearDatesInputs();
                    localStorage.setItem('selectedPeriod', period);
                } else if (button.classList.contains('week-btn')) {
                    period = '?period=week';
                    this.clearDatesInputs();
                    localStorage.setItem('selectedPeriod', period);
                } else if (button.classList.contains('month-btn')) {
                    period = '?period=month';
                    this.clearDatesInputs();
                    localStorage.setItem('selectedPeriod', period);
                } else if (button.classList.contains('year-btn')) {
                    period = '?period=year';
                    this.clearDatesInputs();
                    localStorage.setItem('selectedPeriod', period);
                } else if (button.classList.contains('all-btn')) {
                    period = '?period=all';
                    this.clearDatesInputs();
                    localStorage.setItem('selectedPeriod', period);
                } else if (button.classList.contains('interval-btn')) {
                    period = '?period=interval';
                    localStorage.setItem('selectedPeriod', period);
                }
                if (period !== undefined) {
                    this.getDataAsPerPeriod(period);
                }
            })
        })
    }

    private validateDatesForInterval(): void {
        const dateInputs: Element[] = Array.from(funcClass('dates__date'));
        dateInputs.forEach((input: Element) => {
            if (!(input as HTMLInputElement).value) {
                (input as HTMLInputElement).style.cssText = 'border: 3px solid #dc3545 !important;';
            } else {
                (input as HTMLInputElement).removeAttribute('style');
            }
        })
    }

    private async getDataAsPerPeriod(period: string): Promise<void> {
        try {
            let result: DefaultResponseType | OperationsResponseType[] | undefined;
            if (period === '?period=interval') {
                this.validateDatesForInterval();
                const valueDateFrom = (this.valueDateFrom as HTMLInputElement).value;
                const valueDateTo = (this.valueDateTo as HTMLInputElement).value;

                if (valueDateFrom <= valueDateTo) {
                    const formattedValueDateFrom: string = DateFormat.getFormattedDate(valueDateFrom);
                    const formattedValueDateTo: string = DateFormat.getFormattedDate(valueDateTo);
                    result = await CustomHttp.request(config.host + '/operations' + period + '&dateFrom=' + formattedValueDateFrom + '&dateTo=' + formattedValueDateTo);
                }
            } else {
                result = await CustomHttp.request(config.host + '/operations' + period);
            }
            if (result !== undefined) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                this.deletePreviousItems('table__body-range');
                this.items = result as OperationsResponseType[];
                this.formListItems();
                this.createItem();
                this.correctItem();
                this.deleteItem();
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private deletePreviousItems(selector: string): void {
        let array: Array<Element> = [];
        if (funcClass(selector)) {
            array = Array.from(funcClass(selector));
            array.forEach((item: Element) => {
                item.remove();
            })
        }
    }

    //////////////////////////////////////////////////////////////// добавил функционал для кнопок
    private async checkHavingCategoriesForButtonCreate(): Promise<void> {
        const buttonsCreate: Element[] = Array.from(funcClass('btn-create'));

        for (const item of buttonsCreate) {
            let type: string | undefined;
            if (item.classList.contains('btn-create-income')) {
                type = 'income';
            }

            if (item.classList.contains('btn-create-expense')) {
                type = 'expense';
            }

            if (type) {
                const result = this.requestForData(type);
                if (await result) {
                    item.removeAttribute('disabled');
                } else {
                    item.getAttribute('disabled');
                }
            }
        }
    }

    private async requestForData(type: string): Promise<boolean> {
        try {
            const result: DefaultResponseType | CategoriesResponseType[] = await CustomHttp.request(config.host + '/categories/' + type);
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                if ((result as CategoriesResponseType[]).length > 0) {
                    return true;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return false;
    }
    ////////////////////////////////////////////////////////////////

    private createItem(): void {
        const buttonCreateIncome: HTMLElement | null = funcId('create-income');
        const buttonCreateExpense: HTMLElement | null = funcId('create-expense');

        if (buttonCreateIncome) {
            buttonCreateIncome.onclick = () => {
                location.href = '#/incomes-expenses-create';
            }
        }

        if (buttonCreateExpense) {
            buttonCreateExpense.onclick = () => {
                location.href = '#/incomes-expenses-create';
            }
        }
    }

    private correctItem(): void {
        const arrayIconsCorrect: Element[] = Array.from(funcClass('correct-line'));

        arrayIconsCorrect.forEach((button: Element, index: number) => {
            button.addEventListener("click", () => {
                localStorage.setItem('indexLine', String(this.items[index].id));
                location.href = '#/incomes-expenses-correct';
            })
        })
    }

    private deleteItem(): void {
        const that: IncomesExpensesData = this;
        const arrayIconsDelete: Element[] = Array.from(funcClass('delete-line'));

        arrayIconsDelete.forEach((button: Element, index: number) => {
            button.addEventListener("click", () => {
                this.popup(index, that.items);
            })
        })
    }

    private popup(index: number, items: OperationsResponseType[]): void {
        const popup: HTMLElement | null = funcId('popup');
        const popupDeleteButton: HTMLElement | null = funcId('popup-delete');
        const popupCancelButton: HTMLElement | null = funcId('popup-cancel');

        if (popup) {
            popup.style.display = "block";
            if (popupDeleteButton) {
                popupDeleteButton.onclick = async () => {
                    await this.deleteOperation(items, index);
                    const selectedPeriod: string | null = localStorage.getItem('selectedPeriod');
                    // if (selectedPeriod) {
                    //     await this.getDataAsPerPeriod(selectedPeriod);
                    // } // Если применить проверку через if, то перестает работать. В чем здесь проблема?
                    await this.getDataAsPerPeriod(selectedPeriod as string); // Если использую данную запись. Работает нормально
                    await UserData.userBalance();
                    popup.style.display = "none";
                }
            }
            if (popupCancelButton) {
                popupCancelButton.onclick = () => {
                    popup.style.display = "none";
                }
            }
        }
    }

    private async deleteOperation(items: OperationsResponseType[], index: number): Promise<void> {
        try {
            const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + String(items[index].id), 'DELETE')
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private clearDatesInputs(): void {
        if (this.valueDateFrom && this.valueDateTo) {
            this.valueDateFrom.value = '';
            this.valueDateTo.value = '';
        }
    }
}