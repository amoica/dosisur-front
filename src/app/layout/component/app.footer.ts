import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Dosisur by
        <a href="https://blister.com.ar" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Blister</a>
    </div>`
})
export class AppFooter {}
