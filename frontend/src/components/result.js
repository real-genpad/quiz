import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config.js";
import {Auth} from "../services/auth";

export class Result {
    constructor() {
        this.routeParams = UrlManager.getQueryParams();
        this.init();

        const answersButton = document.getElementById('result-button');
        answersButton.addEventListener('click', () => {
            location.href = '#/answers?id=' + this.routeParams.id;
        })
    }

    async init(){
        const userinfo = Auth.getUserInfo();
        if(!userinfo){
            location.href = '#/';
        }
        if(this.routeParams.id){
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result?userId=' + userinfo.userId);
                if (result){
                    if (result.error) {
                        throw new Error(result.error);
                    }
                     document.getElementById('result-score').innerText = result.score + '/' + result.total;
                     return; //в случае успешного ответа прекращаем выполнение кода, чтобы не перенаправить юзера на главную в конце функции
                }
            } catch (error) {
                console.log(error);
            }
        }
        location.href = '#/'; //если по каким-то причинам данные не получили, то отправляем юзера на главную
    }
}