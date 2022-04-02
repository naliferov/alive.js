import U from "../../../../../../../../core/U";
import Console from "../../../../../../Console";

export const TAB_KEY = 'T>';
export const TAB_REVERSE_KEY = 'T<';
export const DELETE_KEY = 'del';

export default class Keyboard {

    unit: U;
    console: Console;

    keyDownHandler;

    constructor(console: Console) {
        this.unit = new U({class: ['keyboard']});
        this.console = console;

        this.renderKeys(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']);
        this.renderKeys(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']);
        this.renderKeys(['z', 'x', 'c', 'v', 'b', 'n', 'm']);
        this.renderKeys([TAB_REVERSE_KEY, TAB_KEY, 'sh', 'space', 'enter', DELETE_KEY]);
        this.renderKeys(['cut', 'copy', '.', ',', ';', "'", '"']);
        this.renderKeys(['!', '↑', '!', '🌐']);
        this.renderKeys(['←', '!', '→', '(', ')', '{', '}', '[', ']']);
        this.renderKeys(['!', '↓', '!', '<', '>', '/', '=', ]);
    }

    onKeyDownHandler(keyDownHandler) {
        this.keyDownHandler = keyDownHandler;
    }

    renderKeys(letters: string[]) {
        const row = new U({class: ['flex']});
        this.unit.insert(row);
        for (let i = 0; i < letters.length; i++) {
            const key = new U({txt: letters[i], class: ['key', 'noselect']});
            row.insert(key);

            const txt = key.getText();
            if (txt === 'shift') continue;
            if (txt === '🌐') continue;

            key.on('touchstart', () => {
                if (this.keyDownHandler) this.keyDownHandler(key.getText());
            });
        }
    }

    getUnit() {
        return this.unit;
    }
}