

(async function() {

  function debounce_leading(func, timeout = 300){
    let timer;
    return (...args) => {
      if (!timer) {
        func.apply(this, args);
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
      }, timeout);
    };
  }

  const AUDIO_FILE = 'audio/trumpet.mp3';

  const context = new AudioContext();

  function splitNotes(buffer, noteLength, noteCount, offset = 0) {
    const result = [];
    const channels = buffer.numberOfChannels;
    const samplesPerNote = Math.round(noteLength * buffer.sampleRate);
    const offsetSamples = Math.round(offset * buffer.sampleRate);
    const tempBuf = new Float32Array(samplesPerNote);

    for (let i = 0; i < noteCount; i++) {
      result[i] = context.createBuffer(
        channels,
        buffer.numberOfChannels * samplesPerNote,
        buffer.sampleRate
      );
      for (let channel = 0; channel < channels; channel++) {
        buffer.copyFromChannel(
          tempBuf,
          channel,
          i * samplesPerNote + offsetSamples
        );
        result[i].copyToChannel(tempBuf, channel, 0);
      }
    }

    return result;
  }

  const response = await window.fetch(AUDIO_FILE);
  const arrayBuffer = await response.arrayBuffer();
  const trumpetBuffer = await context.decodeAudioData(arrayBuffer);
  const notes = splitNotes(trumpetBuffer, 4, 43, 0);

  let gainNode = null;
  let sourceNode = null;


  function play(audioBuffer) {
    sourceNode = context.createBufferSource();
    gainNode = context.createGain();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(gainNode);
    gainNode.connect(context.destination);
    sourceNode.start();
    return gainNode;
  }

  async function noteOff(decaySeconds=0.05) {
    if(gainNode) {
      gainNode.gain.exponentialRampToValueAtTime(
          0.00001,
          context.currentTime + decaySeconds
      );
    }
  }

  async function delay(seconds) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  async function playNote(note, seconds) {
    const octave = parseInt(note[note.length - 1]) + 1;
    const noteIdx = 'C,C#,D,D#,E,F,F#,G,G#,A,A#,B'
      .split(',')
      .indexOf(note.substr(0, note.length - 1));
    const idx = octave * 12 + noteIdx;
    const gainNode = play(notes[idx - 54]);
    await delay(seconds);

    gainNode.gain.exponentialRampToValueAtTime(
       0.00001,
       context.currentTime + 0.1
     );
  }

  const valveMap = {
    "1-DDD": "F#3",
    "1-DUD": "G3",
    "1-UDD": "G#3",
    "1-DDU": "A3",
    "1-DUU": "A#3",
    "1-UDU": "B3",
    "1-UUU": "C4",
    "2-DDD": "C#4",
    "2-DUD": "D4",
    "2-UDD": "D#4",
    "2-DDU": "E4",
    "2-DUU": "F4",
    "2-UDU": "F#4",
    "2-UUU": "G4",
    "3-UDD": "G#4",
    "3-DDU": "A4",
    "3-DUU": "A#4",
    "3-UDU": "B4",
    "3-UUU": "C5",
    "4-DDU": "C#5",
    "4-DUU": "D5",
    "4-UDU": "D#5",
    "4-UUU": "E5",
    "5-DUU": "F5",
    "5-UDU": "F#5",
    "5-UUU": "G5",
    "6-UDD": "G#5",
    "6-DDU": "A5",
    "6-DUU": "A#5",
    "6-UDU": "B5",
    "6-UUU": "C6"
  }

  const styleMap = {
    "F#3": ['f3', 'sharp'],
    "G3": ['g3'],
    "G#3": ['g3', 'sharp'],
    "A3": ['a3'],
    "A#3": ['b3', 'flat'],
    "B3": ['b3'],
    "C4": ['c4'],
    "C#4": ['c4', 'sharp'],
    "D4": ['d4'],
    "D#4": ['e4', 'flat'],
    "E4": ['e4'],
    "F4": ['f4'],
    "F#4": ['f4', 'sharp'],
    "G4": ['g4'],
    "G#4": ['g4', 'sharp'],
    "A4": ['a4'],
    "A#4": ['b4', 'flat'],
    "B4": ['b4'],
    "C5": ['c5'],
    "C#5": ['c5', 'sharp'],
    "D5": ['d5'],
    "D#5": ['e5', 'flat'],
    "E5": ['e5'],
    "F5": ['f5'],
    "F#5": ['f5', 'sharp'],
    "G5": ['g5'],
    "G#5": ['g5', 'sharp'],
    "A5": ['a5'],
    "A#5": ['b5', 'flat'],
    "B5": ['b5'],
    "C6": ['c6']
}

class Lock {
    constructor(timeout, name = "") {
      this._timeout = timeout;
      this._locked = false;
      this._name = name;
    }

    lock() {
      if (!this._locked) {
        this._locked = true;
        setTimeout(() => {
              this._locked = false;
              // console.log(`${this._name} lock() succeeded`);
            }
            , this._timeout);
        return true
      } else {
        // console.log(`${this._name} lock() failed`);
        return false;
      }
  }
}

  // const playButton = document.querySelector('#playButton');
  // playButton.disabled = false;

  // playButton.onclick = melody;
  class TrumpetAudio {
    constructor() {
      this._valveLocks = new Array();
      this._valveLocks[0] = new Lock(20, "valve1");
      this._valveLocks[1] = new Lock(20, "valve2");
      this._valveLocks[2] = new Lock(20, "valve3");
      this._blowLock = new Lock(20, "blow");
      this._pitchLock = new Lock(20, "pitch");
      this._blowing = false;
      this._valves = ['U','U','U'];
      this._partial = '1'
      this._noteMap = valveMap ;
      this.onEndBlowing();
    }

    valveDown(valveNumber) {
      let valveIndex = valveNumber - 1;
      if(this._valveLocks[valveIndex].lock()) {
        if (this._valves[valveIndex] === 'U') {
          this._valves[valveIndex] = 'D';
          this.onValveChanged(valveIndex)
        }
      }
    }

    valveUp(valveNumber) {
      let valveIndex = valveNumber - 1;
      if(this._valveLocks[valveIndex].lock()) {
        if (this._valves[valveIndex] === 'D') {
          this._valves[valveIndex] = 'U';
          this.onValveChanged(valveIndex)
        }
      }
    }

    get blowing() {
      return this._blowing ;
    }

    set blowing(blow) {
      // debounce_leading(() => {
      if(this._blowLock.lock()) {
        if(blow && !this.blowing) {
          this._blowing = true;
          this.onStartBlowing()
        }
        if(!blow && this.blowing) {
          this._blowing = false;
          this.onEndBlowing()
        }
      }
      // });
    }

    updateScore() {
      let note = document.querySelector("#note");
      note.className = 'tonic';
      if(this.note) {
        note.classList.add(...styleMap[this.note])
      }
      if(this.blowing) {
        note.classList.add('note-on');
      }
    }

    async onStartBlowing() {
        if(this.note) {
          await this.onStateChanged();
          await playNote(this.note, 10)
        }
    }

    async onEndBlowing() {
      this._blowing = false;
      await this.onStateChanged();
      await noteOff(0.75)
    }

    async onValveChanged() {
      await this.onStateChanged();
      if(this.blowing) {
        await noteOff()
        await playNote(this.note, 10)
      }
    }

    async onStateChanged() {
      this.updateScore();
      console.log(`${this._blowing}, ${this._valves}, ${this._partial}`)

    }

    get note() {
      return this._noteMap[this._partial+"-"+this._valves.join('')]
    }

    set partial(p) {
      if(this._pitchLock.lock()) {
        if (this._partial !== p) {
          this.onPartialChanged(p)
        }
      }
    }

    async onPartialChanged(p) {
      this._partial = p;
      await this.onValveChanged();
    }
  }


  async function onKeyDown(e) {
    switch (e.key) {
      case 'j':
        document.querySelector(".valve.one").classList.add("pressed");
        trumpetAudio.valveDown(1);
        break;
      case 'k':
        document.querySelector(".valve.two").classList.add("pressed");
        trumpetAudio.valveDown(2);
        break;
      case 'l':
        document.querySelector(".valve.three").classList.add("pressed");
        trumpetAudio.valveDown(3);
        break;
      case ' ':
        trumpetAudio.blowing = true ;
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        trumpetAudio.partial = e.key;
        break
    }
  }

  async function onKeyUp(e) {
    switch (e.key) {
      case 'j':
        document.querySelector(".valve.one").classList.remove("pressed");

        trumpetAudio.valveUp(1);
        break;
      case 'k':
        document.querySelector(".valve.two").classList.remove("pressed");
        trumpetAudio.valveUp(2);
        break;
      case 'l':
        document.querySelector(".valve.three").classList.remove("pressed");
        trumpetAudio.valveUp(3);
        break;
      case ' ':
        trumpetAudio.blowing = false ;
        break;
    }
  }

  //Whenever the user presses a key down, run the proper function
  window.addEventListener("keydown", onKeyDown);

  //Whenever the user lets a key up, run the proper function
  window.addEventListener("keyup", onKeyUp);

  window.trumpetAudio = new TrumpetAudio();

})();

