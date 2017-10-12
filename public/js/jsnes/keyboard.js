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

// Keyboard events are bound in the UI
JSNES.Keyboard = function () {
    this.keys = {
        KEY_A: 0,
        KEY_B: 1,
        KEY_SELECT: 2,
        KEY_START: 3,
        KEY_UP: 4,
        KEY_DOWN: 5,
        KEY_LEFT: 6,
        KEY_RIGHT: 7
    };
    this.keymap = {
        "87": this.keys.KEY_UP,//w
        "83": this.keys.KEY_DOWN,//s
        "65": this.keys.KEY_LEFT,//a
        "68": this.keys.KEY_RIGHT,//d
        "71": this.keys.KEY_SELECT,//g
        "72": this.keys.KEY_START,//h
        "32": this.keys.KEY_A,//space
        "76": this.keys.KEY_B//l
    };
    this.state1 = new Array(8);
    for (var i = 0; i < this.state1.length; i++) {
        this.state1[i] = 0x40;
    }
    this.state2 = new Array(8);
    for (var i = 0; i < this.state2.length; i++) {
        this.state2[i] = 0x40;
    }
};
JSNES.Keyboard.prototype = {};
