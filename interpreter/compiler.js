/* global require, process, console */
'use strict';

var parser = require('./ebfpp.js');
var fs = require('fs');
var _ = require('underscore');

function main() {
    if (process.argv.length <3) {
        crash_with_error('Need a file to compile. Run with:\n  $ node compiler.js file.ebf');
    }
    var ebfpp_code = fs.readFileSync(process.argv[2], 'utf8'),
        ast = parser.parse(ebfpp_code),
        bf_code = compile(ast);
    console.log(bf_code);
}

var pointer = 0;
// Keeps track of where the pointer goes during the program. This is used
// for variables.

var variables = [];
// A stack (implemented as an array) of the variable names used by the
// program.
// - The index of a variable name is its location in memory.
// - Each new variable is pushed onto the stack.
// - Deallocating a variable pops off the stack.

var macros = {};
// A dictionary mapping macro names to macros.
var macro = named_list('args body');

var paren_stack = [];
// A stack of memory indices used by lparen and rparen.
// - Every time the program enters a () loop, (not a [] loop!) the current
//   memory index is pushed to the stack.
// - Exiting the loop pops off the stack.

var macro_stack = [];
// A stack of macro_frames.
// - Whenever a macro is inserted, a new frame is pushed to the stack.
// - Exiting a macro pops off the stack.
var macro_frame = named_list('anchor arg_dict');
// anchor: The memory index where the pointer was when the macro was invoked.
//     This is used for the ^ (go_offset) command.
// arg_dict: A dictionary mapping argument names to values.

function current_macro_frame() {
    return macro_stack[macro_stack.length - 1];
}

function compile(program) { /*
    program: An array of nodes representing an EBF program.
    returns: The compiled BF output.

    The global variable `pointer` may be changed, according to what happens in
    the program. */
    var output = '';
    for (var i in program) {
        output += compile_node(program[i]);
    }
    return output;
}

function compile_node(node) { /*
    Compile a single AST node, dispatching to the appropriate function */
    switch (node.type) {
        case 'bf_command':  return compile_bf_command(node);
        case 'def_var':     return compile_def_var(node);
        case 'go_var':      return compile_go_var(node);
        case 'at_var':      return compile_at_var(node);
        case 'dealloc_var': return compile_dealloc_var(node);
        case 'l_paren':     return compile_l_paren(node);
        case 'r_paren':     return compile_r_paren(node);
        case 'def_macro':   return compile_def_macro(node);
        case 'put_argument':   return compile_put_argument(node);
        case 'put_macro':   return compile_put_macro(node);
        case 'go_offset':   return compile_go_offset(node);
        case 'at_offset':   return compile_at_offset(node);
        case 'multiplier':  return compile_multiplier(node);
        default:
            crash_with_error('unsupported AST node in code generator: ' +
                    node.type);
    }
}

// Compilation functions for each AST node.
// A compilation function takes in a specific type of AST node and returns BF
// code.

function compile_bf_command(node) {
    if (node.cmd == '<') {
        pointer -= 1;
    } else if (node.cmd == '>') {
        pointer += 1;
    }
    return node.cmd;
}

function compile_def_var(node) {
    variables.push(node.name);
    return '';
}

function compile_go_var(node) {
    var index = variables.indexOf(node.name);
    if (index === -1) {
        crash_with_error('Cannot go to nonexistent variable: ' + node.name);
    }
    return move_pointer(index);
}

function compile_at_var(node) {
    pointer = variables.indexOf(node.name);
    return '';
}

function compile_dealloc_var(node) {
    if (node.name != variables.pop()) {
        crash_with_error('Cannot deallocate nonexistent variable: ' +
                         node.name);
    }
    return '';
}

function compile_l_paren(node) {
    paren_stack.push(pointer);
    return '[';
}

function compile_r_paren(node) {
    return move_pointer(paren_stack.pop()) + ']';
}

function compile_def_macro(node) {
    macros[node.name] = macro(node.args, node.body);
    return '';
}

function compile_put_argument(node) {
    var arg_dict = current_macro_frame().arg_dict;
    if (node.name in arg_dict) {
        return compile(arg_dict[node.name]);
    } else {
        // TODO: make this search up through parents, only giving an error if
        // the argument name is not found in any frame.
        crash_with_error('Bad argument name: ' + node.name);
    }
}

function compile_put_macro(node) {
    var macro = macros[node.name];
    if (macro.args.length !== node.arg_values.length) {
        crash_with_error('Incorrect number of args when trying to put a macro: ' + node.name);
    }
    var arg_dict = _.object(macro.args, node.arg_values);

    macro_stack.push(macro_frame(pointer, arg_dict));
    var body = compile(macros[node.name].body);
    macro_stack.pop();
    return body;
}

function compile_go_offset(node) {
    return move_pointer(current_macro_frame().anchor + node.offset);
}

function compile_at_offset(node) {
    pointer += node.offset;
    return '';
}

function compile_multiplier(node) {
    return repeat_string(node.cmd, node.times);
}

// Helper functions

function move_pointer(destination) { /*
    Returns code for moving the pointer to a given memory index, and
    updates the global pointer variable accordingly.

    destination: The target memory index. */
    var distance = destination - pointer;
    pointer = destination;
    if (distance < 0) {
        return repeat_string('<', -distance);
    } else {
        return repeat_string('>', distance);
    }
}

// Adapted from:
// http://stackoverflow.com/questions/202605/repeat-string-javascript
function repeat_string(string, times) {
    return new Array(times + 1).join(string);
}

function crash_with_error(message) {
    console.error('Error: ' + message);
    process.exit(1);
}


// named_list is adapted from
// http://stackoverflow.com/questions/8291194/how-to-implement-pythons-namedtuple-in-javascript
// TODO: make ast_node use this

function named_list(fieldnamestr) {
    var fields = fieldnamestr.split(' ');
    return function () {
        var arr = arguments;
        if (arr.length !== fields.length) {
            crash_with_error('Tried to instantiate a named_list with the wrong number of arguments.');
        }
        var obj = {};

        for(var i = 0; i < arr.length; i++) {
            obj[fields[i]] = arr[i];
        }

        return obj;
    };
}

main();
