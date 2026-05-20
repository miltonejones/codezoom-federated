import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChatType } from '@code-zoom/shared-types';
import { chatTypes } from '../components/chattype.component/chattype.component';

@Directive({
  selector: '[appPlaceholderImage]',
})
export class PlaceholderImage implements OnInit, OnChanges {
  @Input('appPlaceholderImage') state?: any = { chatType: 'deep' };
  @Input('hasMessages') hasMessages?: boolean = false;
  constructor(private el: ElementRef<HTMLTextAreaElement>) {}

  ngOnInit(): void {
    //  this.updatePlaceholder();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updatePlaceholder();
  }

  updatePlaceholder() {
    const updatedType: ChatType | undefined = chatTypes.find((t) => t.key === this.state.chatType);

    // alert(JSON.stringify({ updatedType, state: this.state }));
    if (!updatedType) return;

    this.el.nativeElement.placeholder = this.hasMessages
      ? `Ask ${updatedType.label} a follow-up question`
      : `Paste code or add files to chat with ${updatedType.label}`;
  }
}
