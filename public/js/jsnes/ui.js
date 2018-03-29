/*
 JSNES, based on Jamie Sanders' vNES
 Copyright (C) 2010 Ben Firshman

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

JSNES.DummyUI = function (nes) {
    this.nes = nes;
    this.enable = function () {
    };
    this.updateStatus = function () {
    };
    this.writeAudio = function () {
    };
    this.writeFrame = function () {
    };
};

if (typeof jQuery !== 'undefined') {
    (function ($) {
        $.fn.JSNESUI = function (roms) {
            var parent = this;
            var buf = null;
            var buf32 = null;
            var UI = function (nes) {
                var self = this;
                var logs_max=100;
                /*
                 * Create UI
                 */
                self.root = $('<div></div>');
                self.screen = $('<canvas class="nes-screen" width="256" height="240"></canvas>').appendTo(self.root);
                self.fileInput=$('<input id="file" type="file" style="display: none;">').appendTo(self.root);
                self.attachEvents(self.screen[0],self.fileInput[0]);
                if (!self.screen[0].getContext) {
                    parent.html("Your browser doesn't support the <code>&lt;canvas&gt;</code> tag. Try Google Chrome, Safari, Opera or Firefox!");
                    return;
                }

                // Don't blur the screen when resized
                self.screen[0].style.imageRendering = "-moz-crisp-edges";
                self.screen[0].style.imageRendering = "pixelated";
                self.controls = $('<div class="nes-controls"></div>').appendTo(self.root);
                self.buttons = {
                    fullscreen: $('<input type="button" value="fullscreen" class="nes-fullscreen">').appendTo(self.controls),
                    screenshot: $('<input type="button" value="screenshot" class="nes-screenshot">').appendTo(self.controls),
                    pause: $('<input type="button" value="pause" class="nes-pause" disabled="disabled">').appendTo(self.controls),
                    restart: $('<input type="button" value="restart" class="nes-restart" disabled="disabled">').appendTo(self.controls),
                    sound: $('<input type="button" value="disable sound" class="nes-enablesound">').appendTo(self.controls),
                    handle1: $('<input type="button" value="handle1" class="nes-handle1">').appendTo(self.controls),
                    handle2: $('<input type="button" value="handle2" class="nes-handle2">').appendTo(self.controls),
                    logs: $('<input type="button" value="logs" class="nes-logs">').appendTo(self.controls),
                    roms: $('<input type="button" value="roms" class="nes-roms">').appendTo(self.controls),
                    romSelect:$('<select></select>').appendTo(self.controls)
                };
                self.status = $('<p class="nes-status">Booting up...</p>').appendTo(self.root);
                self.handle1=$('<div handle></div>').appendTo(self.root);
                self.handle2=$('<div handle></div>').appendTo(self.root);
                self.root.appendTo(parent);
                self.console=$('<code console><pre></pre></code>').appendTo(parent);

                self.logEnable=false;
                if(!self.logEnable){
                    self.console.fadeToggle(250);
                }
                self.log=function(msg) {
                    if(self.logEnable){
                        if (logs_max++ == 50) {
                            logs_max = 0;
                            self.console.find('pre').html('');
                        } else {
                            self.console.find('pre')[0]
                                .appendChild(document.createTextNode(msg + "\n"));
                            logs_max++;
                        }
                    }
                };
                self.nes = nes;
                self.ccnes=new CCNes({url:"ws://"+window.location.host+"/ccnes",onmessage:function(o){
                    switch (o.handle){
                        case 1:
                            switch(o.t){
                                case 30:
                                    self.nes.keyboard.state1[o.key] = o.keyType;
                                    self.log("[handle1]key press["+ o.key +"]:"+ o.keyType);
                                    break;
                            }
                            break;
                        case 2:
                            switch(o.t){
                                case 30:
                                    self.nes.keyboard.state2[o.key] = o.keyType;
                                    self.log("[handle2]key press["+ o.key +"]:"+ o.keyType);
                                    break;
                            }
                            break;
                    }
                },log:self.log});
                self.keymap = self.nes.keyboard.keymap;
                $.ajax({
                	url:"//"+window.location.host+"/roms.json",
                	success:function(roms){
                		self.setRoms(roms);
                	},
                	dataType:'json'
                });
                /*
                 * Buttons
                 */
                self.buttons.roms.click(function () {
                    self.fileInput[0].click();
                });
                self.buttons.pause.click(function () {
                    if (self.nes.isRunning) {
                        self.nes.stop();
                        self.updateStatus("Paused");
                        self.buttons.pause.attr("value", "resume");
                    } else {
                        self.nes.start();
                        self.buttons.pause.attr("value", "pause");
                    }
                });
                self.buttons.restart.click(function () {
                    self.nes.reloadRom();
                    self.nes.start();
                });

                self.buttons.sound.click(function () {
                    if (self.nes.opts.emulateSound) {
                        self.nes.opts.emulateSound = false;
                        self.buttons.sound.attr("value", "enable sound");
                    } else {
                        self.nes.opts.emulateSound = true;
                        self.buttons.sound.attr("value", "disable sound");
                    }
                });
                var showQrcode=false;
                self.buttons.handle1.click(function(e){
                    if(!showQrcode){
                        showQrcode=true;
                        self.handle1.html("");
                        self.handle1.qrcode(window.location.host+"/handle/1/"+self.ccnes.uid+".xhtml");
                        self.handle2.hide();
                        self.handle1.show();
                    }
                });
                self.buttons.handle2.click(function(e){
                    if(!showQrcode){
                        showQrcode=true;
                        self.handle2.html("");
                        self.handle2.qrcode(window.location.host+"/handle/2/"+self.ccnes.uid+".xhtml");
                        self.handle1.hide();
                        self.handle2.show();
                    }
                });
                $('[handle]').click(function(e){
                    showQrcode=false;
                    self.handle2.hide();
                    self.handle1.hide();
                });
                self.buttons.logs.click(function(e){
                    self.logEnable=!self.logEnable;
                    self.console.find('pre').html("");
                    self.console.fadeToggle(250);
                });
                self.buttons.fullscreen.click(function (e) {
                    screenfull.toggle(self.screen[0]);
                });
                self.buttons.screenshot.click(function (e) {
                    self.screenshot(document.body);
                });
                self.buttons.romSelect.change(function(){
                	self.loadROM();
                });
                var onResize=false;
                var consoleHeight=self.console.height();
                self.console.css({"max-height":consoleHeight+"px"});
                $(window).resize(function(e){
                    if(!onResize){
                        onResize=true;
                        setTimeout(function(){
                            consoleHeight=$(window).outerHeight(true)-$("body>h1").outerHeight(true)-$("#emulator>div").outerHeight(true);
                            self.console.css({"max-height":consoleHeight+"px"});
                            onResize=false;
                        },250);
                    }
                });
                /*
                 * Lightgun experiments with mouse
                 * (Requires jquery.dimensions.js)
                 */
                if ($.offset) {
                    self.screen.mousedown(function (e) {
                        if (self.nes.mmap) {
                            self.nes.mmap.mousePressed = true;
                            // FIXME: does not take into account zoom
                            self.nes.mmap.mouseX = e.pageX - self.screen.offset().left;
                            self.nes.mmap.mouseY = e.pageY - self.screen.offset().top;
                        }
                    }).mouseup(function () {
                        setTimeout(function () {
                            if (self.nes.mmap) {
                                self.nes.mmap.mousePressed = false;
                                self.nes.mmap.mouseX = 0;
                                self.nes.mmap.mouseY = 0;
                            }
                        }, 500);
                    });
                }
                if (typeof roms != 'undefined') {
                    self.setRoms(roms);
                }
                /*
                 * Canvas
                 */
                self.canvasContext = self.screen[0].getContext('2d');
                if (!self.canvasContext.getImageData) {
                    parent.html("Your browser doesn't support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Google Chrome, Safari, Opera or Firefox!");
                    return;
                }
                self.canvasImageData = self.canvasContext.getImageData(0, 0, 256, 240);
                self.resetCanvas();
                /*
                 * Keyboard
                 */
                $(document).
                    bind('keydown', function (evt) {
                        if (typeof self.keymap[evt.keyCode] != undefined) {
                            self.nes.keyboard.state1[self.keymap[evt.keyCode]] = 0x41;
                            self.log("[handle1]key press["+ evt.keyCode +"]:"+ 0x41);
                        }
                    }).
                    bind('keyup', function (evt) {
                        if (typeof self.keymap[evt.keyCode] != undefined) {
                            self.nes.keyboard.state1[self.keymap[evt.keyCode]] = 0x40;
                            self.log("[handle1]key press["+ evt.keyCode +"]:"+ 0x40);
                        }
                    }).
                    bind('keypress', function (evt) {
                    });
                /*
                 * Sound
                 */
                self.dynamicaudio = new DynamicAudio({
                    swf: nes.opts.swfPath + 'dynamicaudio.swf'
                });
            };
            UI.prototype = {
                attachEvents: function (element, fileInput) {
                    element.addEventListener('dragover', function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                    });
                    element.addEventListener('drop', this.handleFileSelect(this));
                    fileInput.onchange = this.handleFileSelect(this);
                },
                handleFileSelect: function (self) {
                    return function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
                        for (var i = 0, file; file = files[i]; i++) {
                            var reader = new FileReader();
                            reader.onload = function (fe) {
                                self.nes.loadRom(fe.target.result);
                                self.nes.start();
                                self.enable();
                            }
                            reader.readAsArrayBuffer(file);
                            break;
                        }
                    }
                },
                loadROM: function () {
                    var self = this;
                    self.updateStatus("Downloading...");
                    var selectVal=self.buttons.romSelect.val();
                    $.ajax({
                        url: selectVal,
                        xhr: function () {
                            var xhr = $.ajaxSettings.xhr();
                            if (typeof xhr.overrideMimeType !== 'undefined') {
                                // Download as binary
                                xhr.overrideMimeType('text/plain; charset=x-user-defined');
                            }
                            self.xhr = xhr;
                            return xhr;
                        },
                        complete: function (xhr, status) {
                            if('error'!=status){
                            	var i, data;
                                if (JSNES.Utils.isIE()) {
                                    var charCodes = JSNESBinaryToArray(
                                        xhr.responseBody
                                    ).toArray();
                                    data = String.fromCharCode.apply(
                                        undefined,
                                        charCodes
                                    );
                                } else {
                                    data = xhr.responseText;
                                }
                                self.nes.loadRom(data);
                                self.nes.start();
                                self.enable();
                            }else{
                                self.updateStatus("Download ["+selectVal+"] "+status);
                            }
                        }
                    });
                },
                resetCanvas: function () {
                    this.buf32 = new Uint32Array(this.canvasImageData.data.buffer);
                    // Fill the canvas with black
                    this.canvasContext.fillStyle = 'black';
                    // set alpha to opaque
                    this.canvasContext.fillRect(0, 0, 256, 240);
                    // Set alpha
                    for (var i = 0; i < this.buf32.length; ++i) {
                        this.buf32[i] = 0xFF000000;
                    }
                },
                /*
                 * nes.ui.screenshot() --> return <img> element :)
                 */
                screenshot: function (body) {
                    //var img = new Image();
                    this.screen[0].toBlob(function (b) {
                        body.style.backgroundImage="url("+URL.createObjectURL(b)+")";
                    });
                    //return img;
                },
                /*
                 * Enable and reset UI elements
                 */
                enable: function () {
                    this.buttons.pause.attr("disabled", null);
                    if (this.nes.isRunning) {
                        this.buttons.pause.attr("value", "pause");
                    } else {
                        this.buttons.pause.attr("value", "resume");
                    }
                    this.buttons.restart.attr("disabled", null);
                    if (this.nes.opts.emulateSound) {
                        this.buttons.sound.attr("value", "disable sound");
                    } else {
                        this.buttons.sound.attr("value", "enable sound");
                    }
                },

                updateStatus: function (s) {
                    this.status.text(s);
                },

                setRoms: function (roms) {
                    this.buttons.romSelect.children().remove();
                    $("<option>Select a ROM...</option>").appendTo(this.buttons.romSelect);
                    for(var i in roms){
                    	$('<option>'+roms[i]+'</option>')
                    	.attr('value','//'+window.location.host+'/nes/'+roms[i])
                    	.appendTo(this.buttons.romSelect);
                    }
//                    for (var groupName in roms) {
//                        if (roms.hasOwnProperty(groupName)) {
//                            var optgroup = $('<optgroup></optgroup>').
//                                attr("label", groupName);
//                            for (var i = 0; i < roms[groupName].length; i++) {
//                                $('<option>' + roms[groupName][i][0] + '</option>')
//                                    .attr("value", roms[groupName][i][1])
//                                    .appendTo(optgroup);
//                            }
//                            this.buttons.romSelect.append(optgroup);
//                        }
//                    }
                },

                writeAudio: function (samples) {
                    return this.dynamicaudio.writeInt(samples);
                },

                writeFrame: function (buffer) {
                    var i = 0;
                    for (var y = 0; y < 240; ++y) {
                        for (var x = 0; x < 256; ++x) {
                            i = y * 256 + x;
                            // Convert pixel from NES BGR to canvas ABGR
                            this.buf32[i] = 0xFF000000 | buffer[i]; // Full alpha
                        }
                    }
                    this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                }
            };

            return UI;
        };
    })(jQuery);
}