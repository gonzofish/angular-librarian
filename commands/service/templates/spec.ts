/* tslint:disable:no-unused-vars */
import { getTestBed, TestBed } from '@angular/core/testing';

import { {{ serviceName }} } from './{{ filename }}.service';

describe('{{ serviceName }}', () => {
    let service: {{ serviceName }};

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{{ serviceName }}]
        });
        service = getTestBed().get({{ serviceName }});
    });

    it('', () => {
        expect(service).toBeTruthy();
    });
});
