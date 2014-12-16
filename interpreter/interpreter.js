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
        "arrays":           new Array(),
        "structs":          new Array(),
        "inWinOff":         0,
        "savedPcStack":     new Array(),
        "savedParenTokens": new Array(),
        "memory":           Array.apply(null, new Array(256))
                            .map(Number.prototype.valueOf, 0)
    }
}

/**
 * Run the interpreter. Behavior of the interpreter is determined by the step
 * argument. 
 *
 * @param   opts    Options object. Valid options: 
 *                  'dbg': true for debugger session. 
 *                  'macro': true if we are interpreting a macro.
 *                  'step': true if the step button was pressed. 
 */                  
function interpret(opts)
{
    var wasBreak = false;
    opts = opts || {}
    while(true) {
        var inst = session.tokens[session.pc]
        if(!inst) { return; }
        switch (inst.type) {
            case 'bf_command':
                interpret_bf_command(inst);
                break;
            case 'multiplier':
                execSubCode(inst);
                session.pc++;
                break;
            case 'breakpoint':
                if(opts['dbg'] === true) {
                    session.pc++;
                    sigBreak(session);
                    wasBreak = true;
                    break;
                } else {
                    session.pc++;
                    break;
                }
            case 'def_var':
                handleDefVar(inst.name);
                session.pc++
                break;  
            case 'at_var':
                session.pc++;
                break;
            case 'go_var':
                execSubCode(inst);
                session.pc++
                break;
            case 'dealloc_var':
                handleDelVar(inst.name);
                session.pc++
                break;
            case 'put_macro':
                execSubCode(inst)
                session.pc++
                break;
            case 'def_macro':
                handleDefMacro(inst.name,inst.body);
                session.pc++;
                break;
            case 'go_offset':
                execSubCode(inst);
                session.pc++;
                break;
            case 'at_offset':
                session.pc++;
                break;
            case 'store_str':
                execSubCode(inst);
                session.pc++;
                break;
            case 'print_str':
                execSubCode(inst);
                session.pc++;
                break;
            case 'l_paren':
                handleLeftP(inst);
                session.pc++;
                break;
            case 'r_paren':
                handleRightP(inst);
                break;
            case 'def_array_init':
                session.arrays[inst.name] = inst.values;
                execSubCode(inst)
                session.pc++
                break;
            case 'goto_index_static':
                execSubCode(inst);
                session.pc++
                break;
            case 'goto_index_dynamic':
                execSubCode(inst);
                session.pc++;
                break;
            case 'goto_member':
                execSubCode(inst);
                session.pc++
                break;
            case 'def_struct':
                session.structs[inst.name] = inst
                session.pc++;
                break;
            case 'def_array_size':
                session.arrays[inst.name] = inst;
                session.pc++;
                break;
            case 'put_argument':
                ;
            case 'for_loop':
                ;
            default:
                execSubCode(inst);
                session.pc++;
        }
        updateDisplay(session);
        if(wasBreak) {
            wasBreak = false;
            return;
        }
        if (session.pc >= session.tokens.length || opts['step']===true) {
            if (session.pc >= session.tokens.length) {
                if(opts['macro'] === undefined) {
                    sigTerm();
                }
            }
            break;
        } 
    }
}

/**
 * Execute BF code given by this EBF++ instruction.
 *
 * @param   ob      EBF++ Instruction object. 
 */
function execSubCode(ob)
{
    session.savedTokens.push(session.tokens);
    session.tokens = compile(ob.bf_code)
    session.savedPcStack.push(session.pc);
    
    // savedSession = session;

    session.pc = 0;
    interpret({'macro':true});

    // session = savedSession;    

    session.pc = session.savedPcStack.pop();
    session.tokens = session.savedTokens.pop();
}


/** 
 * Handle Left paren instruction. 
 *
 * @param   inst    EBF++ instruction.
 */
function handleLeftP(inst)
{
    session.bracketPcStack.push(session.pc);
}

/** 
 * Handle right paren instruction.
 * 
 * @param   inst    EBF++ instruction.
 */
function handleRightP(inst)
{
    var newPc = session.bracketPcStack.pop()
    var sliceCode = inst.bf_code.slice(0,-1)
    execSubCode({bf_code: sliceCode});

    if(session.memory[session.pointer] > 0) {
        session.pc = newPc;
        return;
    }
    session.pc++;
    return;
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
            session.memory[session.pointer] = readFromInput();
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
        default:
            throw new Error("ERR_NO_INST " + inst);
    }
}
