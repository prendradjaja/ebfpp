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
        "tokens" : code,
        "pointer" : 0,
        "memory" :  Array.apply(null, new Array(256))
                    .map(Number.prototype.valueOf,0),
        "pc": 0,
        "pcMark": new Array()
    }

    tokens = session.tokens
    memory = session.memory
    pcMark = session.pcMark
}

/**
 * Run the interpreter. Behavior of the interpreter is determined by the step
 * argument. 
 *
 * @param   step    True if user is 'step'ing through code. Interpret
 *                  only next instruction and terminate. False to interpret
 *                  entire program, equivalent of 'run'ing program. 
 */
function interpret(step)
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
        }
        updateDisplay({
            "pc" : session.pc, 
            "tokens": tokens, 
            "memory": memory, 
            "pointer": session.pointer
        });

        if (session.pc >= tokens.length || step) {
            if (session.pc >= tokens.length) {
                sigTerm();
            }
            break;
        }
    }
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
            var content = prompt("Enter a single character input")
            var c = content[0]
            memory[session.pointer] = c.charCodeAt(0)
            session.pc++;
            break;
        case '.':
            writeToOutput(String.fromCharCode(memory[session.pointer]));
            session.pc++;
            break;
        case ']':
            newPc = pcMark.pop()
            if(memory[session.pointer] > 0) {
                session.pc = newPc;
                break;
            }
            session.pc++;
            break;
        case '[':
            pcMark.push(session.pc);
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
