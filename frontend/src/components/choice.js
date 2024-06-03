import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Choice {

    constructor() { //ф-ция init выступала раньше как конструктор, конструктор запускается автоматически при создании экземпляра класса
        this.quizzes = []; //переносим внутрь конструктора массив для сохранения данных от сервера
        this.testResult = null;
        this.routeParams = UrlManager.getQueryParams(); //сюда установятся параметры из урла
        this.init();
    }

    async init(){
            try { //делаем запрос на бек, чтобы получить тесты. Если у юзера уже есть результаты теста,
                // то выполнится и этот запрос и следующий. Если нет, то только этот
                const result = await CustomHttp.request(config.host + '/tests');

                if(result){
                    if(result.error){
                        throw new Error(result.error);
                    }
                    this.quizzes = result;
                }
            } catch (error) {
                return console.log(error); //в обоих catch блокируем дальнейший код в случае ошибки, чтобы
                // следующая ф-ция processQuizzes не запускалась
            }

            //далее делаем запрос на результаты всех пройденных текущим пользователем тестов, чтобы показать их в форме выбора
        const userInfo = Auth.getUserInfo();
        if(userInfo){
            try {
                const result = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);

                if(result){
                    if(result.error){
                        throw new Error(result.error);
                    }
                    this.testResult = result;
                }
            } catch (error) {
                return console.log(error);
            }
        }
        this.processQuizzes();
    }

    processQuizzes() {
        const choiceOptionsElement = document.getElementById('choice-options');
        if (this.quizzes && this.quizzes.length > 0) {
            this.quizzes.forEach(quiz => {
                const that = this;
                const choiceOptionElement = document.createElement('div');
                choiceOptionElement.className = 'choice-option';
                choiceOptionElement.setAttribute('data-id', quiz.id);
                choiceOptionElement.onclick = function () {
                    that.chooseQuiz(this);
                }

                const choiceOptionTextElement = document.createElement('div');
                choiceOptionTextElement.className = 'choice-option-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement = document.createElement('div');
                choiceOptionArrowElement.className = 'choice-option-arrow';

                const result = this.testResult.find(item => item.testId === quiz.id);
                if(result){
                    const choiceOptionResultElement = document.createElement('div');
                    choiceOptionResultElement.className = 'choice-option-result';
                    choiceOptionResultElement.innerHTML = '<div>Результат</div><div>' + result.score + '/' + result.total + '</div>';
                    choiceOptionElement.appendChild(choiceOptionResultElement);
                }

                const choiceOptionImageElement = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', 'images/arrow.png');
                choiceOptionImageElement.setAttribute('alt', 'Стрелка');

                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptionsElement.appendChild(choiceOptionElement);
            })
        }
    }

    chooseQuiz(element) {
        const dataId = element.getAttribute('data-id');
        if (dataId) {
            location.href = '#/test?id=' + dataId; //передаем только id теста, т.к. все остальные данные храняятся в хранилище
        }
    }
}







