# This can be used as a command-line filter to do run-length encoding on
# the -+<> characters. Example:
#    $ cat example.bf
#    +++
#    >
#    >>
#    ...
#    $ cat example.bf | python3 rle.py
#    3+
#    >
#    2>
#    ...

import fileinput, re

file = ''
for line in fileinput.input():
    file += line

pattern = r'([-+<>])\1+'

def repl(m):
    matchstr = m.string[m.start():m.end()]
    return str(len(matchstr)) + matchstr[0]

print(re.sub(pattern, repl, file), end='')
