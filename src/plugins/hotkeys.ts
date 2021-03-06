/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License GNU General Public License version 2 or later;
 * Copyright 2013-2018 Valeriy Chupurnov https://xdsoft.net
 */

import { Jodit } from "../Jodit";
import { Config } from "../Config";
import { Component } from "../modules/Component";
import { normalizeKeyAliases } from "../modules/Helpers";
import { Dictionary } from "../types";

declare module "../Config" {

    interface Config {
        commandToHotkeys: Dictionary<string | string[]>
    }
}

/**
 * You can redefine hotkeys for some command
 *
 * var jodit = new Jodit('#editor', {
 *  commandToHotkeys: {
 *      bold: 'ctrl+shift+b',
 *      italic: ['ctrl+i', 'ctrl+b'],
 *  }
 * })
 * @type {{}}
 */
Config.prototype.commandToHotkeys = {
    removeFormat: ['ctrl+shift+m', 'cmd+shift+m'],
    insertOrderedList: ['ctrl+shift+7', 'cmd+shift+7'],
    insertUnorderedList: ['ctrl+shift+8, cmd+shift+8'],
    selectall: ['ctrl+a', 'cmd+a'],
};

/**
 * Allow set hotkey for command or button
 */
export class hotkeys extends Component{
    specialKeys: {[key: number]: string} = {
        8: "backspace",
        9: "tab",
        10: "return",
        13: "return",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause",
        20: "capslock",
        27: "esc",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "insert",
        46: "del",
        59: ";",
        61: "=",
        91: "meta",
        96: "0",
        97: "1",
        98: "2",
        99: "3",
        100: "4",
        101: "5",
        102: "6",
        103: "7",
        104: "8",
        105: "9",
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scroll",
        173: "-",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
    };


    private onKeyPress = (event: KeyboardEvent): string => {
        const
            special: string | false = this.specialKeys[event.which],
            character: string = (event.key || String.fromCharCode(event.which)).toLowerCase();

        const modif: string[] = [special || character];

        ["alt", "ctrl", "shift", "meta"].forEach( (specialKey) => {
            if ((<any>event)[specialKey + 'Key'] && special !== specialKey) {
                modif.push(specialKey);
            }
        });

        return normalizeKeyAliases(modif.join('+'));
    };

    constructor(editor: Jodit) {
        super(editor);

        const commands: string[] = Object.keys(editor.options.commandToHotkeys);
        commands.forEach((commandName: string) => {
            const hotkeys: string | string[] | void = editor.options.commandToHotkeys[commandName];

            if (hotkeys) {
                editor.registerHotkeyToCommand(hotkeys, commandName);
            }
        });


        editor.events
            .on('afterInit', () => {
                let itIsHotkey: boolean = false;

                editor.events
                    .on('keydown', (event: KeyboardEvent) : void | false => {
                        const shortcut: string = this.onKeyPress(event);

                        if (this.jodit.events.fire(shortcut, event.type) === false) {
                            itIsHotkey = true;

                            editor.events.stopPropagation('keydown');

                            return false;
                        }

                    }, void(0), void(0), true)
                    .on('keyup', () : void | false => {
                        if (itIsHotkey) {
                            itIsHotkey = false;
                            editor.events.stopPropagation('keyup');
                            return false;
                        }
                    }, void(0), void(0), true);
            });
    }
}
