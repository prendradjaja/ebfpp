### The EBF compiler.
#
# You can compile from files:
#   $ cat example.ebf
#   3+
#   $ python3 main.py example.ebf
#   +++
#
# Or from standard input:
#   $ echo 3+ | python3 main.py
#   +++
#
# You can configure the compiler by editing config.py.

import ply.lex as lex
import ply.yacc as yacc
import fileinput

from lex_rules import *
from yacc_rules import *
import code_generator

lex.lex()
yacc.yacc()

# Read a file (either from standard input, or supplied as a command-line
# argument) as a string.
file = ''
for line in fileinput.input():
    file += line

# parse, compile, and print the results
ebf_program = yacc.parse(file)
bf_program = code_generator.compile(ebf_program)
print(bf_program)
