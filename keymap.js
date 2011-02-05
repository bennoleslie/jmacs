var baseKeyMap = {
    65: [true, 'a', 'A'],
    66: [true, 'b', 'B'],
    67: [true, 'c', 'C'],
    68: [true, 'd', 'D'],
    69: [true, 'e', 'E'],
    70: [true, 'f', 'F'],
    71: [true, 'g', 'G'],
    72: [true, 'h', 'H'],
    73: [true, 'i', 'I'],
    74: [true, 'j', 'J'],
    75: [true, 'k', 'K'],
    76: [true, 'l', 'L'],
    77: [true, 'm', 'M'],
    78: [true, 'n', 'N'],
    79: [true, 'o', 'O'],
    80: [true, 'p', 'P'],
    81: [true, 'q', 'Q'],
    82: [true, 'r', 'R'],
    83: [true, 's', 'S'],
    84: [true, 't', 'T'],
    85: [true, 'u', 'U'],
    86: [true, 'v', 'V'],
    87: [true, 'w', 'W'],
    88: [true, 'x', 'X'],
    89: [true, 'y', 'Y'],
    90: [true, 'z', 'Z'],
    32: [false, "Space"],
    13: [false, "Enter"],
     9: [false, "Tab"],
    27: [false, "Esc"],
     8: [false, "Backspace"],
    16: [false, "Shift"],
    17: [false, "Control"],
    18: [false, "CapsLock"],
    20: [false, "NumLock"],
    45: [false, "Insert"],
    46: [false, "Delete"],
    48: [true, '0', ')'],
    49: [true, '1', '!'],
    50: [true, '2', '@'],
    51: [true, '3', '#'],
    52: [true, '4', '$'],
    53: [true, '5', '%'],
    54: [true, '6', '^'],
    55: [true, '7', '&'],
    56: [true, '8', '*'],
    57: [true, '9', '('],
    190: [true, '.', '>'],
    191: [true, '/', '?'],
    192: [true, '`', '~'],
    219: [true, '[', '{'],
    220: [true, '\\', '|'],
    221: [true, ']', '}'],
    222: [true, '\'', '"'],
    33: [false, "PageUp"],
    34: [false, "PageDown"],
    35: [false, "End"],
    36: [false, "Home"],
    37: [false, "Left"],
    38: [false, "Up"],
    39: [false, "Right"],
    40: [false, "Down"],
}

var webKitKeyMap = object(baseKeyMap)
webKitKeyMap[186] = [true, ';', ':']
webKitKeyMap[187] = [true, '=', '+']
webKitKeyMap[188] = [true, ',', '<']
webKitKeyMap[189] = [true, '-', '_']

var geckoKeyMap = object(baseKeyMap)
geckoKeyMap[59] = [true, ';', ':']
geckoKeyMap[61] = [true, '=', '+']
geckoKeyMap[188] = [true, ',', '<']
geckoKeyMap[109] = [true, '-', '_']

var macGeckoKeyMap = object(geckoKeyMap)
geckoKeyMap[107] = [true, undefined, '+']

var keyMap;

if (navigator.userAgent.indexOf("WebKit") != -1) {
    keyMap = webKitKeyMap
} else if (navigator.userAgent.indexOf("Gecko") != -1) {
    if (navigator.userAgent.indexOf("Macintosh") != -1) {
	/* User the macGeckoKeyMap */
	keyMap = macGeckoKeyMap
    } else {
	keyMap = geckoKeyMap
    }
} else {
    alert("Couldn't detect what browser keymap to use. Just using base. This probably means not all keys will work. Sorry. [" +  navigator.userAgent + "]")
    keyMap = baseKeyMap
}

