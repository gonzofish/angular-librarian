import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ExampleComponent } from './example.component';
import { {{ moduleName }} } from '../index';

@NgModule({
    declarations: [
        ExampleComponent
    ],
    imports: [
        BrowserModule,
        {{ moduleName }}
    ],
    providers: [],
    bootstrap: [ExampleComponent]
})
export class ExampleModule { }
