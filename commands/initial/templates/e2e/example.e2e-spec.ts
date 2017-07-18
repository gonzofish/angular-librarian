import {examplePo} from './page-objects/example.po';

describe('Example Page', () => {

    beforeEach(() => examplePo.go());

    it('should welcome user to the example page', () => {
        expect(examplePo.welcome.getText()).toBe('Welcome');
    });
});