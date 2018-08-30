import { Injectable } from '@angular/core';

function _window(): any {
    return window;
}
@Injectable()
export class Mod {
    get nativeWindow(): any {
        return _window();
    }
}