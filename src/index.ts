import { Plugin, PluginConfig, BaseApp, HandleRequest } from 'jovo-core';
import tracker from '@voxalyze/skill-sdk';

/**
 * Config interface for the Voxalyze plugin.
 */
interface Config extends PluginConfig {
  apiKey?: string;
}

/**
 * Voxalyze tracking plugin for Jovo. Sends Alexa request data to the
 * Voxalyze collector to track marketing campaign attributions.
 * This plugin currently only supports Alexa Skills. Tracking datapoints
 * are only dispatched for launch requests. All other request types and
 * platforms are ignored.
 */
export class Voxalyze implements Plugin {
  /**
   * Plugin name
   */
  name = 'Voxalyze';

  /**
   * Default plugin config
   */
  config: Config = {
    apiKey: '',
  };

  /**
   * Initializes the Voxalyze tracking SDK and attaches the plugin
   * handler function as Jovo middleware.
   *
   * @param app Jovo base app
   */
  install(app: BaseApp): void {
    tracker.config.init({
      apiKey: this.config.apiKey,
    });

    app.middleware('after.platform.init')?.use(this.track.bind(this));
  }

  /**
   * Invoked when a request occurs. Returns a promise that resolves
   * once the request has been sent to Voxalyze.
   *
   * @param handleRequest Input from Jovo
   */
  private async track(handleRequest: HandleRequest): Promise<void> {
    const type = handleRequest.jovo?.getType();
    const isLaunchRequest = handleRequest.jovo?.isLaunchRequest();

    if (type !== 'AlexaSkill' || !isLaunchRequest) return;

    const request = handleRequest.host.getRequestObject();

    // TODO: POC, interface will change in release version
    return tracker.config.dispatch(request);
  }
}
