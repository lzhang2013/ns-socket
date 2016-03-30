'use strict';
var Observable = require("data/observable").Observable;
var SocketHelper = require('./socket-helper').SocketHelper;

function getMessage(counter) {
    if (counter <= 0) {
        return "Hoorraaay! You unlocked the NativeScript clicker achievement!";
    } else {
        return counter + " taps left";
    }
}

function createViewModel() {
    var viewModel = new Observable();
    viewModel.counter = 42;
    viewModel.message = getMessage(viewModel.counter);

    viewModel.onTap = function() {
        this.counter--;
        this.set("message", getMessage(this.counter));
    }

    var socketHelper = new SocketHelper();
    socketHelper.bootstrap();

    viewModel.onSocket = function() {
      console.log('onSocket: ');
      //webSocket.send("hello from nativescript");
    }

    return viewModel;
}

exports.createViewModel = createViewModel;
