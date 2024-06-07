import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCountUp]'
})
export class CountUpDirective implements OnChanges {
  @Input('appCountUp') endVal!: number;
  @Input() duration: number = 2000;
  @Input() speed: number = 200; // New input for controlling the speed

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['endVal']) {
      this.countUp(this.endVal, this.duration, this.speed);
    }
  }

  private countUp(end: number, duration: number, speed: number) {
    const start = -1;
    const range = end - start;
    const stepTime = Math.abs(Math.floor(duration / (range * speed)));
    let current = start;

    const timer = setInterval(() => {
      current += 1;
      this.el.nativeElement.innerText = current;
      if (current >= end) {
        clearInterval(timer);
      }
    }, stepTime);
  }
}
