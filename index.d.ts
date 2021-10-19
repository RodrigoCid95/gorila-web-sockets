import { ConfigLoader, LibraryManager } from 'gorila-core';
import * as SocketIO from 'socket.io';
import * as http from 'http';
/**
 * Socket controller.
 */
declare class SocketController {
	/**
	 * Constructor
	 * @param {LibraryManager} libraryManager Library manager.
	 */
  constructor(libraryManager: LibraryManager);
}
/**
 * Sockets controller constructable.
 */
interface SocketConstructable {
  new(libraryManager: LibraryManager): SocketController;
}
/**
 * List of sockets controllers
 */
declare type SocketControllers = SocketConstructable[];
/**
 * Sockets server.
 */
declare class SocketsServer {
  /**
   * @property {}
   * sockets.io server instance.
   * @type {SocketIO.Server}
   */
  io: SocketIO.Server;
  /**
   * Server port
   * @type {number}
   */
  port: number;
	/**
	 * Constructor.
	 * @param {LoaderConfig} loaderConfig Loader config.
	 * @param {SocketControllers} socketControllersDeclarations Sockets controllers declarations.
	 * @param {LibraryManager} lm Library manager.
	 */
  constructor(loaderConfig: ConfigLoader, SocketsControllersDeclarations: SocketControllers, lm?: LibraryManager);
	/**
	 * Initialize the server.
	 * @param {http.Server | undefined} http HTTP server.
	 */
  init(http?: http.Server): Promise<void>;
}
/**
 * Register a new handler for the given event.
 * @param {string} nameEvent Name of the event
 * @returns {void}
 */
declare function On(nameEvent: string): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
/**
 * Structure of an error response.
 */
interface ResponseError {
  /**
   * Level where the error occurred, if it is 0 the error was produced from the internal layer of the library, but if it is 1 the error is in the code layer of the controller.
   */
  level?: number;
  /**
   * Error code.
   */
  code: number | string;
  /**
   * Error message.
   */
  message: string;
  /**
   * Call stack.
   */
  stack?: any;
  [x: string]: any;
}
/**
 * Structure of an response.
 */
interface SocketsResponse {
  /**
   * Response data.
   * @type {any}
   */
  data?: any;
  /**
   * Response error.
   * @type {ResponseError}
   */
  error?: ResponseError;
}
/**
 * Web socket.
 */
declare type Socket = SocketIO.Socket;
/**
 * Config sockets server.
 */
interface SocketsConfig {
  /**
  * Port the server is listening on.
  * @type {number}
  */
  port?: number;
  /**
   * Events.
   */
  events?: {
    /**
     * Called when a new connection is created.
     */
    onConnect?: (socket: Socket) => void;
    /**
     * Called before returning a response to the client.
     */
    onBeforeToAnswer?: (response: SocketsResponse | ResponseError, socket?: Socket, getLibraryInstance?: LibraryManager['getLibrary']) => SocketsResponse | ResponseError;
    /**
     * Called when a call is made by the customer.
     */
    onANewRequest?: (request: any[], socket?: Socket, getLibraryInstance?: LibraryManager['getLibrary']) => any[];
    /**
     * Called when a client disconnects.
     */
    onDisconnect?: (reason: string, socket: Socket) => void;
  };
}
/**
 * SocketIO server.
 */
declare type IO = SocketIO.Server;
/**
 * SocketIO server options.
 */
declare type SocketIOServerOptions = SocketIO.ServerOptions;
export {
  SocketController,
  SocketConstructable,
  SocketControllers,
  SocketsServer,
  On,
  ResponseError,
  SocketsResponse,
  Socket,
  SocketsConfig,
  IO,
  SocketIOServerOptions
}