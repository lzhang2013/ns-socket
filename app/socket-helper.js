'use strict';
var application = require('application');
var Rx = require('rxjs/Rx');
require('nativescript-websockets');

/* base URI for connection */
// const BASE_URI = "127.0.0.1:8000";
const BASE_URI = application.android ? "10.0.2.2:8000" : "127.0.0.1:8000";

/* uri for handshaking and websocket connection */
const SOCKET_URI = {
  HANDSHAKE: 'http://' + BASE_URI + '/socket.io/?transport=polling',
  WEBSOCKET_BASE: 'ws://' + BASE_URI + '/socket.io/?transport=websocket&sid=' 
}


/**
 * SocketHelper
 * Helper to connect socket.io server and websocket client
 */
function SocketHelper() {

  /**
   * Starts socket connector 
   * It creates observable, calls handshake() first, then calls connect() when
   * it receives session id from a socket.io server.
   */
  SocketHelper.prototype.bootstrap = function() {
    let source = Rx.Observable.create(this.handshake);
    let subscription = source.subscribe(
        (sid) => { this.connect(sid); },
        (e) => { console.log('observable error - %s', e); },
        () =>  { console.log('observable completed'); }
    );
  }

  /**
   * Initiates handshake process with socket.io server
   */
  SocketHelper.prototype.handshake = function(observer) {
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
      console.log('(readyState, status): (' +
            xmlHttp.readyState + ', ' + xmlHttp.status + ')');

      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        let response = xmlHttp.responseText;
        let sid = JSON.parse(response.substring(5, response.length)).sid;
        observer.next(sid);
        observer.complete();
      }
    }

    xmlHttp.open("GET", SOCKET_URI.HANDSHAKE, true);
    xmlHttp.send();

    /**
     * Cleanup logic for observable
     */
    return () => { console.log('observable disposed'); }
  }

  /**
   * Starts websocket conenction
   * and hook up functions for open, message, error, and close
   * @param {number} sid - session id from the response on handshake
   */
  SocketHelper.prototype.connect = function(sid) {
    this.webSocket = new WebSocket(SOCKET_URI.WEBSOCKET_BASE + sid);
    this.webSocket.addEventListener('open', this.open);
    this.webSocket.addEventListener('message', this.message);
    this.webSocket.addEventListener('close', this.close);
    this.webSocket.addEventListener('error', this.error);
  }

  /**
   * Send code '52' to socket.io server to confirm the connection
   * @important 'this' in this function refers to the webSocket object
   */
  SocketHelper.prototype.open = function(evt) {
    this.send("52");
    console.log("confirmation code for socket opening sent");
  }

  /**
   * Listens to messages from socket.io server
   * @important 'this' in this function refers to the webSocket object
   */
  SocketHelper.prototype.message = function(evt) {
    let received_msg = evt.data;
    console.log("message received: ", received_msg);
  }

  /**
   * Closing websocket connection
   * @important 'this' in this function refers to the webSocket object
   */
  SocketHelper.prototype.close = function(evt) {
    this.close();
  }

  /**
   * Error handler for websocket communitation
   * @important 'this' in this function refers to the webSocket object
   */
  SocketHelper.prototype.error = function(evt) {
    console.log('connection error: %s', evt.error);
  }
}

exports.SocketHelper = SocketHelper;
