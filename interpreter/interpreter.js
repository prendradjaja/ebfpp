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
        "vars":             new Array(),
        "varOffset":        0,
        "macros":           new Array(),
        "inWinOff":         0,
        "memory":           Array.apply(null, new Array(256))
                            .map(Number.prototype.valueOf, 0)
    }
    tokens  = session.tokens
    memory  = session.memory
    bracketPcStack  = session.bracketPcStack
    macroPcStack = session.macroPcStack
    vars    = session.vars
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
        var inst = tokens[session.pc]
        switch (inst.type) {
            case 'bf_command':
                interpret_bf_command(inst);
                break;
            case 'multiplier':
                interpret_multiplier(inst);
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
                handlePrintStr(inst.string);
                session.pc++;
                break;
            case 'l_paren':
                handleLeftP();
                session.pc++;
                break;
            case 'r_paren':
                handleRightP();
                session.pc++;
                break;
            // TODO: Implement ++ instructions here.
            default:
                throw new Error("ERR No command attached to " + inst.type);
        }
        updateDisplay({
            "pc" : session.pc, 
            "tokens": tokens, 
            "memory": memory, 
            "pointer": session.pointer
        });

        if (session.pc >= tokens.length || step) {
            if (session.pc >= tokens.length) {
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
    //TODO Implement me
    throw new ("ERR_NOT_IMPLEMENTED");
}

/**
 * Handle the print string instruction.
 *
 * @param   string  String to print.
 */
function handlePrintStr(string)
{
    //TODO Implement me
    throw new ("ERR_NOT_IMPLEMENTED");
}

/** Handle Left paren instruction.  */
function handleLeftP()
{
    //TODO Implement me
    throw new ("ERR_NOT_IMPLEMENTED");
}

/** Handle right paren instruction.  */
function handleRightP()
{
    //TODO Implement me
    throw new ("ERR_NOT_IMPLEMENTED");
}

/**
 * Move memory pointer to offset from start of macro.
 *
 * @param   offset  Non-negative offset from start of macro.
 */
function handleGoOffset(offset)
{
    session.pointer = macroPcStack[macroPcStack.length-1].memLoc
}

/**
 * Define a macro.
 *
 * @param   name    Name of macro.
 * @param   body    Code body for macro.
 */
function handleDefMacro(name, body)
{
    macros[name] = body;
}

/**
 * Invoke macro.
 *
 * @param   name    Name of macro.
 */
function handlePutMacro(name)
{
    macroPcStack.push({pc: session.pc,memLoc:session.pointer}); 
    session.pc = 0;
    interpret(false, macros[name]);
    session.pc = macroPcStack.pop().pc;
}

/**
 * Handle de-alloc of variable. Variables are removed in FIFO order.
 *
 * @param   name    Name of variable being removed.
 */
function handleDelVar(name)
{
    if(vars.pop(name) !== name) {
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
    session.pointer = vars.indexOf(name) + session.varOffset;
}

/**
 * Handle at_var instruction.
 *
 * @param   name    Name of variable we're indexing to.
 */
function handleAtVar(name)
{
    session.varOffset = session.pointer - vars.indexOf(name)
}

/**
 * Handle at_offset instruction.
 *
 * @param   offset  Offset to index to.
 */
function handleAtOff(offset)
{
    // TODO: Implement me
    throw new Error("ERR_NOT_IMPLEMENTED");
}

/**
 * Handle variable definition instruction. 
 *
 * @param   name    Variable name.
 */
function handleDefVar(name)
{
    vars.push(name);
}

function interpret_bf_command(inst) {
    switch(inst.cmd) {
        case '+':
            var old = memory[session.pointer]
            var newVal = old == 255 ? 0 : old + 1;
            memory[session.pointer] = newVal
            session.pc++;
            break;
        case '-':
            var old = memory[session.pointer];
            var newVal = old == 0 ? 255 : old-1
            memory[session.pointer] = newVal
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
                memory[session.pointer] = inputWinContent.charCodeAt(session.inWinOff++);
            } else {
                var content = prompt("Enter a single character input")
                var c = content[0]
                memory[session.pointer] = c.charCodeAt(0)
            }
            session.pc++;
            break;
        case '.':
            writeToOutput(String.fromCharCode(memory[session.pointer]));
            session.pc++;
            break;
        case ']':
            newPc = bracketPcStack.pop()
            if(memory[session.pointer] > 0) {
                session.pc = newPc;
                break;
            }
            session.pc++;
            break;
        case '[':
            bracketPcStack.push(session.pc);
            session.pc++;
            break;
    }
}

/** Deals with multiplier for BF commands.
  * @param inst     should be multiplier type. */
function interpret_multiplier(inst) {
    times = inst.times;
    var i = 0;
    var old_pc = session.pc;
    var node;
    while (i < times) {
        node = {'cmd': inst.cmd};
        interpret_bf_command(node);
        i++;
    }
    session.pc = old_pc;
    session.pc++;
}