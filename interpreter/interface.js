/**
 * @file interface.js
 *
 * Interpreter GUI logic.
 */

var hasInit = false     // True if interpreter session has been created.
var debug = false;      // True to enable more verbose debugging output.
var timerInterval;      // Used to set and clear timer interval for Debug button.
var DBG_INTERVAL = 25   // 25ms 'animation' delay for dbg() (The Debug handler).
var isRunning = false;  // Whether or not debugger is running.
var inputOffset = 0;    // Offset into char array of user input pane. 

/** Handle change in screen size */
function sizeChange()
{
    updateDisplay(session);
}

/**
 * Called from body.onload DOM event. Put anything that you want to run before
 * the interpreter loads in here. Currently used to assign event handlers to 
 * debugger buttons and runs animation events for the DOM elements.
 */
function init()
{
    // Pretty animation for onload
    $("#in_code_div").animate({opacity:1},1200,function() {})
    $("#input_div").animate({opacity:1},1200,function() {})
    if(debug) {
        $("#debug_area").animate({opacity:1},1200,function() {})
    }

    // Set up button handlers and whatnot. 
    var id_run = document.getElementById('run');
    var id_dbg= document.getElementById('dbg');
    var id_restart = document.getElementById('restart');
    var id_step = document.getElementById('step');
    var id_sam = document.getElementById('sample1');
    var id_sam2 = document.getElementById('sample2');
    var id_sam3 = document.getElementById('sample3');
    var id_sam4 = document.getElementById('sample4');
    var id_sam5 = document.getElementById('sample5');
    var id_res = document.getElementById('restartHard');
    var code_win = document.getElementById('in_code');
    code_win.addEventListener('keyup', checkInput, false);
    id_sam.addEventListener('click', function(){loadSample(1)}, false);
    id_sam2.addEventListener('click', function(){loadSample(2)}, false);
    id_sam3.addEventListener('click', function(){loadSample(3)}, false);
    id_sam4.addEventListener('click', function(){loadSample(4)}, false);
    id_sam5.addEventListener('click', function(){loadSample(5)}, false);
    id_restart.addEventListener('click', restart, false);
    id_res.addEventListener('click', hardRestart, false);

    running(false);
    checkInput();   
}

/** Enable or disable debugger buttons depending on state. */
function checkInput()
{
    if(isRunning) { return; }
    var id_run = document.getElementById('run');
    var id_dbg= document.getElementById('dbg');
    var id_step = document.getElementById('step');
    var id_cmp = document.getElementById('compile');

    if(readFromCodeWindow().length > 0) {
        id_run.addEventListener('click', run, false);
        id_dbg.addEventListener('click', dbg, false);
        id_step.addEventListener('click', step, false);
        id_cmp.addEventListener('click', compileAST, false);
        id_run.setAttribute("style", "color:#059BD8; cursor: normal;");
        id_dbg.setAttribute("style", "color:#059BD8; cursor: normal;");
        id_step.setAttribute("style", "color059BD8; cursor: normal;");
        id_cmp.setAttribute("style", "color059BD8; cursor: normal;");
    } else {
        id_run.setAttribute("style", "color:#e3e3e3; cursor:default;")
        id_dbg.setAttribute("style", "color:#e3e3e3; cursor:default;")
        id_step.setAttribute("style", "color:#e3e3e3; cursor:default;")
        id_cmp.setAttribute("style", "color:#e3e3e3; cursor:default;")
        id_run.removeEventListener("click", run, false);
        id_step.removeEventListener("click", step, false);
        id_dbg.removeEventListener("click",dbg, false);
        id_cmp.removeEventListener("click",compileAST, false);
    }
}

/** Remove compiled code window. */
function removeCompiledCode()
{
     $('#compile_div').fadeOut(300); 
     $('textarea#compiled').val(''); 
}

/** Display compiled version of input code. Don't actually run code. */
function compileAST()
{
    try {
        var compiledRaw = compile(readFromCodeWindow());
    } catch(err) {
        signal(err,"notify");
        return;
    }
    var vis = $("#compile_div").css('display');
    if(vis === 'none') {
        $("#compile_div").fadeIn(600);
    }
    document.getElementById('compiled').value = 
        _.map(compiledRaw,function(x){
            return x.bf_code}).join("").replace(/#/g,"");
}

/** 
 * Handler for the run action. Runs the interpreter on the given code. run()
 * does not provide interactivity while the code runs and will not stop at
 * breakpoints, use dbg() for that functionality. 
 */ 
function run()
{
    newSession();
    sigRun(false);
    interpret({});
}

/** 
 * Handler for the debug action. dbg() differs from run() in that it:
 * (1) Animates the code as it reads it and (2) obeys (i.e., stops at) break
 * points (run() ignores breakpoints). 
 */
function dbg()
{
    step();
    setTimeout(function() {
        timerInterval = setInterval(step, DBG_INTERVAL);
    }, 1000);
}

/** Resume from a breakpoint in debug mode. */
function continueFromBreak()
{
    signal("Running", "info");
    timerInterval = setInterval(step, DBG_INTERVAL);
}


/**
 * Construct a new session. This is called in response to either 
 * the run, step, or debug buttons being pressed after loading new code.
 */          
function newSession()
{
    session = null;
    try {
        initSession(compile(readFromCodeWindow()));
    } catch(err) {
        signal(err, 'notify');
        sigAbrt();
    }
    hasInit = true;
}

/** Abort session. Start everything over */
function sigAbrt()
{
    clearInterval(timerInterval);
    updateDisplay(session);
    running(false);
    signal("","none");
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
        interpret({'step':true, 'dbg':true});
    } else {
        newSession();
        sigResume()
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

/** Return the next character from the input character array */
function readFromInput()
{
    var allInput = document.getElementById('input').innerHTML;
    var div = document.createElement("div")
    div.innerHTML = allInput;
    var bareInput = div.textContent
    bareInput = bareInput.substr(inputOffset, bareInput.length);

    if (bareInput.length > 0) {
        updateInputDisp();
        return allInput.charCodeAt(inputOffset++);
    } else {
        var content = prompt("Enter a single character input")
        if(content === null) { sigAbrt(); return; }
        var c = content[0]
        return c.charCodeAt(0)
    }
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
        var j = i < 0 ? 256+i : i % 256;
        var e = '' + datastore.memory[j]
        var f = '000'.concat(e).substr(e.length)
        if(j == datastore.pointer) { resStr += '<span>' + f + '</span>' }
        else { resStr += f }
        resStr += '&nbsp'
        index = 
            (j == datastore.pointer)
            ? '<span style="color:blue">'+'000'.concat(j.toString()).substr(j.toString().length)+'</span>'
            : '000'.concat(j.toString()).substr(j.toString().length)
        indexStr += index+'&nbsp';
    }

    slots = Math.floor(inst.offsetHeight/30)
    var count = 0;
    var used = session.pc < slots ? session.pc : slots;
    var instructions = 
        _.map(
            session.tokens.slice(session.pc-used,session.pc+slots),
            function(x) { return session.pc-used+(count++) + ': '+ printEBF(x) + '<br>' }
        );
    instructions.splice(used,0,'<span>');
    instructions.splice(used+2,0,'</span>');
    for(var i = used; i<slots; i++) {
        instructions.splice(0,0,'<br>');
    }
    inst.innerHTML = instructions.join("")
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
    clearInterval(timerInterval);
}

/** Signal a resume from breakpoint. */
function sigResume()
{
    running(true, true);
    updateDisplay(session);
    signal("Running", "info")
}

/** Signal the end of the program. */
function sigTerm()
{
    clearInterval(timerInterval);
    signal("DONE", "blue")
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
    if(datastore === null) { return; }
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
          '<tr class="head_row"><td><b>Symbol</b></td><td><b>Value</b></td>'+
          '<td><b>Kind</b></td></tr>'
    for(var v in session.vars) {
        var varVal = session.memory[parseInt(v)]
        loc_table.innerHTML += 
            '<tr><td>'+session.vars[v]+'</td>'
            +'<td>'+varVal+'</td>'+'<td>Variable</td></tr>';
    }
    for(var m in session.macros) {
        var macro = session.macros[m]
        var macroString = ""
        var count = 0;

        for(var inst in macro.body) {
            var hasSub = macro.body[inst].instruction.cmd;
            if(hasSub === undefined) {
                macroString += macro.ebf_code
                break;
            } else {
                macroString += hasSub
            }
            console.log(macroString)
            if(++count > 10) { break; }
        }
        loc_table.innerHTML += 
            '<tr><td>'+m+'</td>'
            +'<td>'+macroString+((count > 10)?"...":"")+
            '</td>'+'<td>Macro</td></tr>';
    }
    for(var s in session.structs) {
        var members = session.structs[s].member_names;
        var memberStr = ""
        var count = 0;
        for(var n in members) {
            memberStr+=members[n]+'&nbsp';
            if(++count > 10) { break; }
        }

        loc_table.innerHTML += 
            '<tr><td>'+s+'</td>'
            +'<td>{ '+memberStr+((count > 10)?"...}":" }")+
            '</td>'+'<td>Struct</td></tr>';
    }
    for(var a in session.arrays) {
        var arrWeAreAt = session.atArrIndex == null ? undefined : session.atArrIndex.name
        var arrIndex = session.atArrIndex == null ? undefined : session.atArrIndex.index
        var members = session.arrays[a].values
        var memberStr = ""
        var count = 0;

        for(var n in members) {
            if(count == arrIndex && arrWeAreAt == a) {
                memberStr+='<span style="background:yellow">{';
                for(var i in members[n]) {
                    if(parseInt(i) == session.atStrIndex) {
                        memberStr += '<span style="color:red; text-decoration:underline;font-size:16px;">'+members[n][i]+'</span>' 
                    } else {
                        memberStr += members[n][i]
                    }
                    if(parseInt(i) < members[n].length-1) {memberStr+=','}
                }
                memberStr += '}' + '</span>&nbsp';
            } else {
                memberStr+= '{'+members[n]+'}&nbsp';
            }
            if(++count > 10) { break; }
        }
        loc_table.innerHTML += 
            '<tr><td>'+a+'</td><td>'
            +(members.type === 'def_array_size' ? '[&nbsp]' : 
            '[&nbsp'+memberStr+((count > 10)?"...]":" ]"))+
            '</td>'+'<td>Array of '+session.arrays[a].element_type+'</td></tr>';
    }
}

/** Update the input window graphic to reflect current input cursor position. */
function updateInputDisp()
{
    var elem = document.getElementById('input')
    var x = elem.innerHTML;
    if(x.indexOf("<span") == -1) { x = "<span contenteditable='false'></span>"+x; }
    var loc = x.indexOf("</span>");
    var y = x.substr(0,loc) + x.substr(loc+7,1)+"</span>"
        +x.substr(loc+8,x.length)
    elem.innerHTML = y;
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
    isRunning = y;
    
    var runBtn  = document.getElementById("run")
    var contBtn = document.getElementById('continue');
    var reldBtn = document.getElementById('restart')
    var dbgBtn  = document.getElementById('dbg');
    var stepBtn = document.getElementById('step');
    var cmpBtn = document.getElementById('compile');

    if (y) {
        reldBtn.innerHTML = "STOP"
        document.getElementById("in_code").style.background = "#eee";
        document.getElementById("in_code").setAttribute("readonly", "true")
        contBtn.removeAttribute("style");
        contBtn.addEventListener("click", continueFromBreak, false);
        reldBtn.setAttribute("style", "color:#059BD8; cursor: normal;");
        runBtn.setAttribute("style", "color:#e3e3e3; cursor:default;")
        cmpBtn.setAttribute("style", "color:#e3e3e3; cursor:default;")
        runBtn.removeEventListener("click", run, false);
        cmpBtn.removeEventListener("click", compileAST, false);
        dbgBtn.setAttribute("style", "color:#e3e3e3; cursor:default;")
        dbgBtn.removeEventListener("click", dbg, false);
        var proc_style = document.getElementById('proc_env').style.display;
        if(!proc_style || proc_style === 'none') {
            $("#proc_env").css('display', 'block');
            $(".content").animate({width:'37%'},200,function() {})
            $("#proc_env").delay(200).animate({opacity:1},500,function() {})
        }
    } else {
        contBtn.removeEventListener("click", continueFromBreak, false);
        contBtn.setAttribute("style", "color:#e3e3e3; cursor: default;");
        document.getElementById("in_code").removeAttribute("readonly")
        document.getElementById("in_code").style.background = "#fff";
        runBtn.removeEventListener("click", restart, false);
        stepBtn.removeEventListener("click", step, false);
        stepBtn.setAttribute("style", "color:#e3e3e3; cursor:default;")

        setTimeout(function () {
            checkInput();
            signal("","none");
        }, 1000);
        reldBtn.setAttribute("style", "color:#e3e3e3; cursor: default;");
        if(document.getElementById('proc_env').style.display === 'block') {
            $("#proc_env").animate({opacity:0},300,function() {
                $(".content").animate({width:'97%'},200,function() {
                    $("#proc_env").css('display', 'none');})})
        }
        document.getElementById('input').innerHTML = 
            document.getElementById('input').textContent;
        inputOffset = 0;
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
    } else if(lv === "blue") {
        x.style.backgroundColor = "blue";
        x.style.color = "white"
    } else {
        x.style.backgroundColor = "#eee"
        x.style.color = "black"
    }
}
