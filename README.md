# ngx-reactive-decorators
Set of decarators for Angular to make it more delarative and reactive.

## Reasoning behind

Angular is for sure great framework (mainly because of RxJS) but on the other hand it is not as reactive as it could be so developers
are often forced to write ugly, imperative code.
With RxJS dependency and this library we can go further and make Angular more Reactive.

## Examples of poor reactivity

### Problem 1: @ViewChild

*Abstract use case:*
Every time you click the button it should take latest value of `numbers$` stream and log it to console.

```html
<button (click)="logToConsole()">Click me!</button>
```
```typescript
@Component(...)
class MyComponent {
  public numbers$ = new BehaviorSubject(1)

  public logToConsole(): void {
    this.numbers$
      .take(1)
      .subscribe(console.log)
  }
}
```

Combining streams and outputs is painful and forces you to use `take(1)` to avoid memory leaks.
So you basically subscribe, get latest value and unsubscribe, quite imperative.
We can make it much more declarative by using streams which gives us full advantage of RxJS operators

```html
<button #button>Click me!</button>
```
```typescript
@Component(...)
class MyComponent {
  @ViewChild('button') public button: ElementRef

  public numbers$ = new BehaviorSubject(1)

  public logToConsoleSub = Observable
    .fromEvent('click', this.button.nativeElement)
    .flatMap(() => this.numbers$)
    .subscribe(console.log)

  ngOnDestroy() {
    this.logToConsoleSub.ubsubscribe()
  }  
}
```

Code is much cleaner now because you can just `.flatMap` clicks to `numbers$`. But...

```
TypeError: Cannot read property 'nativeElement' of undefined
```

At the moment of subscribing `ViewChild` has not been resolved yet so you need to use lifecycle hooks

```html
<button #button>Click me!</button>
```
```typescript
@Component(...)
class MyComponent {
  @ViewChild('button') public button: ElementRef

  public numbers$ = new BehaviorSubject(1)

  public numbersFromClicks$ = Observable
    .fromEvent(this.button.nativeElement, 'click')
    .flatMap(() => this.numbers$)

  public logToConsole: Subscription;

  ngAfterViewInit() {
    this.logToConsole = this.numbersFromClicks$
      .subscribe(console.log)
  }

  ngOnDestroy() {
    this.logToConsole.unsubscribe()
  }
}
```

### Problem 2: Imperative ngOnChanges

*Abstract use case:*
If Input `a` is resolved for first time I want to log `'foo'`.
If Input `a` is not resolved for the first time I want to log `'bar'`.

Let's assume that our `console.log()` is just an external library we want to interact with. We often have situations where we want to call a method when data changes e.g. when working with D3.

```typescript
@Component(...)
class MyComponent {
  @Input() a
  @Input() b
  @Input() c
  @Input() d

  ngOnChanges(change: SimpleChanges) {
    if (change.a.previousValue !== change.a.currentValue) {
      if (change.a.isFirstChange()) {
        console.log('foo')
      } else {
        console.log('bar')
      }
    }
  }
}
```

The only way to react to Input change is `ngOnChanges`.
The problem is that it is called for any Input so you need to check
if this change was triggered by `a` with classic `if` statement.
Next you need to distinguish first change from another changes so another `if` statement... And we end up with imperative code.

There is a hacky way to react to changes of specific Input, but you loose possibility to check if it was first change. And of course getters should be pure (without any side effects) so we are doomed:

```typescript
@Component(...)
class MyComponent {
  @Input() a: number
  @Input() b: number
  @Input() c: number

  public get myA(): number {
    console.log('foo') // Hell no :(
    return this.a
  }
}
```

If you go further and do a deep dive into how `ngOnChanges` works you will notice another problem. Here is how `SimpleChange` looks like:

```typescript
class SimpleChange {
  constructor(previousValue: any, currentValue: any, firstChange: boolean)
  previousValue: any
  currentValue: any
  firstChange: boolean
  isFirstChange(): boolean
}
```

Have you noticed that `previousValue` and `currentValue` are just `any`? So you loose all advantages of static type checking and you can't make use of generic types on runtime.

## ngx-reactive-decorators solution

### Solution for Problem 1: @ViewChildObservable

```html
<button #button>Click me!</button>
```
```typescript
@Component(...)
class MyComponent {
  @ViewChildObservable('button') public button$: Observable<ElementRef>

  public numbers$ = new BehaviorSubject(1)

  public logToConsoleSub = this.button$
    .map(button => button.nativeElement)
    .flatMap(elem => Observable.fromEvent(elem, 'click'))
    .flatMap(() => this.numbers$)
    .subscribe(console.log)

  ngOnDestroy() {
    this.logToConsoleSub.ubsubscribe()
  }  
}
```

So instead of waiting for ViewChild inside lifecycle hook we just emit resolved value from stream. It gives you possibility to handle asynchronous Angular operations in reactive way.

### Solution for Problem 2: @InputObservable

```typescript
@Component(...)
class MyComponent {
  @InputObservable() a$: Observable<number>
  @InputObservable() b$: Observable<number>
  @InputObservable() c$: Observable<number>

  public logFoo = this.a$
    .take(1)
    .subscribe(() => console.log('foo'))

  public logBar = this.a$
    .skip(1)
    .distinctUntilChnged()
    .subscribe(() => console.log('bar'))  
}
```

By transforming each Input to stream of values we can use Rx operators to react to Input changes. Moreover, streams are typed as Observable<number> so you have all advantages of static type checking.
But does it have any limitations? Let's try to mimic `ngOnChanges` features:

 *Q: How to mimic currentValue and previousValue?*

 *A: Use bufferCount()*

 ```typescript
public prevAndCurrent$ = this.input$
  .bufferCount(2, 1)
  .map(([previousValue, currentValue]) => ({
    previousValue,
    currentValue,
  }))
 ```
 *Q: How to mimic isFirstChange?*

 *A: Use first(), startWith() and proper mapping if you really need to have boolean. But in general RxJS gives you operators like withLatestFrom(), concat() etc. to wait for observable*

 ```typescript
public isFirstChange$ = this.input$
  .first()
  .mapTo(true)
  .startWith(false)
 ```

 *Q: How to mimic complete SimpleChange?*

 *A: Just combine previous examples and create the instance*

 ```typescript
public simpleChange$: Observable<SimpleChange> = Observable
  .combineLatest(
    this.prevAndCurrent$,
    this.isFirstChange$,
    ({ previousValue, currentValue }, firstChange) => new SimpleChange(
      previousValue,
      currentValue,
      firstChange,
    )
  )
 ```
