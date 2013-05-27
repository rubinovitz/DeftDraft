// saved buffer
var sbuffer = new Buffer('', 0);
var buffers = [sbuffer];
var deft = document.getElementById("deft");
var current = 0;
var commits = 0;

var text = "";
var cursor_pos = 0;
var change_type = "";
var changes = 0;
var d_tx = 0;
var d_cr = 0;

var lc_time = getTime();
var diffs = [];

function getTime() {
    return (new Date).getTime();
}

track_changes = function() {
    now_text = deft.value;
    now_cursor_pos = getCaret(deft);
    change_time = getTime(); 

    d_tx = now_text.length - text.length;
    d_cr = now_cursor_pos - cursor_pos;
    d_t = change_time - lc_time;

    if (now_text == text) {
        change_type = "no change";
    } else if (now_text.length > text.length) {
        if (d_tx == d_cr) {
            change_type = "simple insert";
            diff = ["ins", cursor_pos, now_text.substr(cursor_pos, d_cr), d_t];
            diffs.push(diff);
        } else {
            change_type = "complex insert";
            diff = ["del", cursor_pos, d_cr - d_tx, d_t];
            diffs.push(diff);
            diff = ["ins", cursor_pos, now_text.substr(cursor_pos, d_cr), d_t];
            diffs.push(diff);
        }
    } else if (now_text.length < text.length) {
        if (d_tx == d_cr) {
            change_type = "simple delete";
            diff = ["del", cursor_pos, -d_tx, d_t];
            diffs.push(diff);
        } else {
            change_type = "complex delete";
            diff = ["del", cursor_pos, d_cr - d_tx, d_t];
            diffs.push(diff);
            diff = ["ins", cursor_pos, now_text.substr(cursor_pos, d_cr), d_t];
            diffs.push(diff);
        }
    } else {
        change_type = "substitution";
    }

    changes++;
    text = now_text;
    cursor_pos = getCaret(deft);
    lc_time = change_time;
    status();
};


deft.onmouseup = track_changes;

deft.onkeyup = track_changes;

//deft.oninput = track_changes;

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
    return new Buffer(deft.value.replace(/ +/g, ' '), getCaret(deft));
}

function commit() {
    sbuffer = getBuffer();
    buffers = [sbuffer];
    current = 0;
    commits++;
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

function status() {
    status2();
}

function status1() {
    var html = "Draft: <b>" + (current + 1) + "</b>" + "/" + buffers.length;
    html += " - Commit: <b>" + commits + "</b>";
    document.getElementById("buffers").innerHTML = html;
}

function status2() {
    html = "cursorpos: " + cursor_pos + " change: " + change_type + " d_tx: " + d_tx + " d_cr: " + d_cr;
    document.getElementById("buffers").innerHTML = html;
}

function bind(sc, f) {
    Mousetrap.bind(sc, function(e) {
        if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }
        f();
        status();
    });
}

//bind('ctrl+h', function() { left(); });
bind('ctrl+l', function() { right(); });
bind('ctrl+h', function() { left(); });
//bind('ctrl+l', function() { right(); });

//bind('alt+left', function() { left(); });
//bind('alt+right', function() { right(); });
//bind('alt+up', function() { commit(); });
//bind('alt+down', function() { scratch(); });

bind('ctrl+s', function() { commit(); });
bind('ctrl+space', function() { scratch(); });
