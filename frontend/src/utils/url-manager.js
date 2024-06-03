export class UrlManager {
    //т.к. теперь строим урлы по-дугому, location.search работать не будет, поэтому создадим ф-цию getQueryParams, которая
    //будет получать параметры из урла
    static getQueryParams() { //в этой ф-ции будем брать параметры из урла
        const qs = document.location.hash.split('+').join(' ');

        let params = {},
            tokens,
            re = /[?&]([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }
        return params;
    }
}