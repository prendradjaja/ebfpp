### Rules for the parser.

import node_types

def p_program(t):
    '''program : program bf_command
               | program def_var
               | program go_var
               | program at_var
               | program dealloc_var
               | program lparen
               | program rparen
               | program def_macro
               | program put_macro
               | program go_offset
               | program at_offset
               | program multiplier
               | program store_str
               | program print_str
               | empty'''
    t[0] = None
    if len(t) == 3:
        t[0] = t[1] + [t[2]]
    elif len(t) == 2:
        t[0] = []

def p_bf_command(t):
    '''bf_command : '+'
                  | '-'
                  | '<'
                  | '>'
                  | '.'
                  | ','
                  | '['
                  | ']' '''
    t[0] = node_types.BFCommand(t[1])

def p_def_var(t):
    '''def_var : DEF_VAR'''
    t[0] = node_types.DefVar(t[1])

def p_go_var(t):
    '''go_var : GO_VAR'''
    t[0] = node_types.GoVar(t[1])

def p_at_var(t):
    '''at_var : AT_VAR'''
    t[0] = node_types.AtVar(t[1])

def p_dealloc_var(t):
    '''dealloc_var : DEALLOC_VAR'''
    t[0] = node_types.DeallocVar(t[1])

def p_lparen(t):
    '''lparen : '(' '''
    t[0] = node_types.LParen()

def p_rparen(t):
    '''rparen : ')' '''
    t[0] = node_types.RParen()

def p_def_macro(t):
    '''def_macro : LBRACE_ID program '}' '''
    t[0] = node_types.DefMacro(t[1], t[2])

def p_put_macro(t):
    '''put_macro : PUT_MACRO'''
    t[0] = node_types.PutMacro(t[1])

def p_go_offset(t):
    '''go_offset : GO_OFFSET'''
    t[0] = node_types.GoOffset(t[1])

def p_at_offset(t):
    '''at_offset : AT_OFFSET'''
    t[0] = node_types.AtOffset(t[1])

def p_multiplier(t):
    '''multiplier : MULTIPLIER'''
    cmd, times = t[1]
    t[0] = node_types.Multiplier(cmd, times)

def p_store_str(t):
    '''store_str : STORE_STR'''
    t[0] = node_types.StoreStr(t[1])

def p_print_str(t):
    '''print_str : PRINT_STR'''
    t[0] = node_types.PrintStr(t[1])

def p_empty(t):
    'empty :'
    pass

def p_error(t):
    raise Exception('Syntax error at byte {}, which is in line {}'.format(
        t.lexpos + 1, t.lineno))
