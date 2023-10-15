import { CustomHttp } from "../services/custom-http";
import config from "../config/config";
import { UserData } from "../services/user-data";
import { CategoriesResponseType } from "../types/categories-response.type";
import { DefaultResponseType } from "../types/default-response.type";
import { OperationsResponseType } from "../types/operations-response.type";
import { pageListType } from "../types/page-list.type";
import {funcClass, funcCreate, funcId} from "../utils/shared";

export class Category {
    private categories: CategoriesResponseType[] = [];
    readonly page: pageListType;
    readonly contentElement: HTMLElement | null;
    readonly itemPosition: HTMLCollection | null = null;

    constructor(page: pageListType.incomes | pageListType.expenses) {
        this.page = page;
        this.contentElement = funcClass('content__positions-list')[0] as HTMLElement;
        this.itemPosition = funcClass('position-item') as HTMLCollection;

        this.init();
        new UserData();
        UserData.userBalance();
    }

    private async init(): Promise<void> {
        try {
            let result: DefaultResponseType | CategoriesResponseType[] = [];
            if (this.page === pageListType.incomes) {
                result = await CustomHttp.request(config.host + '/categories/income');
            } else if (this.page === pageListType.expenses) {
                result = await CustomHttp.request(config.host + '/categories/expense');
            }

            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                this.categories = result as CategoriesResponseType[];
                this.showCategories();
                this.correctNameCategory();
                this.deleteCategory();
                this.addNewCategory();
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private showCategories() {
        this.categories.forEach((item: CategoriesResponseType) => {
            this.createCategory(item.id, item.title);
        });
    }

    private createCategory(id: number, title: string): void {
        if (this.contentElement && this.itemPosition) {
            const parentElement: HTMLElement | null = funcCreate('div');
            if (parentElement) {
                parentElement.classList.add('position-item', 'border', 'border-secondary');
                parentElement.setAttribute('data-id', String(id));

                const titleElement: HTMLElement | null = funcCreate('h2');
                if (titleElement) {
                    titleElement.classList.add('position-item__title', 'sub-title');
                    titleElement.innerText = title;
                    parentElement.appendChild(titleElement);
                }

                const buttonsElement: HTMLElement | null = funcCreate('div');
                if (buttonsElement) {
                    buttonsElement.classList.add('position-item__buttons', 'd-flex', 'align-items-center');

                    const buttonCorrectElement: HTMLElement | null = funcCreate('button');
                    if (buttonCorrectElement) {
                        buttonCorrectElement.classList.add('position-item__button', 'custom-btn', 'btn', 'btn-primary');
                        buttonCorrectElement.setAttribute('type', 'button');
                        buttonCorrectElement.textContent = 'Редактировать';
                        buttonsElement.appendChild(buttonCorrectElement);
                    }

                    const buttonDeleteElement: HTMLElement | null = funcCreate('button');
                    if (buttonDeleteElement) {
                        buttonDeleteElement.classList.add('position-item__button', 'custom-btn', 'btn', 'btn-danger');
                        buttonDeleteElement.setAttribute('type', 'button');
                        buttonDeleteElement.textContent = 'Удалить';
                        buttonsElement.appendChild(buttonDeleteElement);
                    }
                    parentElement.appendChild(buttonsElement);
                }
                this.contentElement.appendChild(parentElement);
                this.contentElement.insertBefore(this.itemPosition[this.itemPosition.length - 1], this.itemPosition[this.itemPosition.length - 2]);
            }
        }
    }

    private correctNameCategory(): void {
        if (this.itemPosition) {
            const arrayItemsCategory: Element[] = Array.from(this.itemPosition as HTMLCollection);
            const arrayButtonCorrect: Element[] = Array.from(funcClass('position-item__button btn-primary'));

            arrayButtonCorrect.forEach((button: Element, index: number) => {
                button.addEventListener("click", () => {
                    localStorage.setItem('changingTitleCategory', String(arrayItemsCategory[index].getAttribute('data-id')));
                    if (this.page === pageListType.incomes) {
                        location.href = '#/incomes-correct';
                    } else if (this.page === pageListType.expenses) {
                        location.href = '#/expenses-correct';
                    }
                })
            });
        }

    }

    private deleteCategory(): void {
        if (this.itemPosition) {
            const arrayItemsCategory: Element[] = Array.from(this.itemPosition as HTMLCollection);
            const arrayButtonDelete: Element[] = Array.from(funcClass('position-item__button btn-danger'));

            arrayButtonDelete.forEach((button: Element, index: number) => {
                button.addEventListener("click", () => {
                    this.popup(arrayItemsCategory, index);
                })
            });
        }
    }

    private popup(item: Element[], index: number): void {
        const popup: HTMLElement | null = funcId('popup');
        const popupDeleteButton: HTMLElement | null = funcId('popup-delete');
        const popupCancelButton: HTMLElement | null = funcId('popup-cancel');

        if (popup && popupDeleteButton && popupCancelButton) {
            popup.style.display = "block";
            popupDeleteButton.onclick = () => {
                let currentNumberCategory: number = Number(item[index].getAttribute('data-id'));
                this.deleteAllOperationsOfThisCategory(currentNumberCategory).then(r => {
                    this.deleteOperation(currentNumberCategory);
                    UserData.userBalance();
                });
                item[index].remove();
                popup.style.display = "none";
            }

            (popupCancelButton as HTMLElement).onclick = () => {
                popup.style.display = "none";
            }
        }
    }

    private async deleteAllOperationsOfThisCategory(index: number): Promise<void> {
        try {
            let operations: DefaultResponseType | OperationsResponseType[] = await CustomHttp.request(config.host + '/operations?period=all');
            if (operations) {
                if ((operations as DefaultResponseType).error) {
                    throw new Error((operations as DefaultResponseType).message);
                }

                let type: string;
                if (this.page === pageListType.incomes) {
                    type = 'income';
                } else if (this.page === pageListType.expenses) {
                    type = 'expense';
                }

                let sortedArrayByType: OperationsResponseType[] | undefined = (operations as OperationsResponseType[]).filter((operation: OperationsResponseType) => {
                    if (operation.type === type) {
                        return operation;
                    }
                })

                let deletedCategory: CategoriesResponseType | undefined = (this.categories as CategoriesResponseType[]).find((item: CategoriesResponseType) => {
                    if (item.id === +(index)) {
                        return item;
                    }
                })

                if (sortedArrayByType && deletedCategory) {
                    sortedArrayByType.filter(async (item: OperationsResponseType) => {
                        if (item.category === (deletedCategory as CategoriesResponseType).title) {
                            try {
                                const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + item.id, 'DELETE')
                                if (result) {
                                    if ((result as DefaultResponseType).error) {
                                        throw new Error((result as DefaultResponseType).message);
                                    }
                                }
                            } catch (error) {
                                return console.log(error);
                            }
                        }
                    })
                }
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private async deleteOperation(index: number): Promise<void> {
        try {
            let result: DefaultResponseType | undefined;
            if (this.page === pageListType.incomes) {
                result = await CustomHttp.request(config.host + '/categories/income/' + index, 'DELETE');
            } else if (this.page === pageListType.expenses) {
                result = await CustomHttp.request(config.host + '/categories/expense/' + index, 'DELETE');
            }
            if (result !== undefined) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private addNewCategory(): void {
        const buttonAddNewCategory: HTMLElement | null = funcId('new-category');
        if (buttonAddNewCategory) {
            buttonAddNewCategory.onclick = () => {
                if (this.page === pageListType.incomes) {
                    location.href = '#/incomes-create';
                } else if (this.page === pageListType.expenses) {
                    location.href = '#/expenses-create';
                }
            }
        }
    }
}