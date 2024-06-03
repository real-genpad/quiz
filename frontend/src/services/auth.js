//тут все авторизационные вещи - сохранение токенов в хранилище и обработка ответа от сервера при запросе истекшего токена

import config from "../../config/config.js";

export class Auth {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoKey = 'userInfo';
    static userEmailKey = 'userEmail';

    static async processUnauthorizedResponse(){
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if(refreshToken){ //запрашиваем новую пару токенов. Не используем custom-http.js для запроса, чтобы случайно не зациклить процесс
            const response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if(response && response.status === 200){
                const result = await response.json();
                if(result && !result.error){
                    this.setTokens(result.accessToken, result.refreshToken);
                    return true;
                }
            }
        }
        //тут логика при возврате ответа с ошибкой. В том числе если истек сам refresh токен
        this.removeTokens();
        location.href = '#/';
        return false;
    }

    static  async logout (){ //тут удаляем токены, если юзер вышел из системы, отправляя запрос на бек
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if(refreshToken){ //запрашиваем новую пару токенов. Не используем custom-http.js для запроса, чтобы случайно не зациклить процесс
            const response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if(response && response.status === 200){
                const result = await response.json();
                if(result && !result.error){
                    Auth.removeTokens();
                    localStorage.removeItem(Auth.userInfoKey);
                    return true;
                }
            }
        }
    }

    static setTokens (accessToken, refreshToken){  //тут сохраняем токены в хранилище
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    static removeTokens (){  //тут удаляем токены из хранилища
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    static  setUserInfo(info){ //тут сохраняем в localStorage имя и фамилию зарегистрированного юзера, для отображения в хедере
        localStorage.setItem(this.userInfoKey, JSON.stringify(info)); //в localStorage могут храниться только строки, объект нет, поэтому сериализуем
    }

    static getUserInfo(){//тут получаем сохраненные для хедера данные
        const userInfo = localStorage.getItem(this.userInfoKey);
        if(userInfo){
            return JSON.parse(userInfo); //получая данные из localStorage, парсим их, превращая в объект
        }
        return  null; //если в userInfo ничего нет, то возвращаем null
    }

    static setEmail(email){
        localStorage.setItem(this.userEmailKey, JSON.stringify(email));
        console.log('это имейл - ', email);
    }

    static getEmail(){
        const userEmail = localStorage.getItem(this.userEmailKey);
        if(userEmail){
            return JSON.parse(userEmail);
        }
        return  null;
    }
}