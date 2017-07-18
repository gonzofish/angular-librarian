import {by, element, browser} from 'protractor';

class ExamplePo {

    welcome = element(by.className('welcome'));

    go() {
        browser.get('/');
    }
}

export const examplePo = new ExamplePo();