import {Form} from "./components/form.js";
import {Choice} from "./components/choice.js";
import {Test} from "./components/test.js";
import {Result} from "./components/result.js";
import {Check} from "./components/answers.js";
import {Auth} from "./services/auth.js";

export class Router {  //этот файл также является точкой входа в приложение
    constructor() { //нужно учесть, что мы можем попасть на любую страницу приложения, поэтому создаем переменную routes
        this.contentElement =  document.getElementById('content');
        this.stylesElement =  document.getElementById('styles');
        this.titleElement =  document.getElementById('page-title');
        this.profileElement =  document.getElementById('profile');
        this.profileFullNameElement =  document.getElementById('profile-full-name');

        this.routes = [ //массив роутов, т.е. страниц, по которым возможно перемещение
            {
                route: '#/', // тут находится сам url, по которому можно перейти. Для приложение на базе SPA вместо стандартного url
                // используется #, чтобы страница обновлялась в фоновом режиме, а не презагружалась
                title: 'Главная', //сюда ставим заголовок страницы, первый роут делаем для главной страницы
                template: 'templates/index.html', //путь до файла html, который будем подставлять в главный файл. Создаем папку templates,
                //в которой будут находиться все html шаблоны, а в главном файле остаются хедер, футер и все подключения стилей и скриптов
                styles: 'styles/index.css', //подключаем нужные стили на страницу
                load: () => { //на каждой странице работает отдельный модуль, в этой ф-ции будет создавать экземпляры классов,
                    // которые в папке components. На главной странице нет дополнительных скриптов, поэтому ф-ция пустая
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/form.css',
                load: () => { //создаем экземпляр класса для страницы с формой. IDE автоматически подключает вверху нужный файл,
                    //необходимо добавить в нем .js Далее нужно сделать ф-цию. которая будет срабатывать при открытии какой-л. страницы
                    //в момент загрузки файла, это будет происходить в файле app.js
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () => { //создаем экземпляр класса для страницы с формой. IDE автоматически подключает вверху нужный файл,
                    //необходимо добавить в нем .js Далее нужно сделать ф-цию. которая будет срабатывать при открытии какой-л. страницы
                    //в момент загрузки файла, это будет происходить в файле app.js
                    new Form('login');
                }
            },
            {
                route: '#/choice',
                title: 'Выбор теста',
                template: 'templates/choice.html',
                styles: 'styles/choice.css',
                load: () => {
                    new Choice();
                }
            },
            {
                route: '#/test',
                title: 'Тест',
                template: 'templates/test.html',
                styles: 'styles/test.css',
                load: () => {
                    new Test();
                }
            },
            {
                route: '#/result',
                title: 'Результат',
                template: 'templates/result.html',
                styles: 'styles/result.css',
                load: () => {
                    new Result();
                }
            },
            {
                route: '#/answers',
                title: 'Ответы',
                template: 'templates/answers.html',
                styles: 'styles/answers.css',
                load: () => {
                    new Check();
                }
            }
        ]
    }

    async openRoute() { //открывает конкретный Route и обрабатывает logout
        const urlRoute = window.location.hash.split('?')[0]; //проверяем что находится в url после #/ (можно в консоли вбить
        //window.location). Благодаря этой записи мы найдем тот роут, который должен быть открыт. и отделяем передаваемые параметры, т.е.
        //отбрасываем все, что после ? вместе с ? и берем только первую часть. Иначе в роут вместо #/form попадает все, что было передано в строке url
        if(urlRoute === '#/logout'){
            await  Auth.logout();
            window.location.href = '#/';
            return; //завершаем функцию, отправляем юзера на главную и там отработает код, который ниже
        }

        const newRoute = this.routes.find(item => { //создаем переменную, в которую помещаем тот Route, который будем открывать
            //в ней прходим по массиву роутов и ищем тот, который будем открывать
            return item.route === urlRoute;
        });

        if(!newRoute) { //проверка на случай, если роут не найден
            window.location.href = '#/';
            return;
        }
        //после открытия роута нужно подгрузить все нужные данные для этой страницы
        this.contentElement.innerHTML = //тут подставляем сожержимое нужного html-шаблона в блок id="content"
            await fetch(newRoute.template).then(response => response.text()); //используем у найденного роута (newRoute) св-во
        //template

        this.stylesElement.setAttribute('href', newRoute.styles); //Подключаем соответствующие стили
        this.titleElement.innerText = newRoute.title; //Пишем нужное название в заголовок

        //тут будем обрабатывать значения из хранилища с данными зарегистрированного пользователя для отображения
        // в хедере после регистрации или авторизации. Тут, т.к. этот блок в хедере, который есть на всех страницах,
        //поэтому обрабатываем в куске кода, который срабатывает на всех страницах
        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey); //проверяем, что кроме имени есть еще и токен
        if(userInfo && accessToken){
            this.profileElement.style.display = 'flex';
            this.profileFullNameElement.innerText = userInfo.fullName;
        } else {
            this.profileElement.style.display = 'none';
        }

        newRoute.load(); //запускаем ф-цию load, которая создает экземпляры нужных классов. Теперь, в момент, когда страница загружена,
        //нужно вызвать эту ф-цию openRoute в файле app.js
    }
}