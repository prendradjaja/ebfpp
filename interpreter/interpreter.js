/**
 * @file    interpreter.js
 * @author  John Wilkey
 *
 * This file implements the interpretation of BF code handed to it by
 * the interface.js file.
 */

/** Contains an interpreter session. Null until initSession() is called. */
session = null;

/** 
 * Initialize a new interpreter session. 
 *
 * @param   code    Input AST of EBF++ program.
 */
function initSession(code)
{
    session = {
        "tokens" :          code,
        "pointer" :         0,
        "pc":               0,
        "bracketPcStack":   new Array(),
        "macroPcStack":     new Array(),
        "savedTokens":      new Array(),
        "vars":             new Array(),
        "macros":           new Array(),
        "inWinOff":         0,
        "savedPcStack":     new Array(),
        "memory":           Array.apply(null, new Array(256))
                            .map(Number.prototype.valueOf, 0)
    }
}

/**
 * Run the interpreter. Behavior of the interpreter is determined by the step
 * argument. 
 *
 * @param   step    True if user is 'step'ing through code. Interpret next 
 *                  instruction and terminate. False to interpret
 *                  entire program, equivalent of 'run'ing program. 
 * @param   macro   Code body of a macro or undefined if we're not interpreting
 *                  a macro.
 */
function interpret(step, macro)
{
    sigRun();
    while(true) {
        var inst = session.tokens[session.pc]
        switch (inst.type) {
            case 'bf_command':
                interpret_bf_command(inst);
                break;
            case 'multiplier':
                handleMult(inst);
                session.pc++;
                break;
            case '#':
                sigBreak(session);
                session.pc++;
                return;
            case 'def_var':
                handleDefVar(inst.name);
                session.pc++
                break;  
            case 'at_var':
                handleAtVar(inst.name);
                session.pc++;
                break;
            case 'go_var':
                handleGoVar(inst.name);
                session.pc++
                break;
            case 'dealloc_var':
                handleDelVar(inst.name);
                session.pc++
                break;
            case 'put_macro':
                handlePutMacro(name);
                session.pc++
                break;
            case 'def_macro':
                handleDefMacro(inst.name,inst.body);
                session.pc++;
                break;
            case 'go_offset':
                handleGoOffset(inst.offset);
                session.pc++;
                break;
            case 'at_offset':
                handleAtOff(inst.offset);
                session.pc++;
                break;
            case 'store_str':
                handleStoreStr(inst.string);
                session.pc++;
                break;
            case 'print_str':
                // NOTE that I changed the semantics of this instruction since
                // the given semantics seems (1) Pointless and (2) trivial if
                // implemented in the interpreter versus a compiler.
                // This version seems much more useful in general. It behaves
                // like printf for the beginning of a cell range. 
                // Lets discuss this. 
                handlePrintStr();
                session.pc++;
                break;
            case 'l_paren':
                handleLeftP();
                session.pc++;
                break;
            case 'r_paren':
                handleRightP();
                break;
            // TODO: Implement ++ instructions here.
            default:
                throw new Error("ERR No command attached to " + inst.type);
        }
        updateDisplay(session);
        if (session.pc >= session.tokens.length || step) {
            if (session.pc >= session.tokens.length) {
                if(macro === undefined) {
                    sigTerm();
                }
            }
            break;
        }
    }
}

/**
 * Handle the store string instruction.
 *
 * @param   string  Input string to store.
 */
function handleStoreStr(string)
{
    for(var i in string) {
        session.memory[session.pointer++] = string[i].charCodeAt();
    }
}

/**
 * Handle the multiplier instruction.
 *
 * @param   inst    Object containing instructions.
 */
function handleMult(ob)
{
    session.savedTokens.push(session.tokens);
    session.tokens = compile(ob.bf_code)
    session.savedPcStack.push(session.pc);
    session.pc = 0;
    interpret(false, true);
    session.pc = session.savedPcStack.pop();
    session.tokens = session.savedTokens.pop();
}

/** Handle the print string instruction. */
function handlePrintStr()
{
    var nextChar;
    while((nextChar=String.fromCharCode(session.memory[session.pointer++]))!='\u0000') {
        writeToOutput(nextChar);
    }
}

/** Handle Left paren instruction. */
function handleLeftP()
{
    session.bracketPcStack.push({pc: session.pc, ptr: session.pointer});
    return;
}

/** Handle right paren instruction. */
function handleRightP()
{
    var stackObject = session.bracketPcStack.pop()
    var newPc = stackObject.pc;
    var newPtr = stackObject.ptr;

    if(session.memory[newPtr] > 0) {
        session.pc = newPc;
        session.pointer = newPtr;
        return;
    }
    session.pc++;
    return;
}

/**
 * Move memory pointer to offset from start of macro.
 *
 * @param   offset  Non-negative offset from start of macro.
 */
function handleGoOffset(offset)
{
    session.pointer = session.macroPcStack[session.macroPcStack.length-1].memLoc
}

/**
 * Define a macro.
 *
 * @param   name    Name of macro.
 * @param   body    Code body for macro.
 */
function handleDefMacro(name, body)
{
    session.macros[name] = body;
}

/**
 * Invoke macro.
 *
 * @param   name    Name of macro.
 */
function handlePutMacro(name)
{
    session.macroPcStack.push({pc: session.pc,memLoc:session.pointer}); 
    session.pc = 0;
    interpret(false, session.macros[name]);
    session.pc = session.macroPcStack.pop().pc;
}

/**
 * Handle de-alloc of variable. Variables are removed in FIFO order.
 *
 * @param   name    Name of variable being removed.
 */
function handleDelVar(name)
{
    if(session.vars.pop(name) !== name) {
        throw new Error("Deleted variable didn't match vars array "+name);
    }
}

/**
 * Move pointer to location of a named variable.
 *
 * @param   name    Variable name to go to.
 */
function handleGoVar(name)
{
    session.pointer = session.vars.indexOf(name);
}

/**
 * Handle at_var instruction.
 *
 * @param   name    Name of variable we're indexing to.
 */
function handleAtVar(name)
{
    throw new Error("ERR NOT IMPLEMENTED");
    // TODO: Not sure about this function yet. 
    // session.varOffset = session.pointer - vars.indexOf(name)
}

/**
 * Handle at_offset instruction.
 *
 * @param   offset  Offset to index to.
 */
function handleAtOff(offset)
{
    throw new Error("ERR NOT IMPLEMENTED");
    // TODO: Not sure about this function yet.
    // session.varOffset += offset
}

/**
 * Handle variable definition instruction. 
 *
 * @param   name    Variable name.
 */
function handleDefVar(name)
{
    session.vars.push(name);
}

function interpret_bf_command(inst) {
    switch(inst.cmd) {
        case '+':
            var old = session.memory[session.pointer]
            var newVal = old == 255 ? 0 : old + 1;
            session.memory[session.pointer] = newVal
            session.pc++;
            break;
        case '-':
            var old = session.memory[session.pointer];
            var newVal = old == 0 ? 255 : old-1
            session.memory[session.pointer] = newVal
            session.pc++;
            break;
        case '<':
            var old = session.pointer;
            var newPtr;

            if (old == 0) {
                newPtr = 255;
            } else {
                newPtr = old - 1;
            }

            session.pointer = newPtr;
            session.pc++;
            break;
        case '>':
            var old = session.pointer;
            var newPtr;

            if (old == 255) {
                newPtr = 0;
            } else {
                newPtr = old + 1;
            }

            session.pointer = newPtr;
            session.pc++;
            break;
        case ',':
            var inputWinContent = readFromInput();
            if (inputWinContent.length > 0) {
                session.memory[session.pointer] = inputWinContent.charCodeAt(session.inWinOff++);
            } else {
                var content = prompt("Enter a single character input")
                var c = content[0]
                session.memory[session.pointer] = c.charCodeAt(0)
            }
            session.pc++;
            break;
        case '.':
            writeToOutput(String.fromCharCode(session.memory[session.pointer]));
            session.pc++;
            break;
        case ']':
            newPc = session.bracketPcStack.pop()
            if(session.memory[session.pointer] > 0) {
                session.pc = newPc;
                break;
            }
            session.pc++;
            break;
        case '[':
            session.bracketPcStack.push(session.pc);
            session.pc++;
            break;
    }
}
