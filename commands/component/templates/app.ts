import {
    Component{{ hooks }}
} from '@angular/core';

@Component({
    selector: '{{ prefix }}{{ selector }}',
    {{ styleAttribute }}: [{{ styles }}],
    {{ templateAttribute }}: {{ template }}
})
export class {{ componentName }}{{ implements }} {
    constructor() {}
{{ lifecycleNg }}}
