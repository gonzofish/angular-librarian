/* ts-lint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { {{ componentName }} } from './{{ selector }}.component';

describe('{{ componentName }}', () => {
    let component: {{ componentName }};
    let fixture: ComponentFixture<{{ componentName }}>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                {{ componentName }}
            ],
        });
        TestBed.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent({{ componentName }});
        component = fixture.componentInstance;
    });

    it('should create the {{ selector }}', () => {
        expect(component).toBeTruthy();
    });
});
