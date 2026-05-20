import {
  Component,
  ComponentRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MicroFrontend } from './micro-frontend';
import { ChatManagerService, ConversationManagerService, FileManagerService } from './services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('app-host');

  @ViewChild('appList', { read: ViewContainerRef, static: true }) listContainer!: ViewContainerRef;
  @ViewChild('appWorkspace', { read: ViewContainerRef, static: true })
  workspaceContainer!: ViewContainerRef;
  private listComponentRef: ComponentRef<any> | null = null;
  private workspaceComponentRef: ComponentRef<any> | null = null;
  collapsed = signal<Boolean>(false);

  constructor(
    private microSvc: MicroFrontend,
    private convoSvc: ConversationManagerService,
    private fileSvc: FileManagerService,
    private chatSvc: ChatManagerService
  ) {}

  async ngOnInit() {
    window.addEventListener('paneSize', (e: Event) => {
      const customEvent = e as CustomEvent;
      this.collapsed.set(customEvent.detail.collapsed);
    });
    const listModule: any = await this.microSvc.loadRemoteComponent('app-list', 4201);
    this.listContainer.clear();
    this.listComponentRef = this.listContainer.createComponent(listModule.App);

    this.listComponentRef.instance.dynamoService = this.convoSvc;

    this.listComponentRef.changeDetectorRef.detectChanges();

    // Debug: Check what methods exist
    console.log(
      'ConversationManager methods:',
      Object.getOwnPropertyNames(Object.getPrototypeOf(this.fileSvc))
    );

    const workspaceModule: any = await this.microSvc.loadRemoteComponent('app-workspace', 4203);
    this.workspaceContainer.clear();
    this.workspaceComponentRef = this.workspaceContainer.createComponent(workspaceModule.App);

    this.workspaceComponentRef.instance.dynamoService = this.convoSvc;
    this.workspaceComponentRef.instance.fileService = this.fileSvc;
    this.workspaceComponentRef.instance.chatService = this.chatSvc;
    this.workspaceComponentRef.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.listComponentRef) {
      this.listComponentRef.destroy();
    }
  }
}
