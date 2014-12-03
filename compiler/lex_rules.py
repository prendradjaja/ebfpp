### Rules for the lexer.

import config
from ply.lex import LexError

tokens = (
    # variables
    'DEF_VAR','GO_VAR','AT_VAR','DEALLOC_VAR',

    # macro
    'LBRACE_ID','PUT_MACRO','GO_OFFSET','AT_OFFSET',

    # syntactic sugar
    'MULTIPLIER','STORE_STR','PRINT_STR',
    )

literals = '.,+-<>[](){}:$@!&^*~|'

# variables

def t_DEF_VAR(t):
    r':[A-Za-z0-9_]+'
    t.value = t.value[1:]
    return t
def t_GO_VAR(t):
    r'\$[A-Za-z0-9_]+'
    t.value = t.value[1:]
    return t
def t_AT_VAR(t):
    r'@[A-Za-z0-9_]+'
    t.value = t.value[1:]
    return t
def t_DEALLOC_VAR(t):
    r'![A-Za-z0-9_]+'
    t.value = t.value[1:]
    return t

# macro

def t_LBRACE_ID(t):
    r'{[A-Za-z0-9_]+'
    t.value = t.value[1:]
    return t
def t_PUT_MACRO(t):
    r'&[A-Za-z0-9_]+'
    t.value = t.value[1:]
    return t
def t_GO_OFFSET(t):
    r'\^\d+'
    t.value = int(t.value[1:])
    return t
def t_AT_OFFSET(t):
    r'\*[-+]\d+'
    sign_as_number = int(t.value[1] + '1')
    t.value = sign_as_number * int(t.value[2:])
    return t

# syntax sugar

def t_MULTIPLIER(t):
    r'\d+[-+<>]'
    t.value = t.value[-1], int(t.value[:-1])
    return t
def t_STORE_STR(t):
    r'~"(?P<str1>[^"]*)"|~\'(?P<str2>[^\']*)\''
    t.value = t.lexer.lexmatch.group('str1') or t.lexer.lexmatch.group('str2')
    return t
def t_PRINT_STR(t):
    r'\|"(?P<str1>[^"]*)"|\|\'(?P<str2>[^\']*)\''
    t.value = t.lexer.lexmatch.group('str1') or t.lexer.lexmatch.group('str2')
    return t

# other

def t_newline(t):
    r'\n'
    t.lexer.lineno += 1

t_ignore = ' '
t_ignore_COMMENT = r';.*'

def t_error(t):
    if config.allow_bare_comments:
        # silently skip bad tokens
        t.lexer.skip(1)
    else:
        raise Exception('Lexing error at byte {}, which is in line {}: {}'
                        .format(t.lexpos + 1, t.lineno, repr(t.value)),
                        t.lexer.lexdata[t.lexer.lexpos:])
