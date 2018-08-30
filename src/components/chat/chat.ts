import { Component,Input } from '@angular/core';
import { WebsocketServiceProvider } from '../../providers/websocket-service/websocket-service';
import { Events } from 'ionic-angular/util/events';

/**
 * Generated class for the ChatComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'chat',
  templateUrl: 'chat.html'
})
export class ChatComponent {

  textmsg: string;
  ws: WebsocketServiceProvider;
  chatParticipant: boolean;
  buttonColor: string;
  @Input('data') messageArray: [{ name: string, msg: string }];
  @Input() username: string = "test";
  @Input() room: string = "test";

  constructor(public events: Events) {
    console.log('Hello ChatComponent Component');
    this.chatParticipant = false;
    this.textmsg="";
  }
  toggleChat() {
    this.chatParticipant = !this.chatParticipant;    
    console.log("togglechat..");
  }

  chatsys(message: string) {
    if(message == null || message == undefined || message.length == 0){
      return;
    }
    console.log("chatsys..");
    this.events.publish('peer_msg', { message: message, room: this.room, type: "msg", user: this.username, id: "msg" });
    this.textmsg = null;
    //this.ws.sendMessage({ message: message, room: this.room, type: "msg", user: this.username, id: "msg" });
    // this.messageArray.push({name:this.username, msg: message});
  }

}
