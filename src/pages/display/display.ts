import { Mod } from './mod';
import { WebsocketServiceProvider } from './../../providers/websocket-service/websocket-service';
import { NavController, NavParams } from 'ionic-angular';
import { Component, NgZone } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Response } from '@angular/http/src/static_response';
import { MediaProvider } from './../../providers/media/media';
import { Participant } from './participant';
import { Events } from 'ionic-angular';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the DisplayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-display',
  templateUrl: 'display.html'
})
export class DisplayPage {
  //const AUDIO = "audio";
  username: string;
  currentCameraId: string;
  screenColor: string;
  room: string;
  toggleShareScreen: boolean;
  ws: WebsocketServiceProvider;
  shareFlag: boolean;
  chrome: any;                          //Used in screen share operation.
  participants = {};
  configuration: any;                   //Configurations of turn and stun server for ICE
  headers: Headers;                     //Http header
  bigVid: MediaStream;                  //Used to set one of the participants videos as main video
  objectKeys = Object.keys;
  messageArray: [{ name: string, msg: string }];
  //Audio and video toggle constrains
  audio: { type: string, audio: boolean, video: boolean, flag: boolean, color: string };
  video: { type: string, audio: boolean, video: boolean, flag: boolean, color: string };
  private mod: Mod;
  url = "https://global.xirsys.net/_turn/Mroads/"
  AppID = "954329664";
  AppSecret = "M1nl9tqim8wl:5GH0Pdb+Zbwvl26HyeRMPUbIwP9KxAoL2OUHWZH9B9s=";
  localStream: MediaStream;
  callstats: any;
  isMainParticipant: boolean;
  role: boolean;
  tapped: boolean;
  qualityConfiguration = ["excellent", "fair", "bad"];


  //
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private zone: NgZone,
    private http: Http,
    private webSocket: WebsocketServiceProvider,
    private mediaProvider: MediaProvider,
    private events: Events,
    private configProvider: ConfigurationProvider, private sanitizer: DomSanitizer) {
    this.ws = webSocket;
    this.username = navParams.get("username");
    this.room = navParams.get("room");
    this.audio = { type: "audio", audio: true, video: false, flag: true, color: 'grey' };
    this.video = { type: "video", audio: false, video: true, flag: true, color: 'grey' };
    this.configuration = configProvider.configuration;
    this.headers = configProvider.headers;
    this.messageArray = [{ name: "", msg: "" }];
    this.toggleShareScreen = false;
    this.screenColor = 'grey';
    this.isMainParticipant = false;
    this.tapped = false;

    //
    events.subscribe('existingParticipants', message => {
      console.log("Entered");
      console.log(message);
      this.onExistingParticipants(message);
    });
    events.subscribe('sdp', message => {
      this.handleSdp(message);
    });
    events.subscribe('newParticipantArrived', message => {
      this.onNewParticipant(message);
    });
    events.subscribe('participantLeft', message => {
      this.onParticipantLeft(message);
    });
    events.subscribe('existingChat', message => {
      console.log('Previous chat push operation');
      this.pushMessage(message.data);
    });
    events.subscribe('msg', parsedMessage => {
      this.messageArray.push(parsedMessage);

    });
    events.subscribe('iceCandidate', message => {
      this.participants[message.sender].addIceCandidate(message.candidate);
    });
    events.subscribe('peer_msg', msg => {
      this.ws.sendMessage(msg);
    });
    events.subscribe('state_msg', msg => {
      console.log("state::", msg);
      this.handleState(msg);
    });

  }


  csStatsCallback(stats) {
    console.info(arguments);
    var ssrc, userStats = {};
    var remoteUserID;
    for (ssrc in stats.streams) {
      var timeStamp= new Date().getTime();
      console.log("SSRC is: ", ssrc);
      var dataSsrc = stats.streams[ssrc];
      dataSsrc.remoteUserId = dataSsrc.remoteUserID;
      remoteUserID = dataSsrc.remoteUserID;  
      userStats[dataSsrc.remoteUserId] = userStats[dataSsrc.remoteUserId] ? userStats[dataSsrc.remoteUserId] : {};
      userStats[dataSsrc.remoteUserId].quality = userStats[dataSsrc.remoteUserId].quality ? userStats[dataSsrc.remoteUserId].quality : "excellent";
      userStats[dataSsrc.remoteUserId].upload = userStats[dataSsrc.remoteUserId].upload ? userStats[dataSsrc.remoteUserId].upload : 0;
      userStats[dataSsrc.remoteUserId].download = userStats[dataSsrc.remoteUserId].download ? userStats[dataSsrc.remoteUserId].download : 0;
      userStats[dataSsrc.remoteUserId].audioJitter = userStats[dataSsrc.remoteUserId].audioJitter ? userStats[dataSsrc.remoteUserId].audioJitter : 0;
      userStats[dataSsrc.remoteUserId].videoJitter = userStats[dataSsrc.remoteUserId].videoJitter ? userStats[dataSsrc.remoteUserId].videoJitter : 0;
      userStats[dataSsrc.remoteUserId].timeStamp=timeStamp;
      console.log("SSRC Type ", dataSsrc.statsType);
      console.log("SSRC quality ", dataSsrc.quality);
      if (dataSsrc.statsType.includes('outbound')) {
        console.log("RTT is: ", dataSsrc.rtt);
        userStats[dataSsrc.remoteUserId].rtt = dataSsrc.rtt;
        userStats[dataSsrc.remoteUserId].upload += dataSsrc.bitrate;
        userStats[dataSsrc.remoteUserId].upload = Math.round(userStats[dataSsrc.remoteUserId].upload);
      } else if (dataSsrc.statsType.includes('inbound')) {
        console.log("Inbound loss rate is: ", dataSsrc.fractionLoss);
        userStats[dataSsrc.remoteUserId].fractionLoss = dataSsrc.fractionLoss;
        userStats[dataSsrc.remoteUserId].download += dataSsrc.bitrate;
        userStats[dataSsrc.remoteUserId].download = Math.round(userStats[dataSsrc.remoteUserId].download);
      }

      if (dataSsrc.mediaType === 'video') {
        userStats[dataSsrc.remoteUserId].videoJitter = dataSsrc.jitter;
      }
      else {
        userStats[dataSsrc.remoteUserId].audioJitter = dataSsrc.jitter;
      }

      if (this.qualityConfiguration.indexOf(dataSsrc.quality) > this.qualityConfiguration.indexOf(userStats[dataSsrc.remoteUserId].quality)) {
        userStats[dataSsrc.remoteUserId].quality = dataSsrc.quality;
      }
    }
    console.info("userstats", userStats);
    const msg = {
      id: "collectStats",
      sender: this.username,
      stats: userStats
    };
    this.ws.sendMessage(msg);
  }

  initializeCallStats() {
    var localUserId = {
      userName: this.username,
      aliasName: this.username
    }
    var configParams = {
      disableBeforeUnloadHandler: true, // disables callstats.js's window.onbeforeunload parameter.
      applicationVersion: "1.0" // Application version specified by the developer.
    }
    var callstats = window['callstats'];
    console.log("find me idiot:", callstats);
    this.callstats = new callstats();
    this.callstats.initialize(this.AppID, this.AppSecret, localUserId, this.csInitCallback, this.csStatsCallback.bind(this), configParams);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DisplayPage');
    this.http.put(this.url, "sdsd", { headers: this.headers }).subscribe((res: Response) => {
      console.log("ICE List: ", res.json().v.iceServers);
      this.configuration.iceServers = res.json().v.iceServers.concat(this.configuration.iceServers);
    });

    try {
      this.initializeCallStats();
    }
    catch (e) {
      console.error("callstats error", e);
    }

    this.register(this.username, this.room);

    var that = this;

    window.addEventListener('unload', function () {
      that.ws.sendMessage({
        id: 'leaveRoom'
      });
      console.log(that.participants, ' left the room');

      that.ws.close();
      location.reload();
    });
  }
  csInitCallback(err, msg) {
    console.log("Initializing Status: err=" + err + " msg=" + msg);
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

  register(name, room) {
    this.username = name;
    this.room = room;

    console.log("hello " + this.username + this.room);

    var message = {
      id: 'joinRoom',
      name: name,
      room: room,
    }

    let quality = this.getParameterByName("q", undefined);
    let frameRate = parseInt(this.getParameterByName("fr", undefined));
    console.info("quality,frameRate", quality, frameRate);
    var constraints = this.mediaProvider.audioOnlyConstraints;
    if (quality) {
      switch (quality) {
        case "hd":
          constraints = this.mediaProvider.hdConstraints;
          break;
        case "vga":
          constraints = this.mediaProvider.vgaConstraints;
          break;
        case "qvga":
          constraints = this.mediaProvider.qvgaConstraints;
          break;
        case "fhd":
          constraints = this.mediaProvider.fullHdConstraints;
          break;
      }
    }

    if (frameRate) {
      constraints.video.frameRate = { exact: frameRate };
    }

    console.info("constraints", constraints)

    this.mediaProvider.getMedia(constraints).then(function (stream) {
      this.localStream = stream;
      this.ws.sendMessage(message);
    }.bind(this)).catch(function (err) {
      console.log("error", err);
    });

  }
  toggleIcon() {
    console.log("clicked");
    this.tapped = !this.tapped;
  }
  /*
  Disable the media. Remove stream then update sdp;
  */
  toggleVideo() {
    //console.log("video toggle:::--", this.video);
    console.log("Video toggle ");
    this.participants[this.username].videoFlag = !this.participants[this.username].videoFlag;
    console.log("participant state:", this.participants[this.username].participantState);
    if (this.participants[this.username].videoFlag) {
      let stream = this.participants[this.username].getLocalStream();
      this.mediaProvider.getMediaTracks("video", stream).forEach(this.removeTracksAndUpdateSdp.bind(this));
      this.mediaProvider.removeMediaTracks("video", stream);
      this.setParticipantState(this.mediaProvider.getConstraints(stream));
      console.log("color:", this.video.color);
      this.video.color = '#db4437'
    }
    else {
      this.mediaProvider.getMedia({ video: true })
        .then(curstream => {
          this.mediaProvider.getMediaTracks("video", curstream).forEach(this.addTracksAndUpdateSdp.bind(this));
          this.video.color = 'grey';
        })

    }

  }
  removeTracksAndUpdateSdp(track) {
    for (let key in this.participants) {
      if (key != this.username) {
        this.participants[key].removeTrack(track);   //remove track for other participants
        this.participants[key].generateSdp(this.participants[this.username].participantState);
        this.updateZone();
      }
    }
  }
  addTracksAndUpdateSdp(track) {
    let stream = this.participants[this.username].getLocalStream();
    this.mediaProvider.addMediaTracks(stream, track);
    this.setParticipantState(this.mediaProvider.getConstraints(stream));
    for (var key in this.participants) {
      if (key != this.username) {
        this.participants[key].addTrack(stream, track);  // add track for other participants
        this.participants[key].generateSdp(this.participants[this.username].participantState);
      }
    }
  }
  toggleAudio() {
    console.log("Audio toggle ");
    this.participants[this.username].audioFlag = !this.participants[this.username].audioFlag;
    //console.log(";;;;",this.participants[this.username].audioFlag);
    let stream = this.participants[this.username].getLocalStream();
    stream.getAudioTracks()[0].enabled = !this.participants[this.username].audioFlag;
    this.setParticipantState(this.mediaProvider.getConstraints(stream));
    this.sendParticipantState(this.participants[this.username].participantState);
    this.participants[this.username].audioFlag ? this.audio.color = '#db4437' : this.audio.color = "grey";
  }
  sendParticipantState(participantState) {
    for (var key in this.participants) {
      if (key != this.username) {
        const msg = {
          id: "state_msg",
          sender: key,
          participantState: participantState,
        };
        this.ws.sendMessage(msg);
      }

    }
  }

  //End call button
  endCall() {
    console.log("End call button pressed");
    this.leaveRoom();
  }
  /*
  Whenever a new participant joins
  Below two function is called when a new participant is created. Function is called on the 
  existing participant side for every new participant. Eg if p1 is existing participant and p2 joins.
  Then below function will be called on p1 side.
  Below function will be called for every existing participant from the websocket(backend).
  So every existing participant will receive the video from this.participant.
  */
  onNewParticipant(request) {
    console.log("newparticipantarrived");
    this.receiveVideo(request.name);
  }
  //sender is new participant in the room 
  //this.username is present participant
  receiveVideo(sender) {
    console.log("Entered receive video ", sender);

    console.log(this.username, " ", sender);
    /*Pass the present participant's role*/
    var participant = new Participant(this.username, sender, this.room, this.events, this.configuration, this.updateZone.bind(this), this.callstats, this.isMainParticipant, this.role);
    this.participants[sender] = participant;
    participant.createPeers(this.participants[this.username].getLocalStream());
    let screenStream = this.participants[this.username].getScreenStream();
    if (screenStream) {
      participant.addStream(screenStream);
    }
    console.log("Exit receive video");
    this.updateZone();
  }
  /*When a new participant joins, function will create an answer or will setremotedescription if it is of type answer.
  When someone new joins it will create an offer for all the participants. And will get the answer back.
  */

  handleSdp(result) {
    console.info("handlesdp ", result);
    this.participants[result.sender].participantState = Object.assign(this.participants[result.sender].participantState, result.participantState);
    //pass current state of the answerer from participants layerl
    console.log(result);
    this.participants[result.sender].setSdp(result, this.getLocalState());
  }
  handleState(result) {
    this.participants[result.sender].participantState = Object.assign(this.participants[result.sender].participantState, result.participantState);
  }
  /*
  pip-video(small video) is set as main(large) video
  */
  changeVideo(stream: MediaStream) {
    console.log("previous video ", this.bigVid);
    this.bigVid = stream;
    console.log("stream ", stream);
    console.log("changed video ", this.bigVid);
    this.updateZone();
  }
  leaveRoom() {
    if (window.confirm("Are you sure you want to leave") == true) {
      this.ws.sendMessage({
        id: 'leaveRoom'
      });
      console.log(this.participants, ' left the room');

      this.ws.close();
      location.reload();
    }
  }
  /*
  Function is called whenever a new user joins a room. Local stream is set. Called on the new participant side.
  If p1 is a new participant below function will be called on his side.
  Remote stream is set for all the existing users.
  */
  onExistingParticipants(msg) {
    var constraints = {
      audio: true,
      video: false
    };
    /*1st participant joined will be the main Participant*/
    if (msg.data.length == 0) {
      this.isMainParticipant = true;
      console.log("isMainParticipant:", this.isMainParticipant);
    }
    //console.log("isMainParticipant:", this.isMainParticipant);
    /*role sets the role of the participant, if the isMainParticipant role is true else role is false */
    this.role = msg.role;
    console.log(this.username + " registered in room " + this.room);
    this.updateZone();
    console.log(this.configuration);

    /* Pass the existing participant's role  */
    let participant = new Participant(this.username, this.username, this.room, this.events, this.configuration, this.updateZone.bind(this), this.callstats, this.isMainParticipant, this.role);
    this.participants[this.username] = participant;
    let that = this;
    console.log('video received');
    this.bigVid = this.localStream;
    console.log("localstream ", this.localStream);
    participant.setLocalStream(this.localStream);
    this.setParticipantState(constraints);
    //this.setCameraId();
    that.updateZone();
    console.log("msgdata", msg.data);
    for (let participant in msg.data) {
      //participant is the key of values in msg.data & msg.data[participant] gets the exact participant
      this.receiveMediaAndGenerateSdp(msg.data[participant]);
    }
    console.log(msg.data);
    msg.data.forEach(function (d) {
      console.log(d);
    });
  }
  /*
  Below function is called for every particpant whenever new participant joins
  Sender is one of the existing participant. this.username is new participant.
  Below function is called on new participant side.
  */
  receiveMediaAndGenerateSdp(sender) {
    console.info('receiveVideoandGenerateSdp');
    console.log(this.username, " ", sender);
    /*Pass the senders participant's role */
    let participant = new Participant(this.username, sender.name, this.room, this.events, this.configuration, this.updateZone.bind(this), this.callstats, this.isMainParticipant, sender.role);
    this.participants[sender.name] = participant;
    participant.createPeers(this.participants[this.username].getLocalStream());
    //Pass current state of the offerer
    this.participants[sender.name].generateSdp(this.participants[this.username].participantState);
    console.log(this.participants);
  }
  onParticipantLeft(request) {
    console.log('Participant ' + request.name + ' left');
    let participant = this.participants[request.name];
    console.log(this.participants[request.name]);
    if (participant != null)
      participant.dispose();
    delete this.participants[request.name];
  }

  onSubmit(message: String) {
    this.ws.sendMessage(JSON.stringify({ message: message, room: this.room, type: "msg", user: this.username }));
  }

  // Will force update a component in case of asynchronous activity;

  updateZone() {
    this.zone.run(() => console.info("forcing view update"));
  }
  shareScreen() {
    this.mod = new Mod();
    //Initially share screen is off
    if (!this.toggleShareScreen) {
      this.mod.nativeWindow.chrome.runtime.sendMessage('dpgmddfhghbhhldcbjeednoklomllaem', {
        getTargetData: true,
        sources: ['screen', 'window', 'tab']
      }, (response: any) => {
        if (!response) {
          console.log("extension not installed");
          alert("Please install Panna screen sharing extension from chrome webstore to share your screen. ")
          //this.installChromeExtension();
          return;
        }
        let constraints = this.mediaProvider.getScreenConstraints(response.streamId);
        console.log("constraints taken", constraints);
        this.mediaProvider.getMedia(constraints)
          .then(screenStream => {
            console.log("screen stream for", this.username, screenStream);
            this.participants[this.username].setScreenStream(screenStream);
            console.log(this.participants[this.username]);
            for (var key in this.participants) {
              if (key != this.username) {
                console.log(this.participants[key]);
                //this.participants[key].zone(this.updateZone.bind(this));
                this.participants[key].peerConnect.updateZone = this.updateZone;
                this.participants[key].addStream(screenStream);
                //this.participants[key].addStream(screenStream);
                this.participants[key].generateSdp(this.participants[this.username].participantState);
                console.log(this.participants[key]);
              }
            };
            this.screenColor = '#0080ff';
            this.updateZone();
            console.log(this.screenColor);
            console.log(screenStream);
            screenStream.oninactive = () => {
              // When share screen is closed using tooltip
              if (this.participants[this.username].participantState.screen != "") {
                console.log("oninacive");
                console.log(this.participants[this.username]);
                this.participants[this.username].participantState.screen = "";
                console.log(this.participants[this.username].participantState);
                for (var key in this.participants) {
                  if (key != this.username) {
                    this.updateZone();
                    console.log("Screen share closing");
                    this.participants[key].removeStream(screenStream);
                    this.participants[key].generateSdp(this.participants[this.username].participantState);
                  }
                }
                this.toggleShareScreen = !this.toggleShareScreen;
                this.screenColor = 'grey';
              } else {
                console.log("oninactiove was called but video already stopped");
              }
            }
          })
      });
    } else {
      //when screen stream is closed using toggle sharescreen 
      console.log("else share screen called");
      if (this.participants[this.username].screenStream) {
        this.screenColor = 'grey';
        console.log(this.participants[this.username]);
        this.participants[this.username].participantState.screen = "";
        console.log(this.participants[this.username]);
        for (let key in this.participants) {
          if (key != this.username) {
            this.updateZone();
            this.participants[key].removeStream(this.participants[this.username].screenStream);
            this.participants[key].generateSdp(this.participants[this.username].participantState);
          }
        }
        for (let track of this.mediaProvider.getTracks(this.participants[this.username].screenStream)) {
          console.log(track);

          track.stop();
        }
        this.participants[this.username].screenStream = undefined;
      } else {
        console.log("No stream found");
      }
    }
    console.log(this.screenColor);
    this.toggleShareScreen = !this.toggleShareScreen;
  }
  // installChromeExtension(): void {
  //    const that = this;
  //    const headID = document.getElementsByTagName('head')[0];
  //    const link = document.createElement('link');
  //    link.rel = 'chrome-webstore-item';
  //    headID.appendChild(link);
  //    link.href = 'https://chrome.google.com/webstore/detail/' + 'dpgmddfhghbhhldcbjeednoklomllaem';
  //    window.chrome.webstore.install(
  //      'https://chrome.google.com/webstore/detail/' + 'dpgmddfhghbhhldcbjeednoklomllaem',
  //    function (response) {
  //   console.info('Successfully installed screen sharing extension , response is' + response);
  //      that.shareScreen();
  //      }, function (error) {
  //     if (error.indexOf('cancelled install') > -1) {
  //          //that.router.navigate([{ outlets: { rightPopup: null } }]);
  //          console.error('Error while installing screen sharing extension' + error);
  //      } else {
  //          console.error('Sorry, Could not add extension at this moment! ' + error);
  //        }
  //      });
  //  }


  stopStream(stream) {
    stream.getVideoTracks().forEach(function (track) {
      track.stop();
    })
  }
  //message will be emmited by child component
  //message is a promise which contains stream and camera device id
  onNotify(message: any) {
    console.log("changecamera");
    // this.stopStream(this.localStream);
    let stream = this.participants[this.username].getLocalStream();
    this.mediaProvider.getMediaTracks("video", stream).forEach(this.removeVideoTrack.bind(this));
    this.mediaProvider.removeMediaTracks("video", stream);
    message.then(value => {
      this.currentCameraId = value.device;
      this.addTracksAndUpdateSdp(value.stream);
    }).catch(err => console.log(err));
  }
  removeVideoTrack(track) {
    for (let key in this.participants) {
      if (key != this.username) {
        this.participants[key].removeTrack(track);   //remove track for other participants
        this.updateZone();
      }
    }
  }
  setCameraId() {
    this.currentCameraId = this.mediaProvider.getDeviceId("video", this.participants[this.username].getLocalStream());
    console.log("camera id:" + this.currentCameraId);
  }
  pushMessage(messageArr) {
    console.log("push message function");
    for (let entry of messageArr) {
      this.messageArray.push(entry);
    }
  }
  setParticipantState(flag) {
    console.log("flag ", flag);
    //console.log(this.participants[this.username].participantState);
    this.participants[this.username].participantState.audio = flag.audio;
    this.participants[this.username].participantState.video = flag.video;
    //console.log(this.participants[this.username].participantState);
  }
  setParticipantScreenState(flag) {
    this.participants[this.username].participantState.screen = flag;
  }
  getLocalState() {
    return this.participants[this.username].participantState;
  }
  chooseStream(participant: Participant) {
    console.log("parti", participant);
    if (participant.participantState && participant.participantState.screen !== "") {
      return participant.screenStream;
    }
    return participant.stream;
  }
  isSame(str: string, str2: string) {
    return (str == str2);
  }
  notBlank(str: string) {
    if (str === "")
      return false;
    return true;
  }
  changeColor(mediaState: boolean) {
    if (mediaState) {
      return "";
    }
    return "danger";
  }
  getVideoSrc(participant: Participant) {
    if (participant.participantState.video) {
      //return this.getURL(participant.stream);
      return participant.stream;
    }
    return null;
  }

  getURL(stream) {
    console.info("stream", stream);
    return this.sanitize(URL.createObjectURL(stream));
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
