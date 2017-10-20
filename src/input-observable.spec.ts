import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { InputObservable } from './input-observable'

@Component({
  selector: 'my-component',
  template: '<h1>{{data$ | async}}</h1>',
})
export class MyComponent {
  @InputObservable() public data$ = 1
}

describe('@InputObservable', () => {
  let comp: MyComponent
  let fixture: ComponentFixture<MyComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyComponent], // declare the test component
    })

    fixture = TestBed.createComponent(MyComponent)
    comp = fixture.componentInstance // BannerComponent test instance
  })

  it('should change Input to Observable', () => {
    expect(comp.data$ as any instanceof Observable).toBe(true)
  })

  it('should not expose internal Subject logic', () => {
    expect(comp.data$ as any instanceof Subject).toBe(false)
  })

  it('should emit initial value if set', done => {
    (comp.data$ as any)
      .take(1)
      .subscribe(data => {
        expect(data).toBe(1)
        done()
      })
  })

  it('should emit next value when Input changes', done => {
    (comp.data$ as any)
      .bufferCount(2, 2)
      .take(1)
      .subscribe(([first, second]) => {
        expect(first).toBe(1)
        expect(second).toBe(6)
        done()
      })

    comp.data$ = 6
    fixture.detectChanges()
  })

  it('should distinct values if needed', done => {
    (comp.data$ as any)
      .distinctUntilChanged()
      .take(3)
      .bufferCount(3, 3)
      .take(1)
      .subscribe(([first, second, third]) => {
        expect(first).toBe(1)
        expect(second).toBe(9)
        expect(third).toBe(0)
        done()
      })

    // Should be ignored
    comp.data$ = 1
    fixture.detectChanges()
    // Should be ignored
    comp.data$ = 1
    fixture.detectChanges()
    // Should be ignored
    comp.data$ = 1
    fixture.detectChanges()

    comp.data$ = 9
    fixture.detectChanges()
    // Should be ignored
    comp.data$ = 9
    fixture.detectChanges()

    comp.data$ = 0
    fixture.detectChanges()
  })

})
