"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var core_1 = require("@angular/core");
function ViewChildObservable(refName) {
    return function (target, name) {
        var subject = new ReplaySubject_1.ReplaySubject(1);
        Object.defineProperty(target, name, {
            set: function (value) {
                subject.next(value);
            },
            get: function () {
                return subject.asObservable();
            },
        });
        core_1.ViewChild(refName)(target, name);
    };
}
exports.ViewChildObservable = ViewChildObservable;
//# sourceMappingURL=view-child-observable.js.map