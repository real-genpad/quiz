import {UrlManager} from "../utils/url-manager.js";
import {Auth} from "../services/auth.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";


export class Check {
    constructor() {
        this.quiz = null;
        this.testId = null;
        this.rightAnswers = null;
        this.allQuestions = null;
        this.routeParams = UrlManager.getQueryParams();
        this.testId = this.routeParams.id;

        this.init();
    }

    async init(){
        const userinfo = Auth.getUserInfo();
        if(!userinfo){
            location.href = '#/';
        }
        if(this.routeParams.id){
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + userinfo.userId);
                if (result){
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.quiz = result;
                    this.showResult();
                    console.log(result);
                    return;
                }
            } catch (error) {
                console.log(error);
            }
        }
         location.href = '#/';
    }

        showResult () {
            const userInfo = Auth.getUserInfo();
            const userEmail = Auth.getEmail();
            document.getElementById('pre-title').innerHTML = '<span>Результат прохождения теста</span> ' +
                '<img src="images/small-transparent-arrow.png" alt="Стрелка">' + this.quiz.test.name;

            document.getElementById('person-data').innerHTML = '<span>Тест выполнил</span>' + ' ' +
                userInfo.fullName + ',' + ' ' + userEmail.email;

            const backToResult = document.getElementById('back-to-result');
            const that = this;
            backToResult.onclick = function() {
                location.href = '#/result?id=' + that.routeParams.id;
            }

            this.allQuestions = document.getElementById('all-questions');

            this.showQuiz();
        }

        showQuiz (){
            this.quiz.test.questions.forEach((question, index) => {
                const questionContainer = document.createElement('div');
                questionContainer.className = 'question';

                const questionTitleElement = document.createElement('div');
                questionTitleElement.className = 'question-title';
                questionTitleElement.innerHTML = '<span>Вопрос ' + (index + 1) + ':</span> ' + question.question;

                const questionOptions = document.createElement('div');
                questionOptions.className = 'question-options';

                question.answers.forEach(answer => {
                    const answerElement = document.createElement('div');
                    answerElement.className = 'question-option';

                    const inputId = 'answer-' + answer.id;
                    const inputElement = document.createElement('input');
                    inputElement.className = 'option-answer';
                    inputElement.setAttribute('id', inputId);
                    inputElement.setAttribute('type', 'radio');
                    inputElement.setAttribute('name', 'answer');
                    inputElement.setAttribute('value', answer.id);

                    const labelElement = document.createElement('label');
                    labelElement.setAttribute('for', inputId);
                    labelElement.innerText = answer.answer;

                    if (answer.hasOwnProperty('correct')) {
                        if (answer.correct) {
                            inputElement.style.borderColor = 'green';
                        } else {
                            inputElement.style.borderColor = 'red';
                        }
                        inputElement.style.borderWidth = '5px';
                    }

                    answerElement.appendChild(inputElement);
                    answerElement.appendChild(labelElement);

                    questionOptions.appendChild(answerElement);
                })

                questionContainer.appendChild(questionTitleElement);
                questionContainer.appendChild(questionOptions);

                this.allQuestions.appendChild(questionContainer);
            })
        }
    }