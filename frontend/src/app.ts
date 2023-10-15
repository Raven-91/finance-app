import 'bootstrap';
import {Router} from "./router";
import './styles/index.scss';

class App {
    private router: Router;

    constructor() {
        this.router = new Router();

        window.addEventListener('DOMContentLoaded',  this.handleRouteChanging.bind(this));
        window.addEventListener('popstate',  this.handleRouteChanging.bind(this));
    }
    handleRouteChanging() {
        this.router.openRoute();
    }
}
(new App());