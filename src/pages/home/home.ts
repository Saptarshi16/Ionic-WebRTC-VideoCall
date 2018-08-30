import { WebsocketServiceProvider } from './../../providers/websocket-service/websocket-service';
import { DisplayPage } from './../display/display';
import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  //Gets the first element matching the selector username and password

  @ViewChild('username') uname;
  @ViewChild('room') room;
  constructor(public navCtrl: NavController,
    public alertCtrl: AlertController,
    public webSocket: WebsocketServiceProvider) {
    //Uncomment for Automated login
    this.autoLogin();
  }
  join() {
    console.log(this.uname.value, this.room.value);
    console.log("Display push");
    //console.log(this.webSocket.x);
    this.navCtrl.push(DisplayPage, {
      username: this.uname.value,
      room: this.room.value
    }).catch((err) => console.log(err));
  }
  autoLogin() {
    console.info("room name", this.getParameterByName("room", null) ? this.getParameterByName("room", null) : location.search);
    this.navCtrl.push(DisplayPage, {
      username: this.getParameterByName("uname", undefined) ? this.getParameterByName("uname", undefined) : ("abc" + new Date().getTime()),
      room: this.getParameterByName("room", null) ? this.getParameterByName("room", null) : location.search
    });
  }


  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
}