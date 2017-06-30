import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { {{ moduleName }} } from '{{ name }}';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [ AppComponent ],
    imports: [
        BrowserModule,
        {{ moduleName }}
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
