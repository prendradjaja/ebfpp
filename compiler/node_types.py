### Definitions of data types used by the parser and code generator to
### represent program code.

from collections import namedtuple
BFCommand  = namedtuple('BFCommand',  'cmd')          # any of the eight
                                                      # BF commands
Multiplier = namedtuple('Multiplier', 'cmd times')    # 3+
DefVar     = namedtuple('DefVar',     'name')         # :var
GoVar      = namedtuple('GoVar',      'name')         # $var
AtVar      = namedtuple('AtVar',      'name')         # @var
DeallocVar = namedtuple('DeallocVar', 'name')         # !var
LParen     = namedtuple('LParen',     '')             # (
RParen     = namedtuple('RParen',     '')             # )
DefMacro   = namedtuple('DefMacro',   'name body')    # {macro ...}
PutMacro   = namedtuple('PutMacro',   'name')         # &macro
GoOffset   = namedtuple('GoOffset',   'offset')       # ^0
AtOffset   = namedtuple('AtOffset',   'offset')       # *-1
StoreStr   = namedtuple('StoreStr',   'string')       # ~"hello"
PrintStr   = namedtuple('PrintStr',   'string')       # |"hello"
