import { loadRemoteModule } from '@angular-architects/native-federation';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MicroFrontend {
  async loadRemoteComponent(remoteName: string, port: number) {
    try {
      return await loadRemoteModule({
        exposedModule: './Component',
        remoteName,
        remoteEntry: `http://localhost:${port}/remoteEntry.json`,
        fallback: "IDK man it's on you 🤷‍♀️",
      });
      // debugger;
    } catch (err) {
      console.log('Error in ' + remoteName);
      throw err;
    }
  }
}
