import { Component } from '@angular/core';
import { ViewChildObservable } from './view-child-observable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/zip'
import 'rxjs/add/operator/first'
import 'rxjs/add/operator/skip'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/bufferCount'
import { Subject } from 'rxjs/Subject';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, ElementRef } from '@angular/core';

@Component({
  selector: 'my-component',
  template: '<h1 #heading>{{data$ | async}}</h1>'
})
export class MyComponent {
  @ViewChildObservable('heading') public headingRef$: ElementRef
}

describe('@InputObservable', () => {
  let comp: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyComponent], // declare the test component
    });

    fixture = TestBed.createComponent(MyComponent)
    comp = fixture.componentInstance; // BannerComponent test instance
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
