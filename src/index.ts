import { Plugin, PluginConfig, BaseApp, HandleRequest, Log } from 'jovo-core';
import tracker from '@voxalyze/skill-sdk';
import uuid from 'uuid';

const DEBUG_USERID_PREFIX = 'amzn1.ask.account.JOVO-DEBUGGER';
const DEBUG_SKILLID_PREFIX = 'amzn1.ask.skill';

/**
 * Config interface for the Voxalyze plugin.
 */
interface Config extends PluginConfig {
  apiKey?: string;
  debugSkillId?: string;
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
    debugSkillId: undefined,
  };

  private debugUserId?: string;

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
   * Returns true if the request is originating from the Jovo debugger by
   * checking if the user ID is `jovo-debugger-user`.
   * @param handleRequest Input from Jovo
   */
  private isDebugger(handleRequest: HandleRequest): boolean {
    const userId = handleRequest.jovo?.$user.getId();
    return userId === 'jovo-debugger-user';
  }

  /**
   * Generates a random new skill ID and outputs a warning message with
   * instructions on how to use Voxalyze together with the Jovo debugger.
   */
  private createDebugSkillId(): void {
    const skillId = `${DEBUG_SKILLID_PREFIX}.${uuid.v4()}`;

    Log.bold().warn(`
###############################################################################
ADDITIONAL SETUP REQUIRED - JOVO DEBUGGER WITH VOXALYZE

Looks like you're using the Jovo Debugger. To allow Voxalyze to receive test
data from your Jovo Debugger runs, we have automatically generated a random
test skill ID for you. Go to https://app.voxalyze.com/skills and create a
new skill with the following ID: 

${skillId}

You must also add the skill ID to your Jovo config at "plugins.Voxalyze.debugSkillId"!
###############################################################################
`);
  }

  /**
   * Replaces Jovo debugger userId and applicationId in the Alexa request with debug IDs.
   * @param request The Alexa request
   */
  private requestWithDebugIds(request: any): any {
    if (!this.config.debugSkillId) {
      this.createDebugSkillId();
      return request;
    }

    // Set debugUserId if not already present
    this.debugUserId =
      this.debugUserId || `${DEBUG_USERID_PREFIX}-${uuid.v4()}`;

    return {
      ...request,
      context: {
        System: {
          application: { applicationId: this.config.debugSkillId },
          user: { userId: this.debugUserId },
        },
      },
    };
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

    let request = handleRequest.host.getRequestObject();

    if (this.isDebugger(handleRequest)) {
      request = this.requestWithDebugIds(request);
    }

    // TODO: POC, interface will change in release version
    return tracker.config.dispatch(request);
  }
}
