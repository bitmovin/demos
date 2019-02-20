/*
Copyright (c) 2016, UMR STMS 9912 - Ircam-Centre Pompidou / CNRS / UPMC
All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

function clamp(value, min, max) {
    if (max < min) {
        throw new Error("Invalid");
    }

    return Math.max(min, Math.min(value, max));
}

/************************************************************************************/
/*!
 *  @brief          amplitude decibel to linear gain conversion
 *  @param[in]      dB : value in decibels
 *
 *  @details        y = 10^( x / 20 )
 */
/************************************************************************************/
function dB2lin(value) {
    return Math.pow(10, value / 20);
}

//==============================================================================
const utilities =
{
    clamp,
    dB2lin,
};

class AbstractNode {
    /**
     * AbstractNode constructor
     * @param {AudioContext} audioContext - audioContext instance.
     */
    constructor(audioContext) {
        this._audioContext = audioContext;
        this._input = this._audioContext.createGain();
        this._output = this._audioContext.createGain();
    }

    //==============================================================================
    /**
     * Connect the audio node
     * @param {AudioNode} node - an AudioNode to connect to.
     */
    connect(node) {
        this._output.connect(node);
    }
    /**
     * Disconnect the audio node     
     */
    disconnect() {
        this._output.disconnect();
    }

    //==============================================================================
    /**
     * Returns the current sample rate of the audio context
     */
    getCurrentSampleRate() {
        return this._audioContext.sampleRate;
    }
}

class PeakLimiterNode extends AbstractNode {
    /************************************************************************************/
    /*!
     *  @brief          Class constructor
     *  @param[in]      audioContext
     *  @param[in]      numChannels : number of channels     
     *
     */
    /************************************************************************************/
    constructor(audioContext,
        numChannels) {
        /// sanity checks
        if (numChannels <= 0) {
            throw new Error("Invalid");
        }

        super(audioContext);

        this.nMaxBufferSection = 0;
        this.maxBufferIndex = 0;
        this.delayBufferIndex = 0;
        this.maxBufferSlowIndex = 0;
        this.maxBufferSectionIndex = 0;
        this.maxBufferSectionCounter = 0;
        this.maxMaxBufSlow = 0;
        this.indexMaxBufferSlow = 0;
        this.maxCurrentSection = 0;

        this.attackMs = 0;
        this.maxAttackMs = 0;
        this.attackConst = 0;
        this.releaseConst = 0;
        this.threshold = 0;
        this.channels = 0;
        this.maxChannels = 0;
        this.sampleRate = 0;
        this.maxSampleRate = 0;

        this.fadedGain = 1.0;
        this.smoothState = 1.0;

        this.pMaxBuffer = null;
        this.pDelayBuffer = null;
        this.pMaxBufferSlow = null;
        this.pIndexMaxInSection = null;
        this.input = null;
        this.ouput = null;


        /// additions:


        this.maxSampleRate = 192000;

        this.sampleRate = utilities.clamp(audioContext.sampleRate, 22050, 192000);

        this.init(20, 20, utilities.dB2lin(-3), numChannels, 192000);

        this.setSampleRate(this.sampleRate);

        this.reset();

        this.setNChannels(numChannels);

        /// the script processor part
        {
            const bufferSize = 0;
            /*
             The buffer size in units of sample-frames. If specified, the bufferSize must be one of the following values:
             256, 512, 1024, 2048, 4096, 8192, 16384. If it's not passed in, or if the value is 0,
             then the implementation will choose the best buffer size for the given environment,
             which will be a constant power of 2 throughout the lifetime of the node.
             */
            const numberOfInputChannels = numChannels;
            const numberOfOutputChannels = numChannels;
            this._scriptNode = audioContext.createScriptProcessor(bufferSize,
                numberOfInputChannels,
                numberOfOutputChannels);


            var processor = this;

            this._scriptNode.onaudioprocess = function (audioProcessingEvent) {
                var inputBuffer = audioProcessingEvent.inputBuffer;
                var outputBuffer = audioProcessingEvent.outputBuffer;

                const numChannels = outputBuffer.numberOfChannels;

                if (inputBuffer.numberOfChannels != numChannels) {
                    throw new Error("Invalid");
                }
                if (numChannels != processor.channels) {
                    throw new Error("Invalid");
                }

                for (let j = 0; j < numChannels; j++) {
                    processor.input[j] = inputBuffer.getChannelData(j);
                    processor.output[j] = outputBuffer.getChannelData(j);
                }

                const numSamples = inputBuffer.length;

                var tmp, gain;
                var maximum, sectionMaximum;

                for (let i = 0; i < numSamples; i++) {

                    /* get maximum absolute sample value of all channels */
                    processor.pMaxBuffer[processor.maxBufferIndex] = processor.threshold;
                    for (let j = 0; j < processor.channels; j++) {
                        processor.pMaxBuffer[processor.maxBufferIndex] = Math.max(processor.pMaxBuffer[processor.maxBufferIndex], Math.abs(processor.input[j][i]));
                    }

                    /* search maximum in the current section */
                    if (processor.pIndexMaxInSection[processor.maxBufferSlowIndex] == processor.maxBufferIndex) // if we have just changed the sample containg the old maximum value
                    {
                        // need to compute the maximum on the whole section
                        processor.maxCurrentSection = processor.pMaxBuffer[processor.maxBufferSectionIndex];
                        for (let j = 1; j < processor.sectionLength; j++) {
                            if (processor.pMaxBuffer[processor.maxBufferSectionIndex + j] > processor.maxCurrentSection) {
                                processor.maxCurrentSection = processor.pMaxBuffer[processor.maxBufferSectionIndex + j];
                                processor.pIndexMaxInSection[processor.maxBufferSlowIndex] = processor.maxBufferSectionIndex + j;
                            }
                        }
                    }
                    else // just need to compare the new value the cthe current maximum value
                    {
                        if (processor.pMaxBuffer[processor.maxBufferIndex] > processor.maxCurrentSection) {
                            processor.maxCurrentSection = processor.pMaxBuffer[processor.maxBufferIndex];
                            processor.pIndexMaxInSection[processor.maxBufferSlowIndex] = processor.maxBufferIndex;
                        }
                    }

                    // find maximum of slow (downsampled) max buffer
                    maximum = processor.maxMaxBufferSlow;
                    if (processor.maxCurrentSection > maximum) {
                        maximum = processor.maxCurrentSection;
                    }

                    processor.maxBufferIndex++;
                    processor.maxBufferSectionCounter++;

                    /* if pMaxBuffer section is finished, or end of pMaxBuffer is reached,*/
                    /*   store the maximum of this section and open up a new one */
                    if (processor.maxBufferSectionCounter >= processor.sectionLength || processor.maxBufferIndex >= processor.attack + 1) {
                        processor.maxBufferSectionCounter = 0;

                        tmp = processor.pMaxBufferSlow[processor.maxBufferSlowIndex] = processor.maxCurrentSection;
                        var j = 0;
                        if (processor.indexMaxBufferSlow == processor.maxBufferSlowIndex) {
                            j = 1;
                        }
                        processor.maxBufferSlowIndex++;
                        if (processor.maxBufferSlowIndex >= processor.nMaxBufferSection) {
                            processor.maxBufferSlowIndex = 0;
                        }
                        if (processor.indexMaxBufferSlow == processor.maxBufferSlowIndex) {
                            j = 1;
                        }
                        processor.maxCurrentSection = processor.pMaxBufferSlow[processor.maxBufferSlowIndex];
                        processor.pMaxBufferSlow[processor.maxBufferSlowIndex] = 0; /* zero out the value representing the new section */

                        /* compute the maximum over all the section */
                        if (j) {
                            processor.maxMaxBufferSlow = 0;
                            for (let k = 0; k < processor.nMaxBufferSection; k++) {
                                if (processor.pMaxBufferSlow[k] > processor.maxMaxBufferSlow) {
                                    processor.maxMaxBufferSlow = processor.pMaxBufferSlow[k];
                                    processor.indexMaxBufferSlow = k;
                                }
                            }
                        }
                        else {
                            if (tmp > processor.maxMaxBufferSlow) {
                                processor.maxMaxBufferSlow = tmp;
                                processor.indexMaxBufferSlow = processor.maxBufferSlowIndex;
                            }
                        }

                        processor.maxBufferSectionIndex += processor.sectionLength;
                    }

                    if (processor.maxBufferIndex >= processor.attack + 1) {
                        processor.maxBufferIndex = 0;
                        processor.maxBufferSectionIndex = 0;
                    }

                    /* calc gain */
                    if (maximum > processor.threshold) {
                        gain = processor.threshold / maximum;
                    }
                    else {
                        gain = 1;
                    }

                    /* gain smoothing */
                    if (gain < processor.smoothState) {
                        processor.fadedGain = Math.min(processor.fadedGain, (gain - 0.1 * processor.smoothState) * 1.11111111);
                    }
                    else {
                        processor.fadedGain = gain;
                    }

                    /* smoothing filter */
                    if (processor.fadedGain < processor.smoothState) {
                        processor.smoothState = processor.attackConst * (processor.smoothState - processor.fadedGain) + processor.fadedGain; /* attack */
                        if (gain > processor.smoothState) {
                            processor.smoothState = gain;
                        }
                    }
                    else {
                        processor.smoothState = processor.releaseConst * (processor.smoothState - processor.fadedGain) + processor.fadedGain; /* release */
                    }

                    /* lookahead delay, apply gain */
                    for (let k = 0; k < processor.channels; k++) {
                        tmp = processor.pDelayBuffer[processor.delayBufferIndex * processor.channels + k];
                        processor.pDelayBuffer[processor.delayBufferIndex * processor.channels + k] = processor.input[k][i];

                        tmp *= processor.smoothState;
                        if (tmp > processor.threshold) {
                            tmp = processor.threshold;
                        }
                        if (tmp < -processor.threshold) {
                            tmp = -processor.threshold;
                        }

                        processor.output[k][i] = tmp;
                    }

                    processor.delayBufferIndex++;
                    if (processor.delayBufferIndex >= processor.attack) {
                        processor.delayBufferIndex = 0;
                    }
                }
            }
        }


        this._input.connect(this._scriptNode);
        this._scriptNode.connect(this._output);

    }


    /************************************************************************************/
    /*!
     *  @brief          init(maxAttackMsIn, releaseMsIn, thresholdIn, maxChannelsIn, maxSampleRateIn) : Must be called to initialized the class
     *  @param          maxAttackMsIn : maximum value for the attack time. It is the time to reach to correct attenutation to avoid clipping.
     *                  this parameter defines the amount of memory used by the class. It is a float or integer value
     *  @param          releaseMsIn : defines the time to release the gain. It is the time for the gain to go 
     *                  back to its nominal value after an attenaution to avoid clipping
     *                  It is a float or integer value
     *  @param          thresholdIn : maximum value fro absolutie value. It is a float value
     *  @param          maxChannelsIn : maximum value of the number of channel that can be used. Number of channels value can be changed after class creation
     *                  but the value must be lower than maxChannelsIn. The gain between channels are inked.
     *  @param          maxSampleRateIn : maximum value of the sample rate that can be used. Sample rate value can be changed after class creation
     *                  but the value must be lower than maxSampleRateIn.
     *
     */
    /************************************************************************************/
    init(maxAttackMsIn, releaseMsIn, thresholdIn, maxChannelsIn, maxSampleRateIn) {

        this.attack = Math.floor(maxAttackMsIn * maxSampleRateIn / 1000);
        if (this.attack < 1) {
            /* attack time is too short */
            this.attack = 1;
        }

        /* length of pMaxBuffer sections */
        this.sectionLength = Math.floor(Math.sqrt(this.attack + 1));
		/* sqrt(attack+1) leads to the minimum
		 of the number of maximum operators:
		 nMaxOp = sectionLength + (attack+1)/sectionLength */

        /* alloc limiter struct */

        this.nMaxBufferSection = Math.floor((this.attack + 1) / this.sectionLength);
        if (this.nMaxBufferSection * this.sectionLength < this.attack + 1) {
            this.nMaxBufferSection++; /* create a full section for the last samples */
        }

        /* alloc maximum and delay Bufferfers */
        this.pMaxBuffer = new Float32Array(this.nMaxBufferSection * this.sectionLength);
        this.pDelayBuffer = new Float32Array(this.attack * maxChannelsIn);
        this.pMaxBufferSlow = new Float32Array(this.nMaxBufferSection);
        this.pIndexMaxInSection = new Int32Array(this.nMaxBufferSection);

        this.input = new Array(maxChannelsIn);
        this.output = new Array(maxChannelsIn);
        for (let j = 0; j < maxChannelsIn; j++) {
            this.input[j] = null;
            this.output[j] = null;
        }

        if (typeof this.pMaxBuffer == 'undefined' || typeof this.pDelayBuffer == 'undefined' || typeof this.pMaxBufferSlow == 'undefined') {
            this.destroy();
            return;
        }
        this.reset();

        /* init parameters & states */
        this.maxBufferIndex = 0;
        this.delayBufferIndex = 0;
        this.maxBufferSlowIndex = 0;
        this.maxBufferSectionIndex = 0;
        this.maxBufferSectionCounter = 0;
        this.maxMaxBufSlow = 0;
        this.indexMaxBufferSlow = 0;
        this.maxCurrentSection = 0;

        this.attackMs = maxAttackMsIn;
        this.maxAttackMs = maxAttackMsIn;
        this.attackConst = Math.pow(0.1, 1.0 / (this.attack + 1));
        this.releaseConst = Math.pow(0.1, 1.0 / (releaseMsIn * maxSampleRateIn / 1000 + 1));
        this.threshold = thresholdIn;
        this.channels = maxChannelsIn;
        this.maxChannels = maxChannelsIn;
        this.sampleRate = maxSampleRateIn;
        this.maxSampleRate = maxSampleRateIn;

        this.fadedGain = 1.0;
        this.smoothState = 1.0;
    }

    /************************************************************************************/
    /*!
     *  @brief          release the memory allocated by the object. Memory is allocated when init fucntion is called
     *
     */
    /************************************************************************************/
    destroy() {
        delete this.maxBuffer;
        delete this.delayBuffer;
        delete this.maxBufferSlow;
        delete this.pIndexMaxInSection;
    }

    /************************************************************************************/
    /*!
     *  @brief          get delay in samples
     *
     */
    /************************************************************************************/
    getDelay() {
        return this.attack;
    }

    /************************************************************************************/
    /*!
     *  @brief          get attack in msec
     *
     */
    /************************************************************************************/
    getAttack() {
        return this.attackMs;
    }

    getSampleRate() {
        return this.sampleRate;
    }

    getRelease() {
        return this.releaseMs;
    }

    /************************************************************************************/
    /*!
     *  @brief          get maximum gain reduction of last processed block
     *
     */
    /************************************************************************************/
    /*
    getMaxGainReduction()
    {
        return -20 * Math.log( this.minGain ) / Math.LN10;
    }
    */

    setNChannels(nChannelsIn) {
        if (nChannelsIn == this.maxChannels) return true;
        if (nChannelsIn > this.maxChannels) return false;

        this.channels = nChannelsIn;
        this.reset();

        return true;
    }

    setInput(nChannelsInNum, input) {
        if (nChannelsInNum >= this.channels) {
            return false;
        }

        return true;
    }

    setOutput(nChannelsOutNum, output) {
        if (nChannelsOutNum >= this.channels) {
            return false;
        }

        return true;
    }

    setSampleRate(sampleRateIn) {
        if (sampleRateIn == this.maxSampleRate) return true;
        if (sampleRateIn > this.maxSampleRate) return false;

        /* update attack/release constants */
        this.attack = Math.floor(this.attackMs * sampleRateIn / 1000);

        if (this.attack < 1) /* attack time is too short */
            this.attack = 1;

        /* length of pMaxBuffer sections */
        this.sectionLength = Math.floor(Math.sqrt(this.attack + 1));

        this.nMaxBufferSection = Math.floor((this.attack + 1) / this.sectionLength);
        if (this.nMaxBufferSection * this.sectionLength < this.attack + 1) this.nMaxBufferSection++;
        this.attackConst = Math.pow(0.1, 1.0 / (this.attack + 1));
        this.releaseConst = Math.pow(0.1, 1.0 / (this.releaseMs * sampleRateIn / 1000 + 1));
        this.sampleRate = sampleRateIn;

        /*reset */
        this.reset();

        return true;
    }

    setAttack(attackMsIn) {
        if (attackMsIn == this.attackMs) return true;
        if (attackMsIn > this.maxAttackMs) return false;

        /* calculate attack time in samples */
        this.attack = Math.floor(attackMsIn * this.sampleRate / 1000);

        if (this.attack < 1) /* attack time is too short */
            this.attack = 1;

        /* length of pMaxBuffer sections */
        this.sectionLength = Math.floor(Math.sqrt(this.attack + 1));

        this.nMaxBufferSection = Math.floor((this.attack + 1) / this.sectionLength);
        if (this.nMaxBufferSection * this.sectionLength < this.attack + 1) this.nMaxBufferSection++;
        this.attackConst = Math.pow(0.1, 1.0 / (this.attack + 1));
        this.attackMs = attackMsIn;

        /* reset */
        this.reset();

        return true;
    }

    setRelease(releaseMsIn) {
        if (releaseMsIn == this.releaseMs) return true;
        this.releaseConst = Math.pow(0.1, 1.0 / (releaseMsIn * this.sampleRate / 1000 + 1));
        this.releaseMs = releaseMsIn;

        return true;
    }

    setThreshold(thresholdIn) {
        this.threshold = thresholdIn;

        return true;
    }

    getThreshold() {
        return this.threshold;
    }

    reset() {

        this.maxBufferIndex = 0;
        this.delayBufferIndex = 0;
        this.maxBufferSlowIndex = 0;
        this.maxBufferSectionIndex = 0;
        this.maxBufferSectionCounter = 0;
        this.fadedGain = 1.0;
        this.smoothState = 1.0;
        this.maxMaxBufSlow = 0;
        this.indexMaxBufferSlow = 0;
        this.maxCurrentSection = 0;

        for (let i = 0; i < this.attack + 1; i++) {
            this.pMaxBuffer[i] = 0;
        }
        for (let i = 0; i < this.attack * this.channels; i++) {
            this.pDelayBuffer[i] = 0;
        }
        for (let i = 0; i < this.nMaxBufferSection; i++) {
            this.pMaxBufferSlow[i] = 0;
            this.pIndexMaxInSection[i] = 0;
        }

        return true;
    }
}
