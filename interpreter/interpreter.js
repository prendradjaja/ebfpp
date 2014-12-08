/**
 * @file    interpreter.js
 * @author  John Wilkey
 *
 * @brief   This file implements the interpretation of BF code handed to it by
 *          the interface.js file.
 */
session = null;

/**
 * Initialize a new session.
 */
function initSession(code)
{
    session = {
        "tokens" : code,
        "pointer" : 0,
        "memory" : Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0),
        "pc": 0,
        "pc_mark": new Array()
    }

    tokens = session.tokens
    memory = session.memory
    pc_mark = session.pc_mark
}

/**
 * @brief Run the interpreter on the given input.
 * 
 * @param   code    Code to interpret.
 */
function interpret(step)
{
    isRunning(true);
    while(true) {
        var inst = tokens[session.pc]
        switch (inst.type) {
            case 'bf_command':
                interpret_bf_command(inst);
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
                isRunning(false);
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
            writeToOutput(
                String.fromCharCode(memory[session.pointer]));
            session.pc++;
            break;
        case ']':
            new_pc = pc_mark.pop()
            if(memory[session.pointer] > 0) {
                session.pc = new_pc;
                break;
            }
            session.pc++;
            break;
        case '[':
            pc_mark.push(session.pc);
            session.pc++;
            break;
    }
}
