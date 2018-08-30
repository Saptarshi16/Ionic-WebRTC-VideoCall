import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MediaProvider } from '../../providers/media/media';

/**
 * Generated class for the ToggleCameraComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'toggle-camera',
  templateUrl: 'toggle-camera.html'
})
export class ToggleCameraComponent {

  mediaProvider: MediaProvider;
  //notify is the name of the event which will be emitted to parent container component
  //notify is binded to a component in parent component
  @Output() notify: EventEmitter<any> = new EventEmitter<any>();
  @Input() cameraId: string;
  cameraCount: boolean;
  constructor(mediaProvider: MediaProvider) {
    this.mediaProvider = mediaProvider;
    this.cameraCount = false;
    this.count();
  }
  /*
  Toggle camera component will be enable only when there are more than 1 camera connected.
  Below function checks for camera components;
  */
  count() {
    console.log("count entered");
    this.mediaProvider.getDevices().
      then(devices => {
        let count = 0;
        for (let device of devices) {
          if (device.kind === "videoinput") {
            count++;
          }
        }
        if (count >= 2)
          this.cameraCount = true;
      }).catch(err => { console.log(err) });
  }
  onemit() {
    console.log("button clicked");
    console.log("camera ", this.cameraId);
    return new Promise(function (resolve, reject) {
      this.mediaProvider.getDevices()
        .then(devices => {
          console.log("mediainside ", this);
          let vdevices = [];
          let temp = 0;
          let i = 0;
          for (let device of devices) {
            if (device.kind === "videoinput") {
              if (device.deviceId === this.cameraId) {
                temp = i;
              }
              vdevices.push(device);
              i++;
            }
          }
          temp++;
          console.info("index that gets picked ", temp);
          //console.log("-----------" , vdevices," ",temp);
          let device = vdevices[(temp) % vdevices.length].deviceId;
          console.log(device);
          let constraints = {
            video: { deviceId: device ? { exact: device } : undefined }
          };
          //console.log("-----" + device.deviceId);
          this.mediaProvider.getMedia(constraints)
            .then(stream => {
              console.log("mediainside2 ", this);
              resolve({ stream: this.mediaProvider.getMediaTracks("video", stream)[0], device: device });
            })
            .catch(err => reject(err));
        }).catch(err => reject(err));
    }.bind(this));
  }
  onClick() {
    this.notify.emit(this.onemit());
  }
}
