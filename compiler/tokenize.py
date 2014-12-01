### Just runs the lexer, turning an EBF program into a list of tokens. Useful
### for debugging the lexer.

import ply.lex as lex
from lex_rules import *

import fileinput

lex.lex()
lexer = lex.lexer

file = ''
for line in fileinput.input():
    file += line

lexer.input(file)

for tok in lexer:
    print('{}\t{}'.format(tok.value, tok.type))
