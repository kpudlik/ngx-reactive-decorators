import { Component, ElementRef } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { ViewChildObservable } from './view-child-observable'

@Component({
  selector: 'my-component',
  template: '<h1 #heading>{{data$ | async}}</h1>'
})
export class MyComponent {
  @ViewChildObservable('heading') public headingRef$: ElementRef
}

describe('@InputObservable', () => {
  let comp: MyComponent;
  let fixture: ComponentFixture<MyComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyComponent], // declare the test component
    });

    fixture = TestBed.createComponent(MyComponent)
    comp = fixture.componentInstance // BannerComponent test instance
  });

  it('should change Input to Observable', () => {
    expect(comp.headingRef$ as any instanceof Observable).toBe(true)
  })

  it('should not expose internal Subject logic', () => {
    expect(comp.headingRef$ as any instanceof Subject).toBe(false)
  })

  it('should emit initial value if set', done => {
    (comp.headingRef$ as any)
      .take(1)
      .subscribe(data => {
        expect(data instanceof ElementRef).toBe(true)
        done()
      })
  })
})
