/* global require, process, console */
'use strict';

if (typeof require !== 'undefined') {
    var parser = require('../ebfpp.js');
    var fs = require('fs');
    var _ = require('underscore');
}

function main() {
    var parse_only = false;

    if (process.argv.length <3) {
        crash_with_error('Need a file to compile. Run with:\n  $ node compiler.js file.ebf');
    }
    var ebfpp_code = fs.readFileSync(process.argv[2], 'utf8');
    var ast = create_ast(ebfpp_code);
    if (parse_only) {
        console.log(ast);
    } else {
        compile(ast);
        console.log(ast);
    }
}

var pointer = 0;
// Keeps track of where the pointer goes during the program. This is used
// for variables.

var variables = [];
// A stack (implemented as an array) representing memory allocation.
// - The index of a variable name is its location in memory.
// - Each new variable is pushed onto the stack.
// - Deallocating a variable pops off the stack.
// - At the moment, arrays cannot be deallocated.

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

var struct_types = {};
// A dictionary mapping names of struct types to lists of their member names.

var last_array_access = {array_name: '', index: 0};
// Contains information on the last array access made. This is used for the
// $$ (goto_member) command.

var array_element_types = {};
// A dictionary mapping names of arrays to the names of their element types.

function current_macro_frame() {
    return macro_stack[macro_stack.length - 1];
}

function compile(program) { /*
    program: An array of nodes representing an EBF program.
    returns: The same array, with a few extra fields in each node. The
        following are the most useful:
          - ebf_code
          - bf_code
        There are also:
          - preceding_whitespace
          - raw_ebf_code

    The global variable `pointer` may be changed, according to what happens in
    the program. */
    for (var i in program) {
        compile_node(program[i]);
    }
}

function compile_node(node) {
    node.bf_code = _compile_node(node);
    node.ebf_code = node.raw_ebf_code.replace(/\s/g, '');
}

function _compile_node(node) { /*
    Compile a single AST node, dispatching to the appropriate function */
    switch (node.type) {
        case 'bf_command':  return compile_bf_command(node);
        case 'def_var':     return compile_def_var(node);
        case 'go_var':      return compile_go_var(node);
        case 'at_var':      return compile_at_var(node);
        case 'dealloc_var': return compile_dealloc_var(node);
        case 'l_paren':     return compile_l_paren(node);
        case 'r_paren':     return compile_r_paren(node);
        // case 'def_macro':   return compile_def_macro(node);
        // case 'put_argument':   return compile_put_argument(node);
        // case 'put_macro':   return compile_put_macro(node);
        case 'go_offset':   return compile_go_offset(node);
        case 'at_offset':   return compile_at_offset(node);
        case 'multiplier':  return compile_multiplier(node);
        // case 'def_array_init':  return compile_def_array_init(node);
        // case 'goto_index_static':  return compile_goto_index_static(node);
        // case 'def_struct':  return compile_def_struct(node);
        // case 'goto_member': return compile_goto_member(node);
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
    if (node.cmd === '>') {
        pointer += node.times;
    } else if (node.cmd === '<') {
        pointer -= node.times;
    }
    return repeat_string(node.cmd, node.times);
}

function compile_def_array_init(node) {
    var bf_code = '';
    var member_names = struct_types[node.element_type];
    var member_names_with_pad = member_names.concat('#pad0', '#pad1');
    for (var i in node.values) {
        var struct_values = node.values[i];
        assert(struct_values.length == member_names.length,
               'Tried to initialize array with wrong number of struct members: ' +
               node.name);

        // Add on two dummy "padding" variables to the end of
        var struct_values_with_pad = struct_values.concat(0, 0);
        for (var j in struct_values_with_pad) {
            var value = struct_values_with_pad[j];
            var var_name = construct_illegal_var_name(node.name, i, member_names_with_pad[j]);
            variables.push(var_name);
            var memory_location = variables.indexOf(var_name);
            bf_code += move_pointer(memory_location) + repeat_string('+', value);
        }
    }
    array_element_types[node.name] = node.element_type;
    return bf_code;
}

function compile_goto_index_static(node) {
    last_array_access.name = node.name;
    last_array_access.index = node.index;
    var first_member_name = struct_types[array_element_types[node.name]][0];
    var memory_location = variables.indexOf(
                              construct_illegal_var_name(
                                  node.name, node.index, first_member_name));
    return move_pointer(memory_location);
}

function compile_def_struct(node) {
    struct_types[node.name] = node.member_names;
    return '';
}

function compile_goto_member(node) {
    var name = last_array_access.name;
    var index = last_array_access.index;
    var member_name = node.name;
    var memory_location = variables.indexOf(
                              construct_illegal_var_name(
                                  name, index, member_name));
    return move_pointer(memory_location);
}

// Helper functions

function construct_illegal_var_name(array_name, index, member_name) {
    // This is used to access array elements and their members. These variable
    // names are invalid EBF++ variable names, so there won't be a conflict
    // with user variables.
    // The format of the variable name is: #array.index.member
    return '#' + array_name + '.' + index + '.' + member_name;
}

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

function assert(condition, message) {
    if (!condition) {
        crash_with_error(message);
    }
}


// named_list is adapted from
// http://stackoverflow.com/questions/8291194/how-to-implement-pythons-namedtuple-in-javascript
// TODO: make ast_node use this

// NOTE: this function appears also in ../ebfpp.jison. This is a hacky solution
// right now, fix it later. But if you change it here, change it there too.
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

function create_ast(ebfpp_code) {
    // TODO: recurse into bodies! -- macro definitions have bodies, and macro
    // insertions have values which are really also bodies
    var lines = ebfpp_code.split('\n');
    var parser_output = parser.parse(ebfpp_code);
    var prev_pos = { last_line: 1, last_column: 0, first_line: 1, first_column: 0 };
    var ast = [];
    for (var i in parser_output) {
        var pair = parser_output[i];
        var instruction = pair.instruction;
        TODO1(instruction);
        var position = pair.position;
        instruction.raw_ebf_code = grab_chars(lines, position);
        instruction.preceding_whitespace = grab_chars(lines, blank_space(prev_pos, position));
        ast.push(instruction);
        prev_pos = position;
    }
    return ast;
}

function TODO1(instruction) {
    switch(instruction.type) {
        case 'def_macro':
        case 'put_argument':
        case 'put_macro':
        case 'def_array_init':
        case 'goto_index_static':
        case 'def_struct':
        case 'goto_member':
            crash_with_error('TODO1: ' + instruction.type);
    }
}

function grab_chars(lines, position) {
    var top = position.first_line - 1;
    var bottom = position.last_line - 1;
    var left = position.first_column;
    var right = position.last_column;
    if (top  === bottom) {
        return lines[top].slice(left, right);
    } else {
        var result = lines[top].slice(left) + '\n';
        for (var line_num = top + 1; line_num < bottom; line_num++) {
            result += lines[line_num] + '\n';
        }
        result += lines[bottom].slice(0, right);
        return result;
    }
}

function blank_space(p1, p2) {
    return {first_line: p1.last_line,
            last_line: p2.first_line,
            first_column: p1.last_column,
            last_column: p2.first_column}
}

if (typeof require !== 'undefined' && require.main === module) {
    main();
}
