import { loadRemoteModule } from '@angular-architects/native-federation';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MicroFrontend {
  async loadRemoteComponent(remoteName: string, port: number) {
    // Determine the correct URL based on environment
    let remoteEntry: string;

    // If we're on localhost, use local ports
    if (window.location.hostname === 'localhost') {
      remoteEntry = `http://localhost:${port}/remoteEntry.json`;
    } else {
      // In production, use the actual Azure URLs
      // Replace with YOUR actual Azure URLs
      const azureUrls: { [key: string]: string } = {
        'app-list':
          'https://green-sea-0deac540f-dev.eastus2.7.azurestaticapps.net/remoteEntry.json',
        'app-workspace':
          'https://yellow-water-00b488b0f-dev.eastus2.7.azurestaticapps.net/remoteEntry.json',
      };
      remoteEntry = azureUrls[remoteName];
    }

    console.log(`Loading ${remoteName} from ${remoteEntry}`);

    try {
      return await loadRemoteModule({
        exposedModule: './Component',
        remoteName,
        remoteEntry,
        fallback: "IDK man it's on you 🤷‍♀️",
      });
      // debugger;
    } catch (err) {
      console.log('Error in ' + remoteName);
      throw err;
    }
  }
}
