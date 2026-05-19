import { Component, input, output, OnInit } from '@angular/core';

@Component({
  selector: 'app-langtype',
  imports: [],
  templateUrl: './langtype.component.html',
  styleUrl: './langtype.component.css',
})
export class LangtypeComponent implements OnInit {
  langType = input('python');
  selectedLang = '';
  getSelectedLang = output<string>();
  langIcons: Record<string, string> = {
    javascript: 'fa-brands fa-js',
    typescript: 'fa-brands fa-js',
    python: 'fa-brands fa-python',
    java: 'fa-brands fa-java',
    'c#': 'fa-brands fa-microsoft',
    php: 'fa-brands fa-php',
  };

  setType(key: string) {
    this.selectedLang = key;
    this.getSelectedLang.emit(key);
  }

  getLangKeys(): string[] {
    return Object.keys(this.langIcons);
  }
  ngOnInit(): void {
    this.selectedLang = this.langType();
  }
}
