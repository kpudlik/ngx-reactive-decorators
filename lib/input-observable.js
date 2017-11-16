"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var ReplaySubject_1 = require("rxjs/ReplaySubject");
function InputObservable(inputName) {
    var _this = this;
    return function (target, name) {
        var subject = new ReplaySubject_1.ReplaySubject(1);
        if (_this[name]) {
            subject.next(_this[name]);
        }
        Object.defineProperty(target, name, {
            set: function (value) {
                subject.next(value);
            },
            get: function () {
                return subject.asObservable();
            },
        });
        core_1.Input(inputName)(target, name);
    };
}
exports.InputObservable = InputObservable;
//# sourceMappingURL=input-observable.js.map