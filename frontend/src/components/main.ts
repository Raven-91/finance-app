import { UserData } from "../services/user-data";
import { CustomHttp } from "../services/custom-http";
import config from "../config/config";
import { Chart } from 'chart.js/auto'
import { DateFormat } from "../services/date";
import AirDatepicker from 'air-datepicker';
import { OperationsResponseType } from "../types/operations-response.type";
import { DefaultResponseType } from "../types/default-response.type";
import {funcClass, funcCreate, funcId} from "../utils/shared";

export class Main {
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
                this.diagram('income', result as OperationsResponseType[]);
                this.diagram('expense', result as OperationsResponseType[]);
                this.selectPeriod();
                new AirDatepicker('#from-date' as any, {
                    autoClose: true,
                });
                new AirDatepicker('#to-date' as any, {
                    autoClose: true,
                });
            }
        } catch (error) {
            console.log(error);
            return;
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
                } else if (button.classList.contains('week-btn')) {
                    period = '?period=week';
                    this.clearDatesInputs();
                } else if (button.classList.contains('month-btn')) {
                    period = '?period=month';
                    this.clearDatesInputs();
                } else if (button.classList.contains('year-btn')) {
                    period = '?period=year';
                    this.clearDatesInputs();
                } else if (button.classList.contains('all-btn')) {
                    period = '?period=all';
                    this.clearDatesInputs();
                } else if (button.classList.contains('interval-btn')) {
                    period = '?period=interval';
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
            if (input) {
                if (!(input as HTMLInputElement).value) {
                    (input as HTMLInputElement).style.cssText = 'border: 3px solid #dc3545 !important;';
                } else {
                    input.removeAttribute('style');
                }
            }
        })
    }

    async getDataAsPerPeriod(period: string): Promise<void> {
        try {
            let result: DefaultResponseType | OperationsResponseType[];
            if (period === '?period=interval') {
                this.validateDatesForInterval();
                if (this.valueDateFrom && this.valueDateFrom.value && this.valueDateTo && this.valueDateTo.value && this.valueDateFrom.value <= this.valueDateTo.value) {
                    const formattedValueDateFrom = DateFormat.getFormattedDate(this.valueDateFrom.value);
                    const formattedValueDateTo = DateFormat.getFormattedDate(this.valueDateTo.value);
                    result = await CustomHttp.request(config.host + '/operations' + period + '&dateFrom=' + formattedValueDateFrom + '&dateTo=' + formattedValueDateTo);
                } else {
                    return;
                }
            } else {
                result = await CustomHttp.request(config.host + '/operations' + period);
            }
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                this.deletePreviousChart();
                this.createNewChart();
                this.diagram('income', result as OperationsResponseType[]);
                this.diagram('expense', result as OperationsResponseType[]);
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private diagram(type: string, result: OperationsResponseType[]): void {
        let ctx: any;
        let array: OperationsResponseType[] = [];
        let title: string | undefined;
        if (type === 'income') {
            ctx = funcId('my-incomes');
            array = result.filter(item => item.type === 'income');
            title = "Доходы";
        } else if (type === 'expense') {
            ctx = funcId('my-expenses');
            array = result.filter(item => item.type === 'expense');
            title = "Расходы";
        }

        const totals: OperationsResponseType[] = [];
        array.forEach(item => {
            const obj = totals.find(o => o.category === item.category);
            if (obj) {
                obj.amount = obj.amount + item.amount;
            } else {
                totals.push(item);
            }
        });

        const category: string[] = totals.map(item => item.category);
        const amounts: number[] = totals.map(item => item.amount);

        const legendMargin = {
            id: 'legendMargin',
            beforeInit(chart: any) {
                const fitValue = chart.legend.fit;

                chart.legend.fit = function fit() {
                    fitValue.bind(chart.legend)();
                    return this.height += 40;
                }
            }
        }

        new Chart((ctx as any), {
            type: 'pie',
            data: {
                labels: category,
                datasets: [{
                    data: amounts,
                    backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#0D6EFD', '#20C997'],
                    borderWidth: 1,
                    borderColor: '#ddd'
                }]
            },
            options: {
                // responsive: true,
                plugins: {
                    title: {
                        display: true,
                        align: 'center',
                        fullSize: false,
                        position: 'top',
                        text: title,
                        font: {
                            family: 'Roboto, sans-serif',
                            size: 28,
                            weight: '500',
                        },
                        color: '#290661',
                    },
                    legend: {
                        display: true,
                        align: 'center',
                        position: 'top',
                        labels: {
                            boxWidth: 35,
                            boxHeight: 10,
                            padding: 15,
                            font: {
                                family: 'Roboto, sans-serif',
                                size: 12,
                                weight: '500',
                            },
                            color: '#000000',
                        },
                    },
                },
            },
            plugins: [legendMargin]
        });
    }

    private deletePreviousChart(): void {
        const chartIncomes: HTMLElement | null = funcId('my-incomes');
        if (chartIncomes) {
            chartIncomes.remove();
        }
        const chartExpenses: HTMLElement | null = funcId('my-expenses');
        if (chartExpenses) {
            chartExpenses.remove();
        }
    }

    private createNewChart(): void {
        const diagram: HTMLCollection | null = funcClass('graph__diagram');
        if (diagram) {
            let newChart: HTMLElement | null;
            for (let i = 0; i < diagram.length; i++) {
                newChart = funcCreate('canvas');
                if (newChart) {
                    newChart.setAttribute('width', '437');
                    newChart.setAttribute('height', '467');
                    if (diagram[i].classList.contains('diagram-incomes')) {
                        newChart.setAttribute('id', 'my-incomes');
                        diagram[i].appendChild(newChart);
                    } else if (diagram[i].classList.contains('diagram-expenses')) {
                        newChart.setAttribute('id', 'my-expenses');
                        diagram[i].appendChild(newChart);
                    }
                }
            }
        }
    }

    private clearDatesInputs(): void {
        if (this.valueDateFrom && this.valueDateTo) {
            this.valueDateFrom.value = '';
            this.valueDateTo.value = '';
        }
    }
}