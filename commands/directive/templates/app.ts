import { Directive } from '@angular/core';

@Directive({
    selector: '[{{ selector }}]'
})
export class {{ className }} {
    constructor() {}
}
