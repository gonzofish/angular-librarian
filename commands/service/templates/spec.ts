/* tslint:disable:no-unused-vars */
import { TestBed, inject } from '@angular/core/testing';

import { {{ serviceName }} } from './{{ filename }}.service';

describe('{{ serviceName }}', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{{ serviceName }}]
        });
    });

    it('', inject([{{ serviceName }}], (service: {{ serviceName }}) => {
        expect(service).toBeTruthy();
    }));
});