import { Component, output } from '@angular/core';

interface Question {
  html: string;
  text: string;
}

@Component({
  selector: 'app-quick-prompts',
  imports: [],
  templateUrl: './quick-prompts.component.html',
  styleUrl: './quick-prompts.component.css',
})
export class QuickPromptsComponent {
  messageSet = output<string>();
  questions: Question[] = [
    {
      html: 'Create a <b>Storybook</b> story for this.',
      text: 'Create a Storybook story for this.',
    },
    { html: 'Suggest any improvements', text: 'Suggest any improvements' },
    { html: 'Create <b>Jest</b> tests', text: 'Create Jest tests' },
    { html: 'Create <b>Cypress</b> tests', text: 'Create Cypress tests' },
    {
      html: 'Make this code more <b>SOLID</b>',
      text: 'Make this code more SOLID',
    },
    { html: 'Add inline/JSDoc comments.', text: 'Add inline/JSDoc comments.' },
  ];

  setMessage(msg: string) {
    this.messageSet.emit(msg);
  }
}
