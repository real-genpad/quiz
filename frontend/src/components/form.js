import {CustomHttp} from "../services/custom-http.js";
import { Auth } from "../services/auth.js";
import config from "../../config/config.js";

export class Form {

    constructor(page) {
        this.agreeElement = null
        this.processElement = null
        this.page = page;

        const accessToken = localStorage.getItem(Auth.accessTokenKey); //проверяем, что кроме имени есть еще и токен
        if(accessToken){ //проверяем, что юзер уже залогинен, тогда ему не нужно заново входить и сразу переводим к тестам
            location.href = '#/choice';
            return; //блокируем выполнение дальнейшего кода на этой странице
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,
                },
                {
                    name: 'lastName',
                    id: 'last-name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,
                });
        }

        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        });

        this.processElement = document.getElementById('process');
        this.processElement.onclick = function () {
            that.processForm();
        }

        if (this.page === 'signup') {
            this.agreeElement = document.getElementById('agree');
            this.agreeElement.onchange = function () {
                that.validateForm();
            }
        }
    }

    validateField(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.parentNode.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.parentNode.removeAttribute('style');
            field.valid = true;
        }
        this.validateForm();
    }

    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        const isValid = this.agreeElement ? this.agreeElement.checked && validForm : validForm;
        if (isValid) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }
        return isValid;
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            if(this.page === 'signup'){ //отправляем запрос на регистрацию, указываем адрес бека и объект с параметрами,
                // в котором будут метод и доп заголовки, которые нужно отправлять, чтобы это были JSON запросы.
                // Еще body в JSON формате, в котором объект с данными, который нужно передать

                try { //тут код регистрации, при авторизации он не срабатывает
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'name').element.value,
                        lastName: this.fields.find(item => item.name === 'lastName').element.value,
                        email: email,
                        password: password
                    });

                    if(result){
                        if(result.error || !result.user){
                            throw new Error(result.message);
                        }
                        Auth.setEmail({
                            email: result.user.email
                        })
                    }
                } catch (error) {
                    return console.log(error);
                }
            } //если код выше выполнен успешно, то он продолжает выполняться дальше, таким образом оба try работают для регистрации

                try { //тут код авторизации, но также он срабатывает и при регистрации. если мы не на стр signup, то сразу попадаем в этот блок
                    const result = await CustomHttp.request(config.host + '/login', 'POST', {
                        email: email,
                        password: password
                    });

                    if(result){
                        if(result.error || !result.accessToken || !result.refreshToken
                            || !result.fullName || !result.userId){
                            throw new Error(result.message);
                        }

                       Auth.setTokens(result.accessToken, result.refreshToken); //сохраняем токены из ответа
                        Auth.setUserInfo({   //сохраняем инфу для хедера
                            fullName: result.fullName,
                            userId: result.userId,
                        })

                        location.href = '#/choice';
                    }

                } catch (error) {
                    console.log(error);
                }
        }
    }
}