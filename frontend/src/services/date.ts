export class DateFormat {

    public static formatDate(date: string): string {
        let parts: string[] = date.split('-');
        let updateFormatDate: Date = new Date(+parts[0], (+parts[1] - 1), +parts[2]);
        let year: number = updateFormatDate.getFullYear();
        let month: string = (1 + updateFormatDate.getMonth()).toString().padStart(2, '0');
        let day: string = updateFormatDate.getDate().toString().padStart(2, '0');

        return day + '.' + month + '.' + year;
    }

    public static getFormattedDate(date: string): string {
        let parts: string[] = date.split('.');
        let updateFormatDate: Date = new Date(+parts[2], (+parts[1] - 1), +parts[0]);
        let year: number = updateFormatDate.getFullYear();
        let month: string = (1 + updateFormatDate.getMonth()).toString().padStart(2, '0');
        let day: string = updateFormatDate.getDate().toString().padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

}