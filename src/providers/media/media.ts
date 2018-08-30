import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Code is written assuming that there will only be one track of type audio and video.
  Generated class for the MediaProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MediaProvider {

  audioOnlyConstraints: any;
  qvgaConstraints: any;
  vgaConstraints: any;
  hdConstraints: any;
  fullHdConstraints: any;
  fourKConstraints: any;
  constructor(public http: HttpClient) {
    console.log('Hello MediaProvider Provider');
    this.audioOnlyConstraints = {
      audio: true,
      video: true
    };

    this.qvgaConstraints = {
      audio: true,
      video: { width: { exact: 320 }, height: { exact: 240 } }
    };

    this.vgaConstraints = {
      audio: true,
      video: { width: { exact: 640 }, height: { exact: 480 } }
    };

    this.hdConstraints = {
      audio: true,
      video: { width: { exact: 1280 }, height: { exact: 720 }, frameRate: 10 }
    };

    this.fullHdConstraints = {
      audio: true,
      video: { width: { exact: 1920 }, height: { exact: 1080 }, frameRate: 10 }
    };

    this.fourKConstraints = {
      audio: true,
      video: { width: { exact: 4096 }, height: { exact: 2160 }, frameRate: 10 }
    };

  }
  getMedia(constrains: MediaStreamConstraints) {
    console.log("media provided");
    console.log(constrains);
    let audio = (constrains.audio === true ? true : false);
    let video = (constrains.video === true ? this.vgaConstraints.video : constrains.video);
    let constr = {
      audio: audio,
      video: video
    };
    console.log(constr);
    return navigator.mediaDevices.getUserMedia(constr);
  }
  getDevices() {
    console.log("devices provided");
    return navigator.mediaDevices.enumerateDevices();
  }
  getMediaTracks(type: string, stream: MediaStream) {
    console.log(type + "provided");
    if (type === "audio") {
      //console.log(stream.getAudioTracks());
      return stream.getAudioTracks();
    }
    //console.log(stream.getVideoTracks());
    return stream.getVideoTracks();
  }
  getTracks(stream: MediaStream) {
    return stream.getTracks();
  }
  hasTrack(type: string, stream: MediaStream) {
    return (this.getMediaTracks(type, stream).length > 0) ? true : false;
  }
  getConstraints(stream: MediaStream) {
    let constraint = { audio: false, video: false };
    if (this.getMediaTracks("audio", stream).length > 0 && stream.getAudioTracks()[0].enabled) {
      constraint.audio = true;
    }
    if (this.getMediaTracks("video", stream).length > 0) {
      constraint.video = true;
    }
    return constraint;
  }
  getScreenConstraints(streamId): any {
    let constrains = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSourceId: streamId,
          chromeMediaSource: 'desktop',
          maxWidth: 1280,
          maxHeight: 720,
        }
      }
    };
    return constrains;
  }
  removeMediaTracks(type: string, stream: MediaStream) {
    let track = this.getMediaTracks(type, stream)[0];
    console.log("track stopped");
    track.stop();
    stream.removeTrack(track); //remove sender while removing the track
    //this.removeTrack(track)
    console.log("after track stopped");
    return stream;
  }

  addMediaTracks(stream: MediaStream, track: MediaStreamTrack): MediaStream {
    stream.addTrack(track);
    return stream;
  }
  getDeviceId(type: string, stream: MediaStream) {
    let track = this.getMediaTracks(type, stream)[0];
    return track.getSettings().deviceId;
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