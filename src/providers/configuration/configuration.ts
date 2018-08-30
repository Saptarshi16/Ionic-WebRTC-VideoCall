import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';

/*
  Generated class for the ConfigurationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigurationProvider {

  headers: Headers;
  configuration: any;
  constructor(public http: HttpClient) {
    console.log('Hello ConfigurationProvider Provider');
    this.headers = new Headers({
      'Accept': 'application/json',
      "Authorization": "Basic " + btoa("VijayK-mRoads:9a433bd0-c4d6-11e7-8fda-666e0a0e6f2c")
    });
    this.configuration = {
      iceServers: [{
        "url": "turn:turn.mroads.com:443?transport=udp",
        "username": "test",
        "credential": "test"
      }, {
        "url": "turn:turn.mroads.com:443?transport=tcp",
        "username": "test",
        "credential": "test"
      }, {
        "url": "turn:turn.mroads.com:80?transport=udp",
        "username": "test",
        "credential": "test"
      }, {
        "url": "turn:turn.mroads.com:80?transport=tcp",
        "username": "test",
        "credential": "test"
      }, {
        "url": "stun:turn.mroads.com:443"
      }]
    };
  }
}
