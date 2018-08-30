/*
  Generated class for the PeerConnectionsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

export class PeerConnectionsProvider {


    senderPeer: any;
    configuration: any;
    addcall: any;
    icecall: any;
    changecall: any;

    constructor(configuration: any) {
        console.log("Constructor called");
        this.configuration = configuration;
    }
    createPeers() {
        console.log("Create peers entered");
        console.log(this.configuration);
        this.senderPeer = new RTCPeerConnection(this.configuration);
        this.senderPeer.onaddstream = (event) => {
            this.addcall(event);
        };
        this.senderPeer.onicecandidate = (event) => {
            this.icecall(event);
        };
        this.senderPeer.oniceconnectionstatechange = (event) => {
            this.changecall(event);
        };
        console.log("exit createpeers");
    }
    createAnswer(sdp: any) {
        console.log("createanswer---");
        console.log("answer ", this);
        return new Promise((resolve, reject) => {
            this.senderPeer.setRemoteDescription(sdp).then(() => {
                this.senderPeer.createAnswer()
                    .then((sdp) => {
                        this.senderPeer.setLocalDescription(sdp);
                        resolve(sdp);
                    }).catch(err => { reject(err) });
            }).catch(err => { reject(err) });
        });
    }


    prioritizeCodec(desc, codec) {
        var h264 = this.findCodecId(desc, codec);
        if (h264 !== null && desc && desc.sdp) {
            var sdp = desc.sdp;
            var m = sdp.match(/m=video\s(\d+)\s[A-Z\/]+\s([0-9\ ]+)/);
            console.info("m", m);
            if (m.length == 3) {
                var candidates = m[2].split(" ");
                var prioritized = [];
                Object.keys(candidates).forEach(function (id) {
                    if (candidates[id] == h264) {
                        prioritized.unshift(candidates[id]);
                    } else {
                        prioritized.push(candidates[id]);
                    }
                });
                var mPrioritized = m[0].replace(m[2], prioritized.join(" "));
                console.info("Setting H.264 as preferred video codec. \"%s\"", mPrioritized);
                desc.sdp = sdp.replace(m[0], mPrioritized);
            }
        }
        return desc;
    }

    findCodecId(desc, codec) {
        if (desc && desc.sdp && codec) {
            var m
            if (codec === 'H264') {
                m = desc.sdp.match(/a=rtpmap\:(\d+)\sH264\/\d+/);
            }
            else if (codec === 'VP9') {
                m = desc.sdp.match(/a=rtpmap\:(\d+)\sVP9\/\d+/);
            }
            else if (codec === 'VP8') {
                m = desc.sdp.match(/a=rtpmap\:(\d+)\sVP8\/\d+/);
            }
            if (m.length > 0) {
                return m[1];
            }
        }
        return null;
    }

    generateSdp() {
        console.log("generate sdp peer ", this);
        return new Promise((resolve, reject) => {
            this.senderPeer.createOffer()
                .then((sdp) => {
                    const codec = this.getParameterByName("codec", null);
                    if (codec) {
                        this.prioritizeCodec(sdp, codec);
                    }
                    this.senderPeer.setLocalDescription(sdp);
                    resolve(sdp);
                }).catch(err => { reject(err) });
        });
    }
    addIceCandidate(candidate: any) {
        this.senderPeer.addIceCandidate(candidate);
    }
    setRemoteDesc(sdp: any) {
        this.senderPeer.setRemoteDescription(sdp).then(() => {
            console.log("setting sdp success")
        }).catch(err => { console.log("setting sdp error", err) });
    }
    onRemoveStream(callback: any) {
        this.senderPeer.onremovestream = callback.bind(this);
    }

    getSenders() {
        return this.senderPeer.getSenders();
    }
    removeTrack(sender) {
        this.senderPeer.removeTrack(sender);
    }
    addTrack(stream, track) {
        console.info(this);
        this.senderPeer.addTrack(track, stream);
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
