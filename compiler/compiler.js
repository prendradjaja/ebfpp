/* global require, process, console */
'use strict';

if (typeof require !== 'undefined') {
    var parser = require('../ebfpp.js');
    var util = require('../util.js'); // do the "vars" need to be removed from this and above?
    var fs = require('fs');
    var _ = require('underscore');
}

function main() {
    if (process.argv.length <3) {
        crash_with_error('Need a file to compile. Run with:\n  $ node compiler.js file.ebf');
    }
    var ebfpp_code = fs.readFileSync(process.argv[2], 'utf8');
    var compiler_output = compile(ebfpp_code);
    console.log(generate_bf_code_of_compiled_ast(compiler_output));
}

var PAD_SIZE = 2;
// Constant representing how many spaces of padding are between array
// elements.
// NOTE: While this is written here as a constant, there DOES EXIST code that
// depends on it being 2, so this is kinda crappy anyway. >.<

var pointer;
// Keeps track of where the pointer goes during the program. This is used
// for variables.

var absolute_pointer;
// true if the compiler currently knows exactly where the pointer is. false
// otherwise. In this case, the pointer variable is a RELATIVE position, hence
// this variable's name.

var variables;
// A stack (implemented as an array) representing memory allocation.
// - The index of a variable name is its location in memory.
// - Each new variable is pushed onto the stack.
// - Deallocating a variable pops off the stack.
// - At the moment, arrays cannot be deallocated.

var macros;
// A dictionary mapping macro names to macros.
var macro = named_list('args body');

var paren_stack;
// A stack of memory indices used by lparen and rparen.
// - Every time the program enters a () loop, (not a [] loop!) the current
//   memory index is pushed to the stack.
// - Exiting the loop pops off the stack.

var macro_stack;
// A stack of macro_frames.
// - Whenever a macro is inserted, a new frame is pushed to the stack.
// - Exiting a macro pops off the stack.
var macro_frame = named_list('anchor arg_dict');
// anchor: The memory index where the pointer was when the macro was invoked.
//     This is used for the ^ (go_offset) command.
// arg_dict: A dictionary mapping argument names to values.

var struct_types;
// A dictionary mapping names of struct types to lists of their member names.

var last_array_access;
// Contains information on the last array access made. This is used for the
// $$ (goto_member) command.

var arrays;
// A dictionary mapping array names to arrays.
var array = named_list('element_type length');

function current_macro_frame() {
    return macro_stack[macro_stack.length - 1];
}

var lines;
function compile(program) {
    lines = program.split('\n');
    var ast = parser.parse(program);
    pointer = 0;
    absolute_pointer = true;
    variables = [];
    macros = {};
    paren_stack = [];
    macro_stack = [];
    struct_types = {};
    last_array_access = {array_name: '', index: 0};
    arrays = {};
    return _compile(ast);
}

function compile_file(filename) {
    var ebfpp_code = fs.readFileSync(filename, 'utf8');
    var ast = parser.parse(ebfpp_code);
    return generate_bf_code_of_compiled_ast(_compile(ast));
}

function generate_bf_code_of_compiled_ast(compiled_ast) {
    var bf_code = '';
    for (var i in compiled_ast) {
        bf_code += compiled_ast[i].bf_code;
    }
    return bf_code;
}

var pos_stack = [{ last_line: 1, last_column: 0, first_line: 1, first_column: 0 }];

function _compile(ast) { /*
    The global variable `pointer` may be changed, according to what happens in
    the program. */
    ast = clone(ast);
    var prev_pos = pos_stack[pos_stack.length - 1];
    for (var i in ast) {
        ast[i] = clone(ast[i]);
        var node = ast[i];
        var instruction = node.instruction;
        var position = node.position;
        instruction.raw_ebf_code = grab_chars(lines, position);
        var space_pos = blank_space(prev_pos, position);
        instruction.preceding_whitespace = grab_chars(lines, space_pos);
        pos_stack.push(space_pos);
        compile_node(instruction);
        pos_stack.pop();
        prev_pos = position;
        ast[i] = instruction;
    }
    return ast;
}

function parse_and_compile(ebfpp_code) {
    return generate_bf_code_of_compiled_ast(_compile(parser.parse(ebfpp_code)));
}

function compile_node(node) {
    node.bf_code = _compile_node(node);
    if (typeof node.raw_ebf_code !== 'undefined') {
        node.ebf_code = node.raw_ebf_code.replace(/\s/g, '');
    }
}

function _compile_node(node) { /*
    Compile a single AST node, dispatching to the appropriate function */
    switch (node.type) {
        case 'bf_command':  return compile_bf_command(node);
        case 'include':     return compile_include(node);
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
        case 'store_str':   return compile_store_str(node);
        case 'print_str':   return compile_print_str(node);
        case 'def_array_size':  return compile_def_array_size(node);
        case 'def_array_init':  return compile_def_array_init(node);
        case 'goto_index_static':  return compile_goto_index_static(node);
        case 'goto_index_dynamic':  return compile_goto_index_dynamic(node);
        case 'for_loop':  return compile_for_loop(node);
        case 'def_struct':  return compile_def_struct(node);
        case 'goto_member': return compile_goto_member(node);
        case 'breakpoint':     return compile_breakpoint(node);
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

function compile_include(node) {
    assert(fs.existsSync(node.file), 'Trying to include nonexistent file: ' + node.file);
    return compile_file(node.file);
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
        var compiled_body = _compile(arg_dict[node.name]);
        node.inside = compiled_body;
        return generate_bf_code_of_compiled_ast(compiled_body);
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
    var compiled_body = _compile(macros[node.name].body);
    node.inside = compiled_body;
    var body = generate_bf_code_of_compiled_ast(compiled_body);
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

function compile_store_str(node) {
    var output = '';
    for (var i = 0; i < node.string.length; i++) {
        var char_code = node.string.charCodeAt(i);
        output += _compile_node(util.multiplier('+', char_code));
        output += parse_and_compile('>');
    }
    return output;
}

function compile_print_str(node) {
    var output = '';
    var cell_value = 0;
    for (var i = 0; i < node.string.length; i++) {
        var char_code = node.string.charCodeAt(i);
        output += change_cell_value(cell_value, char_code);
        output += parse_and_compile('.');
        cell_value = char_code;
    }
    return output;
}

function compile_def_array_size(node) {
    var member_names = struct_types[node.element_type];
    var member_names_with_pad = add_padding_names(member_names);
    _(node.size).times(function(i) {
        for (var j in member_names_with_pad) {
            var var_name = construct_illegal_var_name(node.name, i, member_names_with_pad[j]);
            variables.push(var_name);
        }
    });
    arrays[node.name] = array(node.element_type, node.size);
    return '';
}

function compile_def_array_init(node) {
    var bf_code = '';
    var member_names = struct_types[node.element_type];
    var member_names_with_pad = add_padding_names(member_names);
    for (var i in node.values) {
        var struct_values = node.values[i];
        assert(struct_values.length == member_names.length,
               'Tried to initialize array with wrong number of struct members: ' +
               node.name);

        // Add on two dummy "padding" variables to the end of
        var struct_values_with_pad = add_padding_values(struct_values);
        for (var j in struct_values_with_pad) {
            var value = struct_values_with_pad[j];
            var var_name = construct_illegal_var_name(node.name, i, member_names_with_pad[j]);
            variables.push(var_name);
            var memory_location = variables.indexOf(var_name);
            bf_code += move_pointer(memory_location) + repeat_string('+', value);
        }
    }
    arrays[node.name] = array(node.element_type, node.values.length);
    return bf_code;
}

function compile_goto_index_static(node) {
    last_array_access.name = node.name;
    last_array_access.index = node.index;
    var first_member_name = struct_types[arrays[node.name].element_type][0];
    var memory_location = variables.indexOf(
                              construct_illegal_var_name(
                                  node.name, node.index, first_member_name));
    return move_pointer(memory_location);
}

function compile_goto_index_dynamic(node) {
    last_array_access.name = node.array_name;
    last_array_access.index = 'dynamic';

    var output = '';
    var array_name = node.array_name;
    var array = arrays[array_name];
    var array_length = array.length;
    var struct_members = struct_types[array.element_type];
    var padless_struct_size = struct_members.length;
    var full_struct_size = padless_struct_size + PAD_SIZE;

    output += _compile_node(util.go_var(node.index_var));
    output += parse_and_compile('(-');
    output += _compile_node(util.goto_index_static(array_name, 0));
    output += _compile_node(util.multiplier('>', padless_struct_size));
    output += parse_and_compile('+)');
    output += _compile_node(util.goto_index_static(array_name, 0));
    output += _compile_node(util.multiplier('>', padless_struct_size));

    output += parse_and_compile('[');
        output += parse_and_compile('(-');
        output += _compile_node(util.multiplier('>', full_struct_size));
        output += parse_and_compile('+)>(-');
        output += _compile_node(util.multiplier('>', full_struct_size));
        output += parse_and_compile('+)');
        output += _compile_node(util.multiplier('>', full_struct_size));
        output += parse_and_compile('+<-');
    output += parse_and_compile(']');
    output += _compile_node(util.multiplier('<', padless_struct_size));

    pointer = 0;
    absolute_pointer = false;

    return output;
}

function compile_for_loop(node) {
    var array_name = node.array_name;
    var array_length = arrays[array_name].length;
    var output = '';
    for(var i = 0; i < array_length; i++) {
        // TODO: use constructor
        var temp_node = {name: array_name, index: i};
        output += compile_goto_index_static(temp_node);
        output += generate_bf_code_of_compiled_ast(_compile(node.body));
    }
    return output;
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

function compile_breakpoint(node) {
    return '#';
}

// Helper functions

function construct_illegal_var_name(array_name, index, member_name) {
    // This is used to access array elements and their members. These variable
    // names are invalid EBF++ variable names, so there won't be a conflict
    // with user variables.
    // The format of the variable name is: #array.index.member
    return '#' + array_name + '.' + index + '.' + member_name;
}

function add_padding_names(member_names) { /*
    Copy the array passed in, adding #pad0, #pad1, ..., #padN to it.
    N = PAD_SIZE */
    var new_array = member_names.slice();
    _(PAD_SIZE).times(function(i) {
        new_array.push('#pad' + i);
    });
    return new_array;
}

function add_padding_values(struct_values) {
    var new_array = struct_values.slice();
    _(PAD_SIZE).times(function(unused) {
        new_array.push(0);
    });
    return new_array;
}

function move_pointer(destination) { /*
    Returns code for moving the pointer to a given memory index, and
    updates the global pointer variable accordingly.

    destination: The target memory index. */
    if (absolute_pointer) {
        var distance = destination - pointer;
        pointer = destination;
        return move_distance(distance);
    } else {
        var output = ''

        var array_name = last_array_access.name;
        var array = arrays[array_name];
        var struct_members = struct_types[array.element_type];
        var padless_struct_size = struct_members.length;
        var full_struct_size = padless_struct_size + PAD_SIZE;

        // go back to the index that was accessed previously
        output += move_distance(-pointer);
        pointer = 0;

        // go to pad1
        output += _compile_node(util.multiplier('>', full_struct_size - 1));
        output += '[';
            // move pad1
            output += '[-';
            output += _compile_node(util.multiplier('<', full_struct_size));
            output += '+';
            output += _compile_node(util.multiplier('>', full_struct_size));
            output += ']';

            // decrement it
            output += _compile_node(util.multiplier('<', full_struct_size));
            output += '-';
        output += ']';

        // restore pointer
        pointer = variables.indexOf(construct_illegal_var_name(array_name, 0, '#pad1'));
        absolute_pointer = true;

        // output += '>'

        // do move_pointer again
        output += move_pointer(destination);

        return output;
    }
}

function move_distance(distance) {
    if (distance < 0) {
        return repeat_string('<', -distance);
    } else {
        return repeat_string('>', distance);
    }
}

function change_cell_value(old_value, new_value) { /*
    Returns the BF code to change the current cell's value from old_value to
    new_value. This is used in compile_print_str(). */
    var difference = new_value - old_value;
    if (difference > 0) {
        return _compile_node(util.multiplier('+', difference));
    } else {
        return _compile_node(util.multiplier('-', -difference));
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

// function create_ast(ebfpp_code) {
//     // TODO: recurse into bodies! -- macro definitions have bodies, and macro
//     // insertions have values which are really also bodies
//     var prev_pos = { last_line: 1, last_column: 0, first_line: 1, first_column: 0 };
//     var ast = [];
//     for (var i in parser_output) {
//         var pair = parser_output[i];
//         var instruction = pair.instruction;
//         TODO1(instruction);
//         var position = pair.position;
//         instruction.raw_ebf_code = grab_chars(lines, position);
//         instruction.preceding_whitespace = grab_chars(lines, blank_space(prev_pos, position));
//         ast.push(instruction);
//         prev_pos = position;
//     }
//     return ast;
// }

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

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

if (typeof require !== 'undefined' && require.main === module) {
    main();
}
