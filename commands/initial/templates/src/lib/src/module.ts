import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [

    ],
    exports: [

    ],
    imports: [
        CommonModule
    ]
})
export class {{ moduleName }} {
    static forRoot() {
        return {
            ngModule: {{ moduleName }},
            providers: []
        };
    }
}
