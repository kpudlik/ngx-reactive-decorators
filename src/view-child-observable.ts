import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Observable } from 'rxjs/Observable'
import { ViewChild } from '@angular/core'

export function ViewChildObservable<T>(refName: string) {
    return (target: object, name: string) => {
      const subject = new ReplaySubject<T>(1);
        
      Object.defineProperty(target, name, {
        set(value: T): void {
		      subject.next(value);
	      },
        get(): Observable<T> {
          return subject.asObservable()
        }
      });

      ViewChild(refName)(target, name);
    }
}