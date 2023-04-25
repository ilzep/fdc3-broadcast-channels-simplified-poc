function interopOverride(InteropBroker, provider, options, ...args) {
    
	// OPENFIN docs: https://developer.openfin.co/docs/javascript/stable/InteropBroker.html
    class InteropOverride extends InteropBroker {
        externalBroker;
		allowedURLs = ['http://localhost:4000/sender/sender.html'];
        
        async initializeBrokers(uuid, endpointId) {
			const platform = fin.Platform.wrapSync({ uuid });

			if (await platform.Application.isRunning()) {
				await this.setupContextGroups(uuid, endpointId);
			}

			await platform.on("platform-api-ready", async () => {
				await this.setupContextGroups(uuid, endpointId);
			});
		}

		/**
		 * Called before every action to check if this entity should be allowed to take the action. 
		 * Return false to prevent the action.
		 * @param {*} action - the string action to authorize in camel case
		 * @param {*} payload - the data being sent for this action
		 * @param {*} identity - the connection attempting to dispatch this action
		 * @returns 
		 * NOTE: this is NOT called when we receive a message from the sender
		 */
		async isActionAuthorized(action, payload, identity) {
			console.log(`[isActionAuthorized] action: ${action}`);
			console.log(`[isActionAuthorized] payload: ${JSON.stringify(payload)}`);
			console.log(`[isActionAuthorized] identity: ${JSON.stringify(identity)}`);
			return true;
		}

		/**
		 * Can be used to completely prevent a connection. Return false to prevent connections. Allows all connections by default.
		 * @param {*} id - the identity tryinc to connect
		 * @param {*} payload - optional payload to use in custom implementations, will be undefined by default
		 * @returns 
		 */
		async isConnectionAuthorized(id, payload) {
			
			/** example:
			{"batch":false,"entityType":"window","name":"platform_sender_window_1",
			"parentFrame":"platform_sender_window_1","uuid":"platform_sender_uuid",
			"runtimeUuid":"30.110.74.8/9696/platform_sender_uuid",
			"endpointId":"f4ef651b-d5bd-46c0-9178-57fc5813b732",
			"connectionUrl":"http://localhost:4000/sender/sender.html",
			"isLocalEndpointId":false}
			 */
			console.log(`[isConnectionAuthorized] id: ${JSON.stringify(id)}`);
			/** example:
			 * {"token":"connection_token"}
			 */
			console.log(`[isConnectionAuthorized] payload: ${JSON.stringify(payload)}`);

			// own app always allowed
			if(id.uuid === fin.me.uuid) {
				return true;
			}

			// only green listed URLS allowed to connect
			if(this.allowedURLs.indexOf(id.connectionUrl) == -1) {
				return false;
			}
			// subscribe to context messages for this particular uuid
			this.initializeBrokers(id.uuid, id.endpointId);
			
			// if we got here, we are allowing connection
			return true;
		}

		async clientDisconnected(clientIdentity) {
			/**
			 * {"topic":"channel","type":"client-disconnected","uuid":"platform_sender_uuid",
			 * "channelName":"interop-broker-platform_receiver","batch":false,"entityType":"window",
			 * "name":"platform_sender_window_1","parentFrame":"platform_sender_window_1",
			 * "runtimeUuid":"30.110.74.8/9696/platform_sender_uuid",
			 * "endpointId":"f4ef651b-d5bd-46c0-9178-57fc5813b732"}
			 */
			console.log(`[clientDIsconnected] clientIdentity: ${JSON.stringify(clientIdentity)}`);
		}

        async setupContextGroups(uuid, endpointId) { 
			const selectedChannnel = 'green';
			const colorClient = fin.Interop.connectSync(uuid, {});
			await colorClient.joinContextGroup(selectedChannnel);

			const contextHandler = async context => {
				const identity = {uuid: fin.me.uuid, name: 'platform_receiver_window_1'};
				const intent = {name:'ViewChart', context};
				await super.setIntentTarget(intent, identity);
			};
			await colorClient.addContextHandler(contextHandler);

        }

        constructor() {
            super();
            this.externalBroker = 'platform_sender_uuid';
        }

    }

    return new InteropOverride(provider, options, ...args);
}

fin.Platform.init({ interopOverride });