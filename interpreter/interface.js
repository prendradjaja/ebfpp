﻿/**
 * @file interface.js
 *
 * Interpreter GUI logic.
 */

/** True if interpreter session has been created. */
var hasInit = false

/** True if running in debug mode (enables verbose output). */
var debug = false;

/** Handle change in screen size */
function sizeChange()
{
    updateDisplay(session);
}

/**
 * Called from body.onload DOM event. Used to initialize event handlers
 * and anything you want to run before the interpreter runs. 
 */
function init()
{
    // Pretty animation for onload
    $("#in_code_div").animate({opacity:1},1200,function() {})
    $("#input_div").animate({opacity:1},1200,function() {})
    if(debug) {
        $("#debug_area").animate({opacity:1},1200,function() {})
    }

    var id_run = document.getElementById('run');
    var id_dbg= document.getElementById('dbg');
    var id_restart = document.getElementById('restart');
    var id_step = document.getElementById('step');
    var id_sam = document.getElementById('sample1');
    var id_sam2 = document.getElementById('sample2');
    var id_cont = document.getElementById('continue');
    var id_res = document.getElementById('restartHard');
    var code_win = document.getElementById('in_code');
    code_win.addEventListener('keyup', checkInput, false);
    id_sam.addEventListener('click', function(){loadSample(1)}, false);
    id_sam2.addEventListener('click', function(){loadSample(2)}, false);
    id_restart.addEventListener('click', restart, false);
    id_res.addEventListener('click', hardRestart, false);
    running(false);
    checkInput();
}

/** Enable running of interpreter functions if possible. */
function checkInput()
{
    var id_run = document.getElementById('run');
    var id_dbg= document.getElementById('dbg');
    var id_step = document.getElementById('step');

    if(readFromCodeWindow().length > 0) {
        id_run.addEventListener('click', run, false);
        id_dbg.addEventListener('click', dbg, false);
        id_step.addEventListener('click', step, false);
        id_run.setAttribute("style", "color:#059BD8; cursor: normal;");
        id_dbg.setAttribute("style", "color:#059BD8; cursor: normal;");
        id_step.setAttribute("style", "color059BD8; cursor: normal;");
    } else {
        id_run.setAttribute("style", "color:#e3e3e3; cursor:default;")
        id_dbg.setAttribute("style", "color:#e3e3e3; cursor:default;")
        id_step.setAttribute("style", "color:#e3e3e3; cursor:default;")
        id_run.removeEventListener("click", run, false);
        id_step.removeEventListener("click", step, false);
        id_dbg.removeEventListener("click",dbg, false);
    }
}

/** Handler for the run action.  */ 
function run()
{
    newSession();
    sigRun(false);
    interpret({});
}

/** Handler for the debug action. */
function dbg()
{
    newSession();
    sigRun(true);
    interpret({});
}
    

/**
 * Construct a new session. This is called in response to either 
 * the run or step buttons being pressed after loading new code.
 */          
function newSession()
{
    session = null;
    initSession(compile(readFromCodeWindow()));
    hasInit = true;
}

/** Resume from a breakpoint.  */
function contin()
{
    sigResume();
    interpret();
}

/** Abort session. Start everything over */
function sigAbrt()
{
    running(false);
    hasInit = false;
    session = null;
}

/** Hander for the restart action. */
function restart()
{
    sigAbrt();
}

/** Reset everything (i.e., clear program and all other panes. */
function hardRestart()
{
    cls(true);
    location.reload(true);
}

/** Handler for the STEP button. */
function step()
{
    if (hasInit) {
        sigResume();
        interpret({'step':true});
    } else {
        sigResume()
        newSession();
        interpret({'step':true});
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
    checkInput();
}

/**
 * Write to the output window.
 * 
 * @param   msg     Message to write to output pane.
 */
function writeToOutput(msg)
{
    var vis = $("#output_div").css('display');
    if(msg !== undefined) {
        if(vis === 'none') {
            $("#output_div").fadeIn(600);
        }
        if (msg === null) { console.log("TRUE"); }
        document.getElementById('output').value += msg;
    } else {
        if(vis === 'block') { $("#output_div").fadeOut(300); }
        $("textarea#output").val("");
    }
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
        document.getElementById('input').value = "";
    }
    signal("", "none")
    document.getElementById('output').value = "";
    setPtr(0);
}

/** Read the contents of the code box and return as a string array  */
function readFromCodeWindow()
{
    return document.getElementById('in_code').value;
}

/** Read the contents of the input box and return as a string array */
function readFromInput()
{
    return document.getElementById('input').value;
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
    inst_1.innerHTML = nextInst === undefined ? 'NONE' : printEBF(nextInst)

    var resStr = ""
    var indexStr = ""

    var slots = Math.floor(mmap.offsetWidth/(65));
    for (i = datastore.pointer-slots; i < datastore.pointer+slots; i++) {
        var j = i < 0 ? 256+i : i;
        var e = '' + datastore.memory[j]
        var f = '000'.concat(e).substr(e.length)
        if(j == datastore.pointer) { resStr += '<span>' + f + '</span>' }
        else { resStr += f }
        resStr += '&nbsp'
        index = '000'.concat(j.toString()).substr(j.toString().length)
        indexStr += index+'&nbsp';
    }

    var used = session.pc < 2*slots ? session.pc : 2*slots;
    var instructions = 
        _.map(
            session.tokens.slice(session.pc-used,session.pc+2*slots),
            printEBF
        );
    instructions.splice(used,0,'<span>');
    instructions.splice(used+2,0,'</span>');
    for(var i = used; i<2*slots; i++) {
        instructions.splice(0,0,'_');
    }
    inst.innerHTML = instructions.join(" ")
    mmap.innerHTML = resStr+'<br>'+indexStr;
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
    running(true, true);
    signal("Running", "info")
}

/** Signal the end of the program. */
function sigTerm()
{
    signal("DONE", "info")
    running(false);
    hasInit = false;
    session = null;
}

/** 
 * Signal that the interpreter is running. 
 *
 * @param   dbg     True if running in debugger mode.
 * */
function sigRun(dbg)
{
    if(dbg) {
        signal("Running", "info")
        running(true, true);
    } else { 
        signal("Running", "info")
        running(true, false);
    }
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
    updateLocDisp(datastore);
}

/**
 * Updates the locals pane
 *
 * @param   session     Current interpreter session object.
 */
function updateLocDisp(session)
{
    var loc_table = document.getElementById('locals');
    loc_table.innerHTML = 
          '<colgroup><col span="1" style="width:25%"></colgroup>'+
          '<tr class="head_row"><td><b>Symbol</b></td><td><b>Value</b></td></tr>'
    for(var v in session.vars) {
        var varVal = session.memory[parseInt(v)]
        loc_table.innerHTML += 
            '<tr><td>'+session.vars[v]+'</td>'
            +'<td>'+varVal+'</td></tr>';
    }
}

/**
 * Set GUI indicators that the program is running or not.
 *
 * @param   y       True if interpreter session is running, false otherwise.
 * @param   debug   True if running in debugger mode.
 */
function running(y, debug)
{
    if(y && !debug) { return; }

    var runBtn = document.getElementById("run")
    var contBtn = document.getElementById('continue');
    var reldBtn = document.getElementById('restart')
    var dbgBtn = document.getElementById('dbg');

    if (y) {
        reldBtn.innerHTML = "STOP"
        document.getElementById("in_code").style.background = "#eee";
        document.getElementById("in_code").setAttribute("readonly", "true")
        contBtn.removeAttribute("style");
        contBtn.addEventListener("click", contin, false);
        reldBtn.setAttribute("style", "color:#059BD8; cursor: normal;");
        runBtn.setAttribute("style", "color:#e3e3e3; cursor:default;")
        runBtn.removeEventListener("click", run, false);
        dbgBtn.setAttribute("style", "color:#e3e3e3; cursor:default;")
        dbgBtn.removeEventListener("click", dbg, false);
        var proc_style = document.getElementById('proc_env').style.display;
        if(!proc_style || proc_style === 'none') {
            $("#proc_env").css('display', 'block');
            $(".content").animate({width:'49%'},200,function() {})
            $("#proc_env").delay(200).animate({opacity:1},500,function() {})
        }
    } else {
        contBtn.removeEventListener("click", contin, false);
        contBtn.setAttribute("style", "color:#e3e3e3; cursor: default;");
        document.getElementById("in_code").removeAttribute("readonly")
        document.getElementById("in_code").style.background = "#fff";
        runBtn.removeEventListener("click", restart, false);
        runBtn.addEventListener("click", run, false);
        runBtn.setAttribute("style", "color:#059BD8; cursor: normal;");
        dbgBtn.addEventListener("click", dbg, false);
        dbgBtn.setAttribute("style", "color:#059BD8; cursor: normal;");
        reldBtn.setAttribute("style", "color:#e3e3e3; cursor: default;");
        if(document.getElementById('proc_env').style.display === 'block') {
            $("#proc_env").animate({opacity:0},300,function() {
                $(".content").animate({width:'97%'},200,function() {
                    $("#proc_env").css('display', 'none');})})
        }
    }
}

/**
 * Pretty print EBF++ instruction
 *
 * @param   inst    Instruction to print
 */
function printEBF(inst)
{
    switch(inst.type) {
        case 'bf_command':
            return inst.cmd;
        case 'def_var':
            return inst.ebf_code;
        default:
            return inst.ebf_code;
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
    x.innerHTML = msg || "Input Program"

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
