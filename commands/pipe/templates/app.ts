import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: '{{ pipeName }}' })
export class {{ className }} implements PipeTransform {
    transform(value: any, args?: any): any {

    }
}
