import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular/util/events';

/*
  Generated class for the WebsocketServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class WebsocketServiceProvider {

  onMessage: any;
  ws: WebSocket;
  x: number;
  s: any = 0;

  constructor(public http: HttpClient,
    public events: Events) {
    console.log("WebSocket provider");
    if(this.s == 0) {
      console.log(location);
      let tempString = location.host.split(":");
      let ip = tempString[0];
      let addr = ip+":7443";
      // this.ws = new WebSocket('wss://localhost:7443/groupcall'); 
       this.ws = new WebSocket('wss://ptp.mroads.com:7443/groupcall');
      // this.ws = new WebSocket('wss://172.16.3.240:7443/groupcall');
      this.ws.onopen = this.onopen;
      this.ws.onerror = this.onerror;
      this.ws.onmessage = this.onmessage.bind(this);
      this.s++;
    }
  }
  onopen() {
    console.log("WebSocket Open");    
    this.x = 1;
  }
  onerror() {
    console.log("WebSocket Error");
  }
  onmessage(message: MessageEvent) {
    let parsedMessage = JSON.parse(message.data);
    console.info('Received Message: ',parsedMessage);
    //this.onMessage(parsedMessage);
    this.events.publish(parsedMessage.id,parsedMessage);
  }
  onclose() {
    console.log("Websocket closed");
  }
  sendMessage(message: any) {
    let jsonMessage = JSON.stringify(message);
    console.log('Sending message: ',message);
    if(this.ws.readyState === 1) {
      console.log('enter ready state');
      this.ws.send(jsonMessage);
    } else {
      console.log("Connection setup");
      this.waitForConnection(this.ws, function(){
        console.log("message sent");
        this.ws.send(jsonMessage);
      }.bind(this));
    }
  }
  //This function will wait for the connection to open
  waitForConnection(socket, callback) {
    console.log("waiting");
      setTimeout(
        function() {
          if(socket.readyState === 1) {
            console.log("connection is made");
            if(callback != null)
            callback();
            return;
          } else {
            console.log("waiting for connection");
            this.waitForConnection(socket,callback);
          }
        }.bind(this),500);
  }
  close() {
    this.ws.onclose = this.onclose;
  }
  initialize(callback: any): void {
    console.log("initialzed");
    this.onMessage = callback;
  }
}