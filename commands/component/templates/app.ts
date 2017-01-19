import {
    Component{{ hooks }}
} from '@angular/core';

@Component({
    selector: '{{ selector }}',
    {{ styleAttribute }}: [{{ styles }}],
    {{ templateAttribute }}: {{ template }}
})
export class {{ componentName }}{{ implements }} {
    constructor() {}{{ lifecycleNg }}}
