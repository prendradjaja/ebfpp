/**
 * @file interpreter.js
 *
 * GUI EBF++ interpreter controller. 
 */

/** True if interpreter session has been created. */
var hasInit = false

/**
 * Called from body.onload DOM event. Used to initialize event handlers
 * and anything you want to run before the interpreter runs. 
 */
function init()
{
    var id_run = document.getElementById('run');
    var id_restart = document.getElementById('restart');
    var id_step = document.getElementById('step');
    var id_sam = document.getElementById('sample1');
    var id_sam2 = document.getElementById('sample2');
    var id_cont = document.getElementById('continue');
    var id_res = document.getElementById('restartHard');
    id_sam.addEventListener('click', function(){loadSample(1)}, false);
    id_sam2.addEventListener('click', function(){loadSample(2)}, false);
    id_run.addEventListener('click', run, false);
    id_restart.addEventListener('click', restart, false);
    id_step.addEventListener('click', step, false);
    id_res.addEventListener('click', hardRestart, false);
    running(false);
}

/** Handler for the run action.  */ 
function run()
{
    cls();
    sigResume();
    newSession();
    interpret(false);
}

/**
 * Construct a new session. This is called in response to either 
 * the run or step buttons being pressed after loading new code.
 */          
function newSession()
{
    initSession(parser.parse(readFromInput()));
    hasInit = true;
}

/** Resume from a breakpoint.  */
function contin()
{
    sigResume();
    interpret(false);
}

/** Hander for the restart action. */
function restart()
{
    cls();
    location.reload();
}

/** Reset everything (i.e., clear program and all other panes. */
function hardRestart()
{
    cls(true);
    location.reload();
}

/** Handler for the STEP button. */
function step()
{
    if (hasInit) {
        sigResume();
        interpret(true);
    } else {
        sigResume()
        newSession();
        interpret(true);
    }
}

/**
 * Load sample programs from a user-selected menu.
 *
 * @param   num     Index of sample file number. Convention: SampleX.txt
 *                  for num X. 
 */
function loadSample(num)
{
    var txt = ''
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.status == 200 && xmlhttp.readyState == 4) {
            txt = xmlhttp.responseText;
            writeToInput(txt);
        }
    };
    xmlhttp.open("GET",'sample'+num+'.txt',true);
    xmlhttp.send();
}

/**
 * Write debugging information to the GUI. This should probably be
 * disabled in production code.
 *
 * @param   msg     Message to write to debug pane.
 */
function debug(msg)
{
    document.getElementById('debug').value += '[ DEBUG ] ' + msg + '\n';
}

/**
 * Write to the program input window. This is normally only used for
 * debugging or loading a program to the interpreter.
 *
 * @param   msg     Message to write to input pane.
 */
function writeToInput(msg)
{
    document.getElementById('in_code').value = msg;
}

/**
 * Write to the output window.
 * 
 * @param   msg     Message to write to output pane.
 */
function writeToOutput(msg)
{
    if (msg === null) { console.log("TRUE"); }
    document.getElementById('output').value += msg;
}

/** Read the output window. */
function readFromOutput()
{
    return document.getElementById('output').value;
}

/**
 * Clear the output panes and memory displays. 
 *
 * @param   hard    If true, all panes are cleared. Otherwise, some are left
 *                  alone.
 */
function cls(hard)
{
    if (hard) {
        document.getElementById('in_code').value = "";
    }

    signal("", "none")
    document.getElementById('output').value = "";
    setPtr(0);
}

/** Read the contents of the input box and return as a string array  */
function readFromInput()
{
    return document.getElementById('in_code').value;
}

/** Change the pointer address indicator  */
function mvPtr(dir, val)
{
    var indicator = document.getElementById('pointer_loc');
    var int_val = parseInt(indicator.innerHTML);
    
    if(dir == '+') { 
        var new_val = int_val + 1
    } else {
        var new_val = int_val - 1
    }
    indicator.innerHTML = new_val;
    updateMemDisp(val)
}

/**
 * Set the pointer to a specified location in the program tape.
 *
 * @param   loc     Program counter location to set breakpoint.
 */
function setPtr(loc)
{
    document.getElementById('pointer_loc').innerHTML = loc;
}

/**
 * Update the memory contents displayed on the screen to the new contents.
 *
 * @param   val         Value of updated cell.
 * @param   datastore   Current interpreter session object.
 */
function updateMemDisp(val, datastore)
{
    var indicator = document.getElementById('ptr_cell');
    var mmap = document.getElementById('mmap');
    var inst = document.getElementById('progviewer');
    var inst_1 = document.getElementById('inst');
    document.getElementById("pc_inf").innerHTML = session.pc
    var nextInst = session.tokens[session.pc]
    inst_1.innerHTML = nextInst === undefined ? 'NONE' : nextInst


    var resStr = ""

    for (i = 0; i < 256; i++) {
        var e = '' + datastore.memory[i]
        var f = '000'.concat(e).substr(e.length)
        if(i == datastore.pointer) {
            resStr += '_' + f + '_'
        }
        else {
            resStr += f
        }
        resStr += '&nbsp&nbsp&nbsp&nbsp&nbsp'
    }

    
    var x = session.tokens.join(" ")
    x = x.substr(0, 2 * session.pc)
        + (x[2 * session.pc] = ' _'
        + x[2 * session.pc] + ' ')
        + x.substr(2 * session.pc+1)
    inst.innerHTML = x;

    var scrollPos = (2 * session.pc / x.length) * inst.scrollLeftMax
    inst.scrollLeft = scrollPos
    mmap.innerHTML = resStr
    indicator.innerHTML = val;
}

/**
 * Signal a breakpoint position.
 *
 * @param   state   Environment state at point of the breakpoint.
 */
function sigBreak(state)
{
    signal("Stopped at breakpoint. PC: " + state.pc, "notify")
}

/** Signal a resume from breakpoint. */
function sigResume()
{
    signal("Running", "info")
}

/** Signal the end of the program. */
function sigTerm()
{
    signal("DONE", "info")
    running(false);
}

/** Signal that the interpreter is running. */
function sigRun()
{
    running(true);
}

/**
 * Update displayed data.
 *
 * @param   datastore   Current interpreter session object.
 */
function updateDisplay(datastore)
{
    setPtr(datastore.pointer);
    updateMemDisp(datastore.memory[datastore.pointer], datastore)
}

/**
 * Set GUI indicators that the program is running or not.
 *
 * @param   y   True if interpreter session is running, false otherwise.
 */
function running(y)
{
    var runButton = document.getElementById("run")
    var contBtn = document.getElementById('continue');
    var reldBtn = document.getElementById('restart')
    
    if (y) {
        reldBtn.innerHTML = "STOP"
        document
            .getElementById("in_code")
            .setAttribute("style", "background:#eee");
        document.getElementById("in_code").setAttribute("readonly", "true")
        contBtn.removeAttribute("style");
        runButton.setAttribute("style", "color:#e3e3e3; cursor:default;")
        runButton.removeEventListener("click", run, false);
        contBtn.addEventListener("click", contin, false);

    } else {
        reldBtn.innerHTML = "Reload"
        runButton.innerHTML = "Run"
        contBtn.removeEventListener("click", contin, false);
        contBtn.setAttribute("style", "color:#e3e3e3; cursor: default;");
        document.getElementById("in_code").removeAttribute("readonly")
        document
            .getElementById("in_code")
            .setAttribute("style", "background:#fff");
        runButton.removeEventListener("click", restart, false);
        runButton.addEventListener("click", run, false);
    }
}

/**
 * Write a message to the signalling area of the GUI.
 *
 * @param   msg     Message to write.
 * @param   lv      Message level (NOTIFY, INFO, NONE)
 */
function signal(msg, lv)
{
    var x = document.getElementById("in_prog_inf")
    x.innerHTML = msg

    if (lv == "info") {
        x.style.backgroundColor = "green";
        x.style.color = "white"
    } else if(lv == "notify") {
        x.style.backgroundColor = "red";
        x.style.color = "white"
    } else {
        x.style.backgroundColor = "#eee"
        x.style.color = "black"
    }
}
