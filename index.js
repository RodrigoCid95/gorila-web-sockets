const { logger, LibraryManager, LoaderConfig } = require('@gorila/core');
const SocketIO = require('socket.io');
/**
 * Socket controller.
 */
class SocketController {
	/**
	 * Constructor
	 * @param {LibraryManager} libraryManager Library manager.
	 */
	constructor(libraryManager) {
		if (this.models) {
			for (let index = 0; index < this.models.length; index++) {
				const mod = this.models[index];
				this.__proto__[mod.property] = new mod.class(libraryManager);
			}
			delete this.models;
		}
	}
}
/**
 * Register a new handler for the given event.
 * @param {string} nameEvent Name of the event
 * @returns {void}
 */
const On = function On(nameEvent) {
	return (target, propertyKey, descriptor) => {
		if (!target.hasOwnProperty('routes')) {
			target.routes = [];
		}
		target.routes.push({
			nameEvent,
			callback: target[propertyKey].bind(target),
		});
		return descriptor;
	}
}
/**
 * Web sockets server.
 */
class SocketsServer {
	/**
	 * Constructor.
	 * @param {LoaderConfig} loaderConfig Loader config.
	 * @param {any[]} socketControllersDeclarations Sockets controllers declarations.
	 * @param {LibraryManager} lm Library manager.
	 */
	constructor(loaderConfig, socketControllersDeclarations, lm) {
		this.loaderConfig = loaderConfig;
		this.socketControllersDeclarations = socketControllersDeclarations;
		this.lm = lm;
		this.socketControllersInstances = [];
		this.routes = [];
		this.port = 0;
		this.io = undefined;
	}
	/**
	 * Initialize the server.
	 * @param {http.Server | undefined} http HTTP server.
	 */
	async init(http = undefined) {
		logger('Iniciando Sockets Server...');
		if (this.lm && !this.lm.isCompiled) {
			await this.lm.build();
		}
		logger('Cargando controlladores web sockets ...');
		for (const controller of this.socketControllersDeclarations) {
			const instance = new controller(this.lm);
			this.socketControllersInstances.push(instance);
			this.routes = this.routes.concat(instance.routes);
		}
		logger('Controladores cargados!');
		logger('Aplicando configuración ...');
		const socketsConfig = this.loaderConfig.getConfig('GorilaWebSockets') || {};
		if (!http) {
			this.port = (process.env.PORT ? parseInt(process.env.PORT) : socketsConfig.port || 80);
			this.io = SocketIO(this.port, socketsConfig);
		} else {
			this.io = new SocketIO.Server(http, socketsConfig);
		}
		this.io.on('connect', socket => {
			(socketsConfig.events && socketsConfig.events.onConnect) ? this.socketsConfig.events.onConnect(socket) : null;
			for (let index = 0; index < this.routes.length; index++) {
				const { nameEvent, callback } = this.routes[index];
				socket.on(nameEvent, (...args) => {
					const end = args.find(arg => typeof arg === 'function');
					let argmnts = args.filter(arg => typeof arg !== 'function');
					const getLibrary = this.lm ? this.lm.getLibrary.bind(this.lm) : undefined;
					try {
						if (socketsConfig.events && socketsConfig.events.onANewRequest) {
							argmnts = socketsConfig.events.onANewRequest(argmnts, socket, getLibrary);
						}
						argmnts.push(socket, this.io);
						let contentReturn = callback(...argmnts);
						if (contentReturn instanceof Promise) {
							contentReturn.then((response) => {
								response = (socketsConfig.events && socketsConfig.events.onBeforeToAnswer) ? socketsConfig.events.onBeforeToAnswer(response, socket, getLibrary) : response;
								end ? (response ? end(response) : end()) : null;
							}).catch(error => {
								error = {
									...error,
									error: true,
									level: error.code != undefined ? 1 : 0,
									code: error.code != undefined ? error.code : 0,
									message: error.message != undefined ? error.message : error
								};
								end && end(end);
								logger(JSON.stringify(end));
							});
						} else {
							contentReturn = (socketsConfig.events && socketsConfig.events.onBeforeToAnswer) ? socketsConfig.events.onBeforeToAnswer(contentReturn, socket, getLibrary) : contentReturn;
							end && end(contentReturn);
						}
					} catch (error) {
						error = {
							...error,
							error: true,
							level: 0,
							code: error.code !== undefined ? error.code : 0,
							message: error.message !== undefined ? error.message : error,
							stack: error.stack
						};
						logger(JSON.stringify(end));
						error = (socketsConfig.events && socketsConfig.events.onBeforeToAnswer) ? socketsConfig.events.onBeforeToAnswer(error, socket, getLibrary) : error;
						end && end(error);
					}
				});
			}
			if (socketsConfig.events && socketsConfig.events.onDisconnect) {
				socket.on('disconnect', reason => {
					socketsConfig.events.onDisconnect(reason, socket);
				});
			}
		});
		if (!http) {
			logger('Servidor Web Sockets corriendo en el puerto ' + this.port);
		} else {
			logger('Servidor Web Sockets listo!');
		}
	}
}
module.exports.SocketsServer = SocketsServer;
module.exports.On = On;
module.exports.SocketController = SocketController;