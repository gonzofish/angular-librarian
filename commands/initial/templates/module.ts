import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [

    ],
    exports: [

    ],
    imports: [
        BrowserModule
    ]
})
export class {{ moduleName }}Module {
    static forRoot() {
        return {
            ngModule: {{ moduleName }}Module,
            providers: []
        };
    }
}