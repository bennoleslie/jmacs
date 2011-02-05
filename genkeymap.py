#!/usr/bin/env python

import string

print "var baseKeyMap = {"
for code, low, upp in zip(range(65, 91), string.lowercase, string.uppercase):
    print "    %d: [true, '%s', '%s']," % (code, low, upp)
print '    32: [false, "Space"],'
print '    13: [false, "Enter"],'
print '     9: [false, "Tab"],'
print '    27: [false, "Esc"],'
print '     8: [false, "Backspace"],'
print '    16: [false, "Shift"],'
print '    17: [false, "Control"],'
print '    18: [false, "CapsLock"],'
print '    20: [false, "NumLock"],'
print '    45: [false, "Insert"],'
print '    46: [false, "Delete"],'
for code, low, upp in zip(range(48, 58), string.digits, ")!@#$%^&*("):
    print "    %d: [true, '%s', '%s']," % (code, low, upp)
for code, low, upp in zip(range(190, 193), "./`", '>?~'):
    print "    %d: [true, '%s', '%s']," % (code, low, upp)
for code, low, upp in zip(range(219, 223), ('[', '\\\\', ']', "\\'"), '{|}"'):
    print "    %d: [true, '%s', '%s']," % (code, low, upp)
for code, key in zip(range(33, 41), ["PageUp", "PageDown", "End", "Home", "Left", "Up", "Right", "Down"]):
    print "    %d: [false, \"%s\"]," % (code, key)
print "}"
print

print "var webKitKeyMap = object(baseKeyMap)"
for code, low, upp in zip(range(186, 190), ";=,-", ":+<_"):
    print "webKitKeyMap[%d] = [true, '%s', '%s']" % (code, low, upp)
print

print "var geckoKeyMap = object(baseKeyMap)"
for code, low, upp in zip([59, 61, 188, 109], ";=,-", ":+<_"):
    print "geckoKeyMap[%d] = [true, '%s', '%s']" % (code, low, upp)
print

print "var macGeckoKeyMap = object(geckoKeyMap)"
print "geckoKeyMap[107] = [true, undefined, '+']"
print

print """var keyMap;

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
"""
