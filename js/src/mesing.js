var meSing = meSing || {};

meSing.defaults = {
    steps: "1e&a2e&a3e&a4e&a",
    numMeasures: 4,
    bpm: 40,
    // textinput: ["Row","","","","row","","","","row","","","your","boat","","","",
    //             "gent-","","","-lee","down","","","the","stream","","","","","","","",
    //             "Merr-","","-il-","-lee","Merr-","","-il-","-lee","Merr-","","-il-","-lee","Merr-","","-il-","-lee",
    //             "life","","","is","but","","","a","dream","","dream","","dream","","dream","",           
    //            ],
    textinput: ["Some","","","","where","","","","o-","","-ver","the","rain-","","-bow","",
                "way","","","","up","","","","high","","","","","","","",
                "And","","","","the","","","","dreams","","that","you","dream","","of","",
                "once","","in","a","lull-","","-a-","","-by","","","","","","","",],
    // midinoteinput: [60,"","","",60,"","","",60,"","",62,64,"","","",
    //             64,"","",62,64,"","",65,67,67,67,67,"","","","",
    //             72,"",72,72,67,"",67,67,64,"",64,64,60,"",60,60,
    //             67,"","",65,64,"","",62,60,"",64,"",67,"",72,"",
    //            ],
    midinoteinput: ["60","","","","72","","","","71","","67","69","71","","72","",
                "60","","","","69","","","","67","","","","","","","",
                "57","","","","65","","","","64","","60","62","64","","65","",
                "62","","59","60","62","","64","","60","60","60","60","","","","",],
    wordgap: 50,
    // speed: 40 * 6 / 2,
    // speed: 180,
    speed: 320,
};

meSing.midiToHz = function(midi) {
    return (440 / 32) * (Math.pow(2,((midi - 9) / 12)));
};

meSing.concatFloat32Arrays = function(a1, a2) {
    var arr = new Float32Array(a1.length + a2.length);
    console.log("a1:" + a1.length + ", a2:" + a2.length + ", arr:" + arr.length);
    arr.set(a1);
    arr.set(a2, a1.length);
    return arr;
};

meSing.cleanString = function(s) {
    return s.replace(/[^A-Za-z0-9\s]/g, "");
};

meSing.validInput = function(input) {
    return (input !== undefined && input.length > 0);
};

meSing.bpmToMs = function(bpm) {
    return (60/bpm) * 1000;
}


/*
 * Session class
 */
meSing.Session = function() {
    var session = this;
    this.ctx = new AudioContext();
    // this.vocoder = vocoder(this.ctx);
    this.voices = [];
    this.voice = "";
    this.vocoders = [];
    this.lyrics = [];
    this.lyricToVoice = {};
    this.lyricsCount = 0;
    this.voiceData = "";
    this.voiceBuffer = null;
    this.grid = $("#msDisplay"); //todo: else create element
    this.metro = T("interval",
                    {interval: "BPM" + meSing.defaults.bpm + 
                               " L" + meSing.defaults.steps.length
                    },
                    function(count) {
                        var measureNum = Math.floor(count / meSing.defaults.steps.length) % meSing.defaults.numMeasures;
                        var stepNum = count % meSing.defaults.steps.length;
                        var stepId = "measure" + measureNum + "step" + stepNum;
                        var text = $("#" + stepId + " > .textinput").val();
                        var midinote = $("#" + stepId + " > .midinoteinput").val();
                        var labelId = "label" + stepNum;
                        var inputs = $("#"+stepId+">input[type='text']");
                        var duration = 0.8;
                        console.log(midinote);

                        // trying different offset calculations
                        // var offset = ((measureNum*10) + stepNum) * (meSing.defaults.wordgap/100) * (meSing.defaults.speed / 60);
                        // var offset = (meSing.defaults.speed / 60) * ((session.lyricsCount % session.lyrics.length) * meSing.defaults.wordgap/100);
                        var offset = (session.lyricsCount % session.lyrics.length) * 0.735; // hacky
                        offset = (0 % session.lyrics.length) * 0.735; // testing with only the first syllable
                        // var offset = ((1/(meSing.defaults.speed / 60)) + (meSing.defaults.wordgap/1000)) * (session.lyricsCount % session.lyrics.length);
                        console.log("offset: " + offset + ", text: " + text);
                        
                        // audio
                        if (meSing.validInput(text)) { 
                            // talking voice
                            // var voice = session.ctx.createBufferSource();  
                            // voice.buffer = session.voiceData;
                            // voice.connect(session.ctx.destination);
                            // voice.start(session.ctx.currentTime, offset, duration);

                            // singing voice!
                            // TODO: make it one single vocoder and just alter the osc freq
                            if (meSing.validInput(midinote) /*&& stepNum==0*/) {
                                // var voice;

                                // var speakingVoice = this.addVoice(text, 50);

                                var freq = meSing.midiToHz(midinote - 24);
                                var offsetSamples = Math.floor(offset * session.ctx.sampleRate);
                                var durationSamples = Math.floor(duration * session.ctx.sampleRate);
                                var numChannels = 2;
                                var frameCount = session.ctx.sampleRate;
                                var textBuffer = session.ctx.createBuffer(numChannels, frameCount, session.ctx.sampleRate);
                                console.log("offsetSamples:" + offsetSamples + ", durationSamples:" + durationSamples + ", freq:" + freq);
                                
                                // buffer options

                                // testing slice of whole sample using offset + duration
                                // textBuffer.copyToChannel(session.voiceData.getChannelData(0).slice(offsetSamples, offsetSamples+durationSamples), 0, 0);

                                // testing whole sample
                                // textBuffer = session.voiceData;

                                // testing concatenation
                                // var segment = session.voiceData.getChannelData(0).slice(offsetSamples, offsetSamples+durationSamples);
                                // var newSegment = meSing.concatFloat32Arrays(segment, segment);
                                // textBuffer.copyToChannel(newSegment, 0, 0);

                                // reference to ind voice
                                // textBuffer.copyToChannel(session.lyricToVoice[text].buffer.getChannelData(0).slice(0,durationSamples), 0, 0);
                                
                                // voice/vocoder options

                                // // 1. create new vocoder for each buffer segment (inefficient)
                                // delete this.voice;
                                // this.voice = vocoder(session.ctx, textBuffer, textBuffer, freq);

                                // 2. change pitch of existing vocoder (or create new if non-existent)
                                //    (requires buffer to be precomposed?)
                                if (!session.voice /*|| stepNum == 0*/) { // do better checking. stepNum == 0 is interesting for polyphony but gets a bit crazy
                                    // this.voice = vocoder(session.ctx, textBuffer, textBuffer, freq);
                                    var buf = session.voiceBuffer;
                                    session.voice = vocoder(session.ctx, buf, buf, freq); // this should go in a separate loop since it doesn't necessarily rely on valid text/midinote
                                    console.log("new voice");
                                }
                                else {
                                    session.voice.oscillatorNode.frequency.value = freq;
                                    console.log("set voice freq to " + freq);
                                }

                                // session.vocoders.push(voice);
                                console.log(session.voice);
                            }
                            session.lyricsCount++;
                        }
                       
                        // display
                        $(".col-a").removeClass("playing");
                        $("input[type='text']").removeClass("playing");
                        $("#" + labelId).addClass("playing");
                        for (var i=0; i<inputs.length; i++) {
                            var input = inputs[i];
                            if (input !== undefined && input.value.length > 0) {
                                inputs.addClass("playing");
                            }
                        }

                        // console.log("m"+measureNum+"s"+stepNum);
                    }); // end metro

    $(document).ready(function() {
        meSpeak.loadConfig("/js/lib/mespeak/mespeak_config.json", function() {
            console.log("config done");
            $("#voicesStatus").text("meSpeak config loaded; setting voices, please wait...");

            meSpeak.loadVoice("/js/lib/mespeak/voices/en/en-us.json", function() {
                console.log("mespeak voice loaded");
                session.setVoices();
            });
        });
    });
};
meSing.Session.prototype = {
    constructor: meSing.Session,

    playVoiceBuffer: function() {
        this.voice = vocoder(this.ctx, this.voiceBuffer, this.voiceBuffer, 50); 
    },

    addVoice: function(text, pitch, percentage) {
        if (!meSpeak.isConfigLoaded()) {
            var msg = "meSpeak config not yet loaded; please wait and try to set voices again";
            $("#voicesStatus").text(msg);
            return false;
        }
        if (pitch === undefined || pitch.length == 0) {
            // pitch = Math.random()*100;
            return false;
        }
        if (text === undefined || text.length == 0) {
            return false;
        }

        // audio buffer
        var ab = this.ctx.createBufferSource();
        ab.id = Math.floor(Math.random()*100000000);

        // cleanup text
        var cleanText = meSing.cleanString(text);
        console.log("mespeak params: " + cleanText + ", " + pitch);

        // speech data
        var speechData = meSpeak.speak(cleanText, {
            pitch: pitch,
            rawdata: "ArrayBuffer",
            wordgap: meSing.defaults.wordgap,
            speed: meSing.defaults.speed,
        });

        // decode speech data
        var v;
        var session = this;
        this.ctx.decodeAudioData(speechData, function(decodedData) {
            // var msg = "voices set to " + ab.id + " and ready to go!";
            var msg = "voices for " + (Object.keys(session.lyricToVoice).length+1) + " lyrics set and ready to go!";
            ab.buffer = decodedData;
            session.voiceData = decodedData;
            
            ab.connect(session.ctx.destination);
            
            // ab.loop = true;
            // ab.start();
            console.log(ab);

            console.log(msg);

            // $("#voicesStatus").text(msg);
            // session.voices.push(ab);

            // Voice
            // v = vocoder(session.ctx, ab.buffer, ab.buffer, 100);
            // session.voices.push(v);
            // session.vocoders.push(v);
            // session.voices = [ab];
            session.voices.push(ab);
            session.lyricToVoice[text] = ab;
            // session.voicesSet = true;
        });



        return true;
    },

    // playVoice: function(text, pitch) {
    //     if (!meSpeak.isConfigLoaded()) {
    //         console.log("config not yet loaded; please wait");
    //         return;
    //     }
    //     if (pitch === undefined || pitch.length == 0) {
    //         // pitch = Math.random()*100;
    //         return [];
    //     }
    //     if (text === undefined || text.length == 0) {
    //         return [];
    //     }
    //     var ab = this.ctx.createBufferSource();
    //     ab.id = Math.floor(Math.random()*100000000);
    //     var speechData = meSpeak.speak(text, {
    //         pitch: pitch,
    //         rawdata: "ArrayBuffer",
    //     });
    //     var v;
    //     var session = this;
    //     this.ctx.decodeAudioData(speechData, function(decodedData) {
    //         ab.buffer = decodedData;
            
    //         ab.connect(session.ctx.destination);
            
    //         // ab.loop = true;
    //         ab.start();
    //         console.log(ab);

    //         console.log("just created " + ab.id);
    //         session.voices.push(ab);

    //         // Voice
    //         // v = vocoder(session.ctx, ab, ab);
    //         // this.voices.push(v);
    //     });        
    // },

    createPassageFromVoices: function(voices) { 
        var numMeasures = meSing.defaults.numMeasures;
        var numSteps = meSing.defaults.steps.length;
        var sampleRate = this.ctx.sampleRate;
        var lyricsAll = [];
        var durationPerBeat = meSing.bpmToMs(meSing.defaults.bpm);
        var duration = durationPerBeat / (numSteps*numMeasures); // per step
        // duration = 100;
        console.log("durationPerBeat: " + durationPerBeat + ", durationPerSTep: " + duration);
        var durationSamples = Math.floor(duration * sampleRate);
        var totalSampleSize = durationSamples * numMeasures;
        // var frameCount = this.ctx.sampleRate;
        var numChannels = 2;
        var audioBuffer = this.ctx.createBuffer(numChannels, totalSampleSize, sampleRate);
        var audioData = new Float32Array();

        console.log("total sample size: " + totalSampleSize);
        // console.log(duration * numMeasures);

        // duration, bpm; add based on spaces

        // testing reassignment
        // voices["Some"] = voices["-by"];

        // populate lyrics (ALL) first
        for (var i=0; i<numMeasures; i++) {
            for (j=0; j<numSteps; j++) {
                var id = "#measure"+i+"step"+j;
                var text = $(id + " > .textinput").val();
                var midinote = $(id + " > .midinoteinput").val();

                lyricsAll.push(text);
            }
        }

        // create the passage
        for (var i=0; i<lyricsAll.length; i++) {
            var lyric = lyricsAll[i];
            if (meSing.validInput(lyric)) {
                var voice = voices[lyric];
                console.log(lyric + " -> " + voice);
                // console.log(voice);

                // var offset = (i/numMeasures) + (j/(numSteps*numMeasures));
                var offsetBeats = i + (j/numSteps);
                var offsetSamples = (offsetBeats/numMeasures) * durationSamples;
                console.log("offsetBeats:" + offsetBeats + ", offsetSamples:" + offsetSamples);

                audioData = meSing.concatFloat32Arrays(audioData, voice.buffer.getChannelData(0).slice(0, durationSamples));
                console.log(audioData.length);

            }
            else {
                audioData = meSing.concatFloat32Arrays(audioData, new Float32Array(sampleRate/3)); // hacky hard-coded; should work with durationSamples..
            }
        }

        // finally, hook it up to the context
        // this.voiceData = audioData;
        audioBuffer.copyToChannel(audioData, 0, 0);
        this.voiceBuffer = audioBuffer;

        console.log("done constructing passage from voices!");

    },

    // recursively create voices from lyrics
    createVoicesFromLyrics: function(lyrics, i) {

        // check if we've bottomed out
        if (i > lyrics.length) {
            $("#voicesStatus").text(lyrics.length + " voices loaded; 100% complete and ready to sing!");
            this.createPassageFromVoices(this.lyricToVoice);
            return;
        }

        // percentage complete
        var percentage = ((i+1)/lyrics.length) * 100;
        var lyric = lyrics[i];

        // add voice with single lyric
        if (lyric && this.addVoice(lyric.text, lyric.midinote, percentage)) {
            var msg = "adding voice (\"" + lyric.text + "\", " + lyric.midinote + "); " + percentage + "% complete";

            console.log(msg);

            // update display
            $("#voicesStatus").text(msg);
        }
        else {
            msgOnFinished = "meSing voices not all loaded properly; please wait for meSpeak config to load and call setVoices() again";
        }

        // do the next voice
        var session = this;
        window.setTimeout(function() {
            session.createVoicesFromLyrics(lyrics, i+1);
        }, 1);

        // console.log(percentage);
        // $("#voicesStatus").text("adding voices; " + percentage + "% complete");
    },

    // setup lyrics and voices
    setVoices: function() {
        var numSteps = meSing.defaults.steps.length;
        var numMeasures = meSing.defaults.numMeasures;
        var texts = [];
        var notes = [];
        this.voices = []; // garbage coll?
        this.lyrics = [];
        var msgOnFinished = "done adding voices; 100% complete";

        // new recursive method
        // setup lyrics
        for (var i=0; i<numMeasures; i++) {
            for (var j=0; j<numSteps; j++) {
                var id = "#measure"+i+"step"+j;
                var text = $(id + " > .textinput").val();
                var midinote = $(id + " > .midinoteinput").val();
                // this.addVoice(text, midinote);

                if (meSing.validInput(text) && meSing.validInput(midinote)) {
                    // text = "(break)";
                    this.lyrics.push({
                        text: text,
                        midinote: midinote
                    });
                }
                texts.push(text);
                notes.push(midinote);
            }
        }

        
        // create voices and start the chain of events
        // this.lyricToVoice =  this.createVoicesFromLyrics(this.lyrics, 0);
        this.createVoicesFromLyrics(this.lyrics, 0);


        // original giant for-loop version (working but ugly and monstrous)
        // todo: refactor this with map()
        // for (var i=0; i<numMeasures; i++) {
        //     for (var j=0; j<numSteps; j++) {
        //         var id = "#measure"+i+"step"+j;
        //         var text = $(id + " > .textinput").val();
        //         var midinote = $(id + " > .midinoteinput").val();
        //         // this.addVoice(text, midinote);

        //         // if (text != "" || midinote != "") {
        //         if (text !== "") {
        //             // text = "(break)";
        //             this.lyrics.push(text);
        //             if (midinote !== undefined && midinote.length > 0) {
        //                 // percentage complete
        //                 var measurePercentage = i / numMeasures;
        //                 var stepPercentage = (j / numSteps) / numMeasures;
        //                 var percentage = (measurePercentage + stepPercentage) * 100;

        //                 // add voice with single lyric
        //                 if (this.addVoice(text, midinote, percentage)) {
        //                     var msg = "adding voice (" + text + ", " + midinote + "); " + percentage + "% complete";

        //                     console.log(msg);

        //                     // window.setTimeout(function() {
        //                     //     console.log(msg);
        //                     //     $("#voicesStatus").text(msg);
        //                     // }, 1);

        //                     $("#voicesStatus").text(msg);
        //                     // console.log($("#voicesStatus").text());
        //                 }
        //                 else {
        //                     msgOnFinished = "meSing voices not all loaded properly; please wait for meSpeak config to load and call setVoices() again";
        //                 }
        //                 // console.log(percentage);
        //                 // $("#voicesStatus").text("adding voices; " + percentage + "% complete");
        //             }
        //         }
        //         texts.push(text);
        //         notes.push(midinote);
        //     }
        // }

        console.log(msgOnFinished);
        console.log(texts.join(" "));

        // // add a single voice with the entire phrase
        // var addVoiceSuccess = this.addVoice(texts.join(" "), notes[0]);
        
        // while (!addVoiceSuccess) {
        //     console.log("trying again...");
        //     addVoiceSuccess = this.addVoice(texts.join(" "), notes[0]);
        // }
    },

    // initialize the index display with kyle adams-style grid
    initDisplay: function() {
        var steps = meSing.defaults.steps;
        var numMeasures = meSing.defaults.numMeasures;
        var widthScale = 90; // i.e. scale to x%
        var textinput = meSing.defaults.textinput;
        var midinoteinput = meSing.defaults.midinoteinput;

        for (var i=0; i<steps.length; i++) {
            var col = $("<div class='col-a' id='label" + i + "'><strong>" + steps[i] + "</strong></div>");
            col.css("width", (widthScale/steps.length) + "%");
            this.grid.append(col);
        }
        for (var i=0; i<numMeasures; i++) {
            this.grid.append($("<br>"));
            for (var j=0; j<steps.length; j++) {
                var inputIdx = (i*steps.length) + j;
                var id = "measure"+i+"step"+j;
                var col = $("<div class='col-a' id='"+id+"'><input class='textinput' type='text' value='" + textinput[inputIdx] + "'/><br><input class='midinoteinput' type='text' value='" + midinoteinput[inputIdx] + "'/></div>");
                col.css("width", (widthScale/steps.length) + "%");
                this.grid.append(col);
            }
            this.grid.append($("<br>"));
        }
    }

};

/*
 * Voice class
 */
meSing.Voice = function(text, midinote) {

}

/*
if we do it syllable by syllable...
make a Voice class that when played will .start() and duplicate the buffer node

*/