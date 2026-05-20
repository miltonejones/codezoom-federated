import { Component, input, output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ChatType } from '@code-zoom/shared-types';
import { AssetsService } from '../../services/assets.service';

export const chatTypes: ChatType[] = [
  {
    label: 'ChatGPT',
    logo: 'ChatGPT_logo.svg.png',
    key: 'gpt',
    url: 'https://platform.openai.com/docs/overview',
  },
  {
    label: 'Claude',
    logo: 'Claude_AI_symbol.svg.png',
    key: 'claude',
    url: 'https://www.claude.com/platform/api',
  },
  {
    label: 'Deepseek',
    logo: 'Deepseek-logo-icon.svg.png',
    key: 'deep',
    url: 'https://api-docs.deepseek.com/',
  },
  {
    label: 'Gemini',
    logo: 'Google-gemini-icon.svg.png',
    key: 'gemini',
    url: 'https://ai.google.dev/',
  },
];

@Component({
  selector: 'app-chattype',
  imports: [],
  templateUrl: './chattype.component.html',
  styleUrl: './chattype.component.css',
})
export class ChattypeComponent implements OnInit, OnChanges {
  chatType = input('deep');
  selectedKey = '';
  getSelectedKey = output<string>();
  chatTypes: ChatType[] = chatTypes;

  selectedType: ChatType = chatTypes[0];

  ngOnChanges(changes: SimpleChanges): void {}

  constructor(private assetSvc: AssetsService) {
    this.chatTypes = chatTypes.map((t) => ({
      ...t,
      logo: this.assetSvc.getImageUrl(t.logo),
    }));
    this.selectedType = chatTypes[0];
  }

  updateType() {
    const updatedType: ChatType | undefined = this.chatTypes.find(
      (t) => t.key === this.selectedKey
    );
    this.selectedType = updatedType!;
    this.getSelectedKey.emit(this.selectedKey);
  }

  setType(key: string) {
    this.selectedKey = key;
    this.updateType();
  }

  ngOnInit(): void {
    this.selectedKey = this.chatType();
    this.updateType();
  }
}
