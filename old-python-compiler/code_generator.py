### The code generator module. (This file doesn't do anything, just defines
### the compile() function for main.py to call.)

import node_types

pointer = 0
# Keeps track of where the pointer goes during the program. This is used
# for variables.

variables = []
# A stack (implemented as a list) of the variable names used by the program.
# - The index of a variable name is its location in memory.
# - Each new variable is pushed onto the stack.
# - Deallocating a variable pops off the stack.

macros = {}
# A dictionary mapping macro names to their bodies.

paren_stack = []
# A stack of memory indices used by lparen and rparen.
# - Every time the program enters a () loop, (not a [] loop!) the current
#   memory index is pushed to the stack.
# - Exiting the loop pops off the stack.

anchors = []
# A stack of memory indices for the ^ (go_offset) command.
# - Whenever a macro is inserted, the current memory index is pushed to the
#   stack.
# - Exiting a macro pops off the stack.

def compile(program):
    """
    program: A list of nodes representing an EBF program.
    returns: The compiled BF output.

    The global variable `pointer` may be changed, according to what happens in
    the program.
    """
    output = ''
    for node in program:
        output += compile_node(node)
    return output

def compile_node(node):
    """Compile a single AST node, dispatching to the appropriate function"""
    node_type = type(node).__name__
    if node_type == 'BFCommand':    return compile_bf_command(node)
    elif node_type == 'DefVar':     return compile_def_var(node)
    elif node_type == 'GoVar':      return compile_go_var(node)
    elif node_type == 'AtVar':      return compile_at_var(node)
    elif node_type == 'DeallocVar': return compile_dealloc_var(node)
    elif node_type == 'LParen':     return compile_lparen(node)
    elif node_type == 'RParen':     return compile_rparen(node)
    elif node_type == 'DefMacro':   return compile_def_macro(node)
    elif node_type == 'PutMacro':   return compile_put_macro(node)
    elif node_type == 'GoOffset':   return compile_go_offset(node)
    elif node_type == 'AtOffset':   return compile_at_offset(node)
    elif node_type == 'Multiplier': return compile_multiplier(node)
    else:
        raise Exception('unsupported AST node in code generator: {}'
                .format(node_type))

# Compilation functions for each AST node.
# A compilation function takes in a specific type of AST node and returns BF
# code.

def compile_bf_command(node):
    global pointer
    if node.cmd == '<':
        pointer -= 1
    elif node.cmd == '>':
        pointer += 1
    return node.cmd

def compile_def_var(node):
    variables.append(node.name)
    return ''

def compile_go_var(node):
    return move_pointer(variables.index(node.name))

def compile_at_var(node):
    global pointer
    pointer = variables.index(node.name)
    return ''

def compile_dealloc_var(node):
    if node.name != variables.pop():
        raise Exception('Bad deallocation')
    return ''

def compile_lparen(node):
    paren_stack.append(pointer)
    return '['

def compile_rparen(node):
    return move_pointer(paren_stack.pop()) + ']'

def compile_def_macro(node):
    macros[node.name] = node.body
    return ''

def compile_put_macro(node):
    anchors.append(pointer)
    body = compile(macros[node.name])
    anchors.pop()
    return body

def compile_go_offset(node):
    return move_pointer(anchors[-1] + node.offset)

def compile_at_offset(node):
    global pointer
    pointer += node.offset
    return ''

def compile_multiplier(node):
    return node.cmd * node.times

# Helper functions

def move_pointer(destination):
    """Returns code for moving the pointer to a given memory index, and
    updates the global pointer variable accordingly.

    destination: The target memory index.
    """
    global pointer
    distance = destination - pointer
    pointer = destination
    if distance < 0:
        return '<' * -distance
    else:
        return '>' * distance
