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
"::"                  return '::'
"$:"                  return '$:'
"$!"                  return '$!'
":="                  return ':='
"$$"                  return '$$'

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
"~"                   return '~'
"|"                   return '|'
"#"                   return '#'

"\\\\"                return '\\\\'
"\\"                  return '\\'
"/"                   return '/'

[0-9]+                return 'NUM'
[A-Za-z_][A-Za-z0-9_]* return 'ID'

'"'[^"]*'"'           return 'STR'
"'"[^']*"'"           return 'STR'

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
        {$$ = util.array_concat($1, [instruction_info($2, @2)]);}
    ;

instruction
    : bf_command
    | include
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
    | def_array_size
    | def_array_init
    | goto_index_static
    | goto_index_dynamic
    | for_loop
    | def_struct
    | goto_member
    | breakpoint
    ;

bf_command
    : bf_char
        {$$ = util.bf_command($1);}
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

include
    : '!' STR
        {$$ = util.include($2.substring(1, $2.length-1));}
    ;

def_var
    : ':' ID
        {$$ = util.def_var($2);}
    ;

go_var
    : '$' ID
        {$$ = util.go_var($2);}
    ;

at_var
    : '@' ID
        {$$ = util.at_var($2);}
    ;

dealloc_var
    : '!' ID
        {$$ = util.dealloc_var($2);}
    ;

l_paren
    : '('
        {$$ = util.l_paren();}
    ;

r_paren
    : ')'
        {$$ = util.r_paren();}
    ;

def_macro
    : def_macro_no_args
    | def_macro_with_args
    ;

def_macro_no_args
    : '{' ID program '}'
        {$$ = util.def_macro($2, [], $3);}
    ;

def_macro_with_args
    : '{' ID id_list '\\\\' program '}'
        {$$ = util.def_macro($2, $3, $5);}
    ;

put_argument
    : '%' ID
        {$$ = util.put_argument($2);}
    ;

put_macro
    : put_macro_no_args
    | put_macro_with_args
    ;

put_macro_no_args
    : '&' ID
        {$$ = util.put_macro($2, []);}
    ;

put_macro_with_args
    : '&{' ID arg_list '}'
        {$$ = util.put_macro($2, $3);}
    ;

go_offset
    : '^' NUM
        {$$ = util.go_offset(Number($2));}
    ;

at_offset
    : '*' sign NUM
        {$$ = util.at_offset(Number($2 + $3));}
    ;

sign
    : '+'
    | '-'
    ;

multiplier
    : NUM bf_char
        {$$ = util.multiplier($2, Number($1));}
    ;

store_str
    : '~' STR
        {$$ = util.store_str($2.substring(1, $2.length-1));}
    ;

print_str
    : '|' STR
        {$$ = util.print_str($2.substring(1, $2.length-1));}
    ;

def_array_size
    : '::' ID ID NUM
        {$$ = util.def_array_size($2, $3, Number($4));}
    ;

def_array_init
    : '::' ID ID '{' array_values '}'
        {$$ = util.def_array_init($2, $3, $5);}
    ;

goto_index_static
    : '$:' ID NUM
        {$$ = util.goto_index_static($2, Number($3));}
    ;

goto_index_dynamic
    : '$!' ID ID
        {$$ = util.goto_index_dynamic($2, $3);}
    ;

for_loop
    : '~' ID '{' program '}'
        {$$ = util.for_loop($2, $4);}
    ;

def_struct
    : ':=' ID '{' member_name_list '}'
        {$$ = util.def_struct($2, $4);}
    ;

goto_member
    : '$$' ID
        {$$ = util.goto_member($2);}
    ;

breakpoint
    : '#'
        {$$ = util.breakpoint();}
    ;

// todo: change name to reflect that it's specifically for macros
id_list
    : nonempty_id_list
    | /* empty */
        {$$ = [];}
    ;

nonempty_id_list
    : nonempty_id_list '\\' ID
        {$$ = util.array_concat($1, [$3]);}
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
        {$$ = util.array_concat($1, [$3]);}
    | '/' program
        {$$ = [$2];}
    ;

/* doesn't support size zero arrays */
array_values
    : array_values '/' struct_values
        {$$ = util.array_concat($1, [$3]);}
    | struct_values
        {$$ = [$1];}
    ;

/* doesn't support size zero structs */
struct_values
    : struct_values NUM
        {$$ = util.array_concat($1, [Number($2)]);}
    | NUM
        {$$ = [Number($1)];}
    ;

/* doesn't support size zero structs */
member_name_list
    : member_name_list ID
        {$$ = util.array_concat($1, [$2]);}
    | ID
        {$$ = [$1];}
    ;


%% /* utility */

if (typeof require !== 'undefined') {
    util = require('./util.js');
}

// NOTE: this function appears also in compiler/compiler.js. This is a hacky
// solution right now, fix it later. But if you change it here, change it
// there too.
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

var instruction_info = named_list('instruction position');
