import { Input } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'

export function InputObservable<T>(inputName?: string) {
  return (target: object, name: string) => {
    const subject = new ReplaySubject<T>(1)

    if (this[name]) {
      subject.next(this[name])
    }

    Object.defineProperty(target, name, {
      set(value: T): void {
        subject.next(value)
      },
      get(): Observable<T> {
        return subject.asObservable()
      },
    })

    Input(inputName)(target, name)
  }
}
