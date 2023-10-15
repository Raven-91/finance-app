import { Auth } from "./services/auth";
import { Form } from './components/form';
import { Main } from './components/main';
import { Category } from "./components/category";
import { Creation } from "./components/creation";
import { Correction } from "./components/correction";
import { IncomesExpensesData } from "./components/incomes-expenses-data";
import { IncomesExpensesCorrection } from "./components/incomes-expenses-correct";
import { IncomesExpensesCreation } from "./components/incomes-expenses-create";
import { RouteType } from "./types/route.type";
import {pageListType} from "./types/page-list.type";


export class Router {
    readonly contentElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    private routes: RouteType[];

    constructor() {
        this.contentElement = document.getElementById('content');
        this.titleElement = document.getElementById('page-title');
        this.routes = [
            {
                route: '#/login',
                title: 'Вход',
                template: 'templates/login.html',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/main',
                title: 'Главная',
                template: 'templates/main.html',
                load: () => {
                    new Main();
                }
            },
            {
                route: '#/incomes',
                title: 'Доходы',
                template: 'templates/incomes.html',
                load: () => {
                    new Category(pageListType.incomes);
                }
            },
            {
                route: '#/incomes-correct',
                title: 'Редактирование категории дохода',
                template: 'templates/incomes-correct.html',
                load: () => {
                    new Correction(pageListType.incomes_correct);
                }
            },
            {
                route: '#/incomes-create',
                title: 'Создание категории дохода',
                template: 'templates/incomes-create.html',
                load: () => {
                    new Creation(pageListType.incomes_create);
                }
            },
            {
                route: '#/expenses',
                title: 'Главная',
                template: 'templates/expenses.html',
                load: () => {
                    new Category(pageListType.expenses);
                }
            },
            {
                route: '#/expenses-correct',
                title: 'Редактирование категории дохода',
                template: 'templates/expenses-correct.html',
                load: () => {
                    new Correction(pageListType.expenses_correct);
                }
            },
            {
                route: '#/expenses-create',
                title: 'Редактирование категории дохода',
                template: 'templates/expenses-create.html',
                load: () => {
                    new Creation(pageListType.expenses_create);
                }
            },
            {
                route: '#/incomes-expenses-data',
                title: 'Доходы/ расходы',
                template: 'templates/incomes-expenses-data.html',
                load: () => {
                    new IncomesExpensesData();
                }
            },
            {
                route: '#/incomes-expenses-create',
                title: 'Создание дохода/ расхода',
                template: 'templates/incomes-expenses-create.html',
                load: () => {
                    new IncomesExpensesCreation();
                }
            },
            {
                route: '#/incomes-expenses-correct',
                title: 'Создание дохода/ расхода',
                template: 'templates/incomes-expenses-correct.html',
                load: () => {
                    new IncomesExpensesCorrection();
                }
            },
        ];
    }

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            const result: boolean = await Auth.logout();
            if (result) {
                window.location.href = '#/login';
                return;
            }
        }

        const newRoute: RouteType | undefined = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }

        if (!this.contentElement || !this.titleElement) {
            if (urlRoute === '#/login') {
                return;
            } else {
                window.location.href = '#/login';
                return;
            }
        }

        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.titleElement.innerText = newRoute.title;

        newRoute.load();
    }
}