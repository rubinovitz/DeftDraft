function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

function setCaret(input, pos) {
    setSelectionRange(input, pos, pos);
}    

function getCaret(el) {
    if (el.selectionStart) {
        return el.selectionStart;
    } else if (document.selection) {
        el.focus();

        var r = document.selection.createRange();
        if (r == null) {
            return 0;
        }

        var re = el.createTextRange(),
            rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);

        return rc.text.length;
    } 
    return 0;
}

// saved buffer
var sbuffer = new Buffer('', 0);
var buffers = [sbuffer];
var deft = document.getElementById("deft");
var current = 0;

function Buffer(text, cursor) {
    this.text = text; this.cursor = cursor;
}

Buffer.prototype.set = function() {
    deft.value = this.text;
    setCaret(deft, this.cursor);
}

Buffer.prototype.toString = function() {
    return this.cursor + ":" + this.text;
}

function getBuffer() {
    return new Buffer(deft.value, getCaret(deft));
}

function commit() {
    sbuffer = getBuffer();
    buffers = [sbuffer];
    current = 0;
}

function save() {
    buffer = getBuffer();
    buffers[current] = buffer;
}

function scratch() {
    save();
    current = buffers.length;
    buffers.push(sbuffer);
    sbuffer.set();
}

function right() {
    save();
    current = (current + 1) % buffers.length;
    buffers[current].set();
}

function left() {
    save();
    current = current == 0 ? (buffers.length - 1) : current - 1;
    buffers[current].set();
}


var stack_list = [[]];
var stack_pos = [0];
var current_stack = 0;
var saved = "";
var current_option = "";


function display_stack() {
    var html = "";
    for (var i = 0; i < buffers.length; i++) {
        html += buffers[i].toString();
        html += "<br />"
    }
    document.getElementById("buffers").innerHTML = html;
}

// cycle stacks left
Mousetrap.bind('alt+s', function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        // internet explorer
        e.returnValue = false;
    }

    commit();
    display_stack();
});

Mousetrap.bind('alt+h', function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        // internet explorer
        e.returnValue = false;
    }

    left();

    display_stack();
});

//cycle stacks right
Mousetrap.bind('alt+l', function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        // internet explorer
        e.returnValue = false;
    }
    right();

    display_stack();
});

Mousetrap.bind('alt+space', function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        // internet explorer
        e.returnValue = false;
    }

    scratch();
    display_stack();
});



