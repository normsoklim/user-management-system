import { Directive, ElementRef, Input, Renderer2, SimpleChanges, OnChanges } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnChanges {
  @Input('appHighlight') searchText: string = '';
  @Input() highlightClass: string = 'highlight';
  @Input() caseSensitive: boolean = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchText']) {
      this.highlightText();
    }
  }

  private highlightText(): void {
    const element = this.el.nativeElement;
    const text = element.textContent || '';
    
    if (!this.searchText) {
      this.renderer.setProperty(element, 'innerHTML', text);
      return;
    }

    const regex = this.createRegex();
    const matches = text.match(regex);
    
    if (!matches) {
      this.renderer.setProperty(element, 'innerHTML', text);
      return;
    }

    const highlightedText = text.replace(regex, (match: string) => {
      return `<span class="${this.highlightClass}">${match}</span>`;
    });

    this.renderer.setProperty(element, 'innerHTML', highlightedText);
  }

  private createRegex(): RegExp {
    const flags = this.caseSensitive ? 'g' : 'gi';
    const escapedText = this.escapeRegex(this.searchText);
    return new RegExp(escapedText, flags);
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}