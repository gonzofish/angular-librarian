/* ts-lint:disable:no-unused-variable */
import { TestBed, async } from '@angular/core/testing';
import { {{ componentName }} } from './{{ selector }}.component';

describe('{{ componentName }}', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                {{ componentName }}
            ],
        });
        TestBed.compileComponents();
    });

    it('should create the {{ selector }}', async(() => {
        const fixture = TestBed.createComponent({{ componentName }});
        const component = fixture.debugElement.componentInstance;

        expect(component).toBeTruthy();
    }));
});
