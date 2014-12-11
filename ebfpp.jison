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

"&{"                  return '&{'

":"                   return ':'
"$"                   return '$'
"@"                   return '@'
"!"                   return '!'
"("                   return '('
")"                   return ')'
"%"                   return '%'
"&"                   return '&'
"{"                   return '{'
"}"                   return '}'
"^"                   return '^'
"*"                   return '*'

"\\\\"                return '\\\\'
"\\"                  return '\\'
"/"                   return '/'

[0-9]+                return 'NUM'
[A-Za-z_][A-Za-z0-9_]* return 'ID'

'~"'[^"]*'"'          return '~_STR'
"~'"[^']*"'"          return '~_STR'
'|"'[^"]*'"'          return '|_STR'
"|'"[^']*"'"          return '|_STR'

/* '::'[A-Za-z0-9_]+     return '::ID' */
/* ':'[0-9]+             return ':NUM' */
/* '$!'[A-Za-z0-9_]+     return '$!ID' */
/* ':='[A-Za-z0-9_]+     return ':=ID' */
/* '$$'[A-Za-z0-9_]+     return '$$ID' */

<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%start file

%% /* language grammar */

file
    : program EOF
        { return $1; }
    ;

program
    :
        {$$ = [];}
    | program instruction
        {$$ = array_concat($1, [$2]);}
    ;

instruction
    : bf_command
    | def_var
    | go_var
    | at_var
    | dealloc_var
    | l_paren
    | r_paren
    | def_macro
    | put_argument
    | put_macro
    | go_offset
    | at_offset
    | multiplier
    | store_str
    | print_str
    ;

bf_command
    : bf_char
        {$$ = bf_command($1);}
    ;

bf_char
    : '+'
    | '-'
    | '['
    | ']'
    | '<'
    | '>'
    | '.'
    | ','
    ;

def_var
    : ':' ID
        {$$ = def_var($2);}
    ;

go_var
    : '$' ID
        {$$ = go_var($2);}
    ;

at_var
    : '@' ID
        {$$ = at_var($2);}
    ;

dealloc_var
    : '!' ID
        {$$ = dealloc_var($2);}
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
    : '{' ID program '}'
        {$$ = def_macro($2, [], $3);}
    ;

def_macro_with_args
    : '{' ID id_list '\\\\' program '}'
        {$$ = def_macro($2, $3, $5);}
    ;

put_argument
    : '%' ID
        {$$ = put_argument($2);}
    ;

put_macro
    : put_macro_no_args
    | put_macro_with_args
    ;

put_macro_no_args
    : '&' ID
        {$$ = put_macro($2, []);}
    ;

put_macro_with_args
    : '&{' ID arg_list '}'
        {$$ = put_macro($2, $3);}
    ;

go_offset
    : '^' NUM
        {$$ = go_offset(Number($2));}
    ;

at_offset
    : '*' sign NUM
        {$$ = at_offset(Number($2 + $3));}
    ;

sign
    : '+'
    | '-'
    ;

multiplier
    : NUM bf_char
        {$$ = multiplier($2, Number($1));}
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
    : nonempty_arg_list '/' program
        {$$ = array_concat($1, [$3]);}
    | '/' program
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
