import {Auth} from "./auth.js";

//Тут вся логика запросов на сервер

export class CustomHttp {
    static async request(url, method = "GET", body = null){

        const params = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            }
        }

        let token = localStorage.getItem(Auth.accessTokenKey);
        if(token){
            params.headers['x-access-token'] = token;
        }

        if(body){
            params.body = JSON.stringify(body);
        }

        const response = await fetch(url, params);

        //В response приходит response, который нужно преобразовать в JSON. Перед этим нужно выполнить проверку на то,
        //правильный ли статус-код от сервера. Т.е. есди 200, то запрос выполнен, если нет, то нужно вывести ошибку и обработать ее
        if(response.status < 200 || response.status >= 300){
            if(response.status === 401){ //автоматическая проверка истек токен или нет. Если да, то запросится новый и запрос на инфу от юзера повторится сам
                const result = await Auth.processUnauthorizedResponse();
                if(result){
                    return await this.request(url, method, body);
                } else {
                    return null;
                }
            }

            throw new Error(response.message); //при ошибке код прекратит выполнение пока не попадет в try/catch, поэтому ошибку нужно обработать
        }

        //если ошибки нет, код продолжит выполняться, т.ж. проверяем, что от сервера вообще что-то пришло (в основной ф-ции)
        return await response.json();
    }
}