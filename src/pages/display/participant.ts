import { Http } from "@angular/http/src/http";
import { Events } from "ionic-angular/util/events";
import { PeerConnectionsProvider } from "../../providers/peer-connections/peer-connections";

export class Participant {
    name: string;
    http: Http;
    audioFlag: boolean;
    videoFlag: boolean;
    senderPeer: RTCPeerConnection;
    peerConnect: PeerConnectionsProvider;
    participantState: any;
    stream: MediaStream;
    screenStream: MediaStream;
    callstats: any;
    isMainParticipant:boolean;
    role:boolean;
    room:string;
    constructor(owner: string, name: string, room:string,public event: Events,
        configuration: any, public updateZone: any, callstats: any,isMainParticipant:boolean,role:boolean) {
        this.name = name;
        this.callstats = callstats;
        this.peerConnect = new PeerConnectionsProvider(configuration);
        this.participantState = { owner: owner, audio: false, video: false, screen: "" };
        this.isMainParticipant=isMainParticipant;
        this.role=role;
        this.room=room;
    }


    initializeCallStatsForPeerConnection() {
        var remoteUserId = {
            userName: this.name,
            aliasName: this.name
        }
        //  console.log("Callstats here1---",callstats);
        console.log("Callstats here---",this.callstats);
        var fabricAttributes = {
            remoteEndpointType: this.callstats.endpointType.peer,
            fabricTransmissionDirection: this.callstats.transmissionDirection.sendrecv
        };
        var usage = this.callstats.fabricUsage.multiplex;
        this.callstats.addNewFabric(this.peerConnect.senderPeer, remoteUserId, usage, this.room , fabricAttributes, this.pcCallback);
    }

    createPeers(stream) {
        console.log("Create peers entered participant");
        this.peerConnect.createPeers();
        /* If isMainParticipant or role is true then */
        // if(this.isMainParticipant || this.role){
        this.addStream(stream);
        // }
        // else{
        //     stream.getAudioTracks().forEach(function (track) {
        //                 this.addTrack(stream, track);
        //             }.bind(this));
        // }
        this.peerConnect.addcall = this.onaddstream.bind(this);
        this.peerConnect.icecall = this.oniccandidate.bind(this);
        this.peerConnect.changecall = this.onicecandidatestatechange.bind(this);
        /*this.peerConnect.senderPeer.onicecandidate = this.oniccandidate.bind(this);
        this.peerConnect.senderPeer.onaddstream = this.onaddstream.bind(this);
        this.peerConnect.senderPeer.oniceconnectionstatechange = this.onicecandidatestatechange.bind(this);*/
        try{
            this.initializeCallStatsForPeerConnection();
        }
        catch(e){
            console.error("callstats error",e)
        }

    }
    pcCallback(err, msg) {
        console.log("Monitoring status: " + err + " msg: " + msg);
    };
    oniccandidate(event: any) {
        console.log("onicecandidate", event);
        if (event.candidate) {
            var message = {
                id: 'iceCandidate',
                candidate: event.candidate,
                sender: this.name
            };
            this.event.publish('peer_msg', message);
        }
    }
    onaddstream(event: any) {
        console.log("onaddstream", event);
        console.log(this.participantState);
        console.log(this.stream);
        if (this.participantState.screen === event.stream.id) {
            console.log("onaddstreamif ");
            this.screenStream = event.stream;
            this.updateZone();
        } else {
            console.log("stream added");
            this.stream = event.stream;
            this.updateZone();
        }
        this.updateZone();
    }
    onremovestream(event: any) {
        console.log("onremovestream", event);
        if (event.stream.id === this.participantState.screen) {
            this.screenStream = undefined;
        } else {
            this.stream = undefined;
        }
    }
    onicecandidatestatechange(event: any) {
        console.log("ice candidate state changed to ", event.state);
    }


    setMediaBitrates(sdp) {
        var videoBandwidth = 1000;
        // if (DetectRTC && DetectRTC.isMobileDevice) {
        //     videoBandwidth = 300;
        // }
        // if (that.device) {
        //     videoBandwidth = 300;
        // }
        return this.setMediaBitrate(this.setMediaBitrate(sdp, "video", videoBandwidth), "audio", 50);
    }
    setMediaBitrate(sdp, media, bitrate) {
        var lines = sdp.split("\n");
        var line = -1;
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf("m=" + media) === 0) {
                line = i;
                break;
            }
        }
        if (line === -1) {
            console.debug("Could not find the m line for", media);
            return sdp;
        }
        console.debug("Found the m line for", media, "at line", line);

        // Pass the m line
        line++;

        // Skip i and c lines
        while (lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
            line++;
        }

        // If we're on a b line, replace it
        if (lines[line].indexOf("b") === 0) {
            console.debug("Replaced b line at line", line);
            lines[line] = "b=AS:" + bitrate;
            return lines.join("\n");
        }

        // Add a new b line
        console.debug("Adding new b line before line", line);
        var newLines = lines.slice(0, line)
        newLines.push("b=AS:" + bitrate);
        newLines = newLines.concat(lines.slice(line, lines.length));
        return newLines.join("\n")
    }
    /*
    If message is of type answer then set it as remote description or call create answer
    to reply to offer.
    */
    setSdp(message: any, state: any) {
        console.log("Set sdp participnat ", state);
        console.log("message", message);
        message.sdp.sdp = this.setMediaBitrates(message.sdp.sdp);
        if (message.sdp.type === "answer") {
            this.peerConnect.setRemoteDesc(message.sdp);
        } else {
            this.peerConnect.createAnswer(message.sdp)
                .then(sdp => {
                    let msg = {
                        id: "sdp",
                        sender: this.name,
                        participantState: state,
                        sdp: sdp
                    };
                    this.event.publish('peer_msg', msg);
                }).catch(err => { console.log(err) });
        }
    }
    setLocalStream(stream) {
        console.log("Set local stream participant");
        //stream.getTracks().forEach(track =>this.peerConnect.senderPeer.addTrack(track,this.stream));
        this.stream = stream;
    }
    setScreenStream(stream) {
        console.log("Setting screen stream on new participants");
        this.screenStream = stream;
        console.log(this.participantState);
        this.participantState.screen = stream.id;
        console.log(this.participantState);
    }
    dispose() {
        console.log("dispose participants");
        if (this.peerConnect.senderPeer != null) {
            this.peerConnect.onRemoveStream(this.onremovestream.bind(this));
            //this.peerConnect.senderPeer.removeStream();
        }
    }

    generateSdp(state) {
        console.log("generate sdp participants");
        this.peerConnect.generateSdp().
            then(sdp => {
                let msg = {
                    id: "sdp",
                    sender: this.name,
                    participantState: state,
                    sdp: sdp
                };
                this.event.publish('peer_msg', msg);
            }).catch(err => { console.log(err) });
    }
    addIceCandidate(candidate: any) {
        console.log("addicecandidate");
        this.peerConnect.addIceCandidate(candidate);
    }
    getLocalStream() {
        console.log("Local stream is called");
        return this.stream;
    }
    addStream(stream: MediaStream) {
        console.log("Stream Added");
        console.log(this.peerConnect.senderPeer);
        this.peerConnect.senderPeer.addStream(stream);
        //stream.getTracks().forEach(track => this.peerConnect.senderPeer.addTrack(track,stream));
    }
    removeStream(stream: any) {
        console.log('remove stream')
        console.log(this.peerConnect.senderPeer);
        this.peerConnect.senderPeer.removeStream(stream);
        //stream.getTracks().forEach(track => this.peerConnect.senderPeer.addTrack(track,stream));
    }
    getScreenStream() {
        console.log("Share screen stream");
        return this.screenStream;
    }
    getSenders(){
        return this.peerConnect.getSenders();
    }
    removeTrack(track){
        this.peerConnect.getSenders().forEach(function(sender){
			if(sender.track === track){
				this.peerConnect.removeTrack(sender);
			}
		}.bind(this))
    }
    addTrack(stream,track){
        this.peerConnect.addTrack(stream,track);
    }
}