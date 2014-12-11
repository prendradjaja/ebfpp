/* Jison grammar for EBF++. Compile me with
    jison ebfpp.jison -p slr */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
";".*                 /* skip comments */
"+"                   return '+'
"-"                   return '-'
"["                   return '['
"]"                   return ']'
"<"                   return '<'
">"                   return '>'
"."                   return '.'
","                   return ','

":"[A-Za-z0-9_]+      return ':ID'
"$"[A-Za-z0-9_]+      return '$ID'
"@"[A-Za-z0-9_]+      return '@ID'
"!"[A-Za-z0-9_]+      return '!ID'

"("                   return '('
")"                   return ')'

"{"[A-Za-z0-9_]+      return '{ID'
"%"[A-Za-z0-9_]+      return '%ID'
"&"[A-Za-z0-9_]+      return '&ID'
"&{"[A-Za-z0-9_]+     return '&{ID'

"{"                   return '{'
"}"                   return '}'

"^"[0-9]+             return '^NUM'
"*"[-+][0-9]+         return '*_SIGN_NUM'

[0-9]+[-+<>]          return 'NUM_BFCHAR'
'~"'[^"]*'"'          return '~_STR'
"~'"[^']*"'"          return '~_STR'
'|"'[^"]*'"'          return '|_STR'
"|'"[^']*"'"          return '|_STR'

'::'[A-Za-z0-9_]+     return '::ID'
':'[0-9]+             return ':NUM'
'$!'[A-Za-z0-9_]+     return '$!ID'
':='[A-Za-z0-9_]+     return ':=ID'
'$$'[A-Za-z0-9_]+     return '$$ID'

"\\\\"                return '\\\\'
"\\"                  return '\\'
"/"                   return '/'

"$"                   return '$'
":"                   return ':'

[A-Za-z0-9_]+         return 'ID'
[0-9]+                return 'NUM'

<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

/* operator associations and precedence */

// %left '+'
// %left '*'

%start file

%% /* language grammar */

file
    : p EOF
        { return $1; }
    ;

p
    :
        {$$ = [];}
    | p bf_command
        {$$ = array_concat($1, [$2]);}
    | p def_var
        {$$ = array_concat($1, [$2]);}
    | p go_var
        {$$ = array_concat($1, [$2]);}
    | p at_var
        {$$ = array_concat($1, [$2]);}
    | p dealloc_var
        {$$ = array_concat($1, [$2]);}
    | p l_paren
        {$$ = array_concat($1, [$2]);}
    | p r_paren
        {$$ = array_concat($1, [$2]);}
    | p def_macro
        {$$ = array_concat($1, [$2]);}
    | p put_argument
        {$$ = array_concat($1, [$2]);}
    | p put_macro
        {$$ = array_concat($1, [$2]);}
    | p go_offset
        {$$ = array_concat($1, [$2]);}
    | p at_offset
        {$$ = array_concat($1, [$2]);}
    | p multiplier
        {$$ = array_concat($1, [$2]);}
    | p store_str
        {$$ = array_concat($1, [$2]);}
    | p print_str
        {$$ = array_concat($1, [$2]);}
    ;

bf_command
    : '+'
        {$$ = bf_command($1);}
    | '-'
        {$$ = bf_command($1);}
    | '['
        {$$ = bf_command($1);}
    | ']'
        {$$ = bf_command($1);}
    | '<'
        {$$ = bf_command($1);}
    | '>'
        {$$ = bf_command($1);}
    | '.'
        {$$ = bf_command($1);}
    | ','
        {$$ = bf_command($1);}
    ;

def_var
    : ':ID'
        {$$ = def_var($1.substring(1));}
    ;

go_var
    : '$ID'
        {$$ = go_var($1.substring(1));}
    ;

at_var
    : '@ID'
        {$$ = at_var($1.substring(1));}
    ;

dealloc_var
    : '!ID'
        {$$ = dealloc_var($1.substring(1));}
    ;

l_paren
    : '('
        {$$ = l_paren();}
    ;

r_paren
    : ')'
        {$$ = r_paren();}
    ;

def_macro
    : def_macro_no_args
    | def_macro_with_args
    ;

def_macro_no_args
    : l_brace_id p '}'
        {$$ = def_macro($1, [], $2);}
    ;

def_macro_with_args
    : l_brace_id id_list '\\\\' p '}'
        {$$ = def_macro($1, $2, $4);}
    ;

l_brace_id
    : '{ID'
        {$$ = $1.substring(1);}
    ;

put_argument
    : '%ID'
        {$$ = put_argument($1.substring(1));}
    ;

put_macro
    : put_macro_no_args
    | put_macro_with_args
    ;

put_macro_no_args
    : '&ID'
        {$$ = put_macro($1.substring(1), []);}
    ;

put_macro_with_args
    : '&{ID' arg_list '}'
        {$$ = put_macro($1.substring(2), $2);}
    ;

go_offset
    : '^NUM'
        {$$ = go_offset(Number($1.substring(1)));}
    ;

at_offset
    : '*_SIGN_NUM'
        {$$ = at_offset(Number($1.substring(1)));}
    ;

multiplier
    : NUM_BFCHAR
        {$$ = multiplier(
                  $1.substring($1.length-1),
                  Number($1.substring(0, $1.length-1)));}
    ;

store_str
    : '~_STR'
        {$$ = store_str($1.substring(2, $1.length-1));}
    ;

print_str
    : '|_STR'
        {$$ = print_str($1.substring(2, $1.length-1));}
    ;

id_list
    : nonempty_id_list
    | /* empty */
        {$$ = [];}
    ;

nonempty_id_list
    : nonempty_id_list '\\' ID
        {$$ = array_concat($1, [$3]);}
    | '\\' ID
        {$$ = [$2];}
    ;

arg_list
    : nonempty_arg_list
    | /* empty */
        {$$ = [];}
    ;

nonempty_arg_list
    : nonempty_arg_list '/' p
        {$$ = array_concat($1, [$3]);}
    | '/' p
        {$$ = [$2];}
    ;


%% /* utility */

// ast_node is adapted from
// http://stackoverflow.com/questions/8291194/how-to-implement-pythons-namedtuple-in-javascript

function ast_node(nodename, fieldnamestr) {
    var fields = fieldnamestr.split(' ');
    return function () {
        var arr = arguments;
        var obj = {type: nodename};

        for(var i = 0; i < arr.length; i++) {
            obj[fields[i]] = arr[i];
        }

        return obj;
    };
};


var bf_command  = ast_node('bf_command',  'cmd')          // any of the eight
                                                          // BF commands
var multiplier  = ast_node('multiplier',  'cmd times')    // 3+
var def_var     = ast_node('def_var',     'name')         // :var
var go_var      = ast_node('go_var',      'name')         // $var
var at_var      = ast_node('at_var',      'name')         // @var
var dealloc_var = ast_node('dealloc_var', 'name')         // !var
var l_paren     = ast_node('l_paren',     '')             // (
var r_paren     = ast_node('r_paren',     '')             // )
var def_macro   = ast_node('def_macro',   'name args body')    // {macro ...}
var put_argument = ast_node('put_argument', 'name')       // %argument
var put_macro   = ast_node('put_macro',   'name arg_values')    // &macro or &{macro ...}
var go_offset   = ast_node('go_offset',   'offset')       // ^0
var at_offset   = ast_node('at_offset',   'offset')       // *-1
var store_str   = ast_node('store_str',   'string')       // ~"hello"
var print_str   = ast_node('print_str',   'string')       // |"hello"

function array_concat(a1, a2) {
    if(a1 instanceof Array && a2 instanceof Array) {
        return a1.concat(a2);
    } else {
        throw new Error('Both arguments to array_concat must be arrays');
    }
}
