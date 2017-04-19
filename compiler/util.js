var util = (function() {
    function hello() {
        console.log('hello');
    }

    function array_concat(a1, a2) {
        if(a1 instanceof Array && a2 instanceof Array) {
            return a1.concat(a2);
        } else {
            throw new Error('Both arguments to array_concat must be arrays');
        }
    }

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
    var include     = ast_node('include',     'file')         // !'file'
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
    var def_array_size = ast_node('def_array_size', 'name element_type size') // ::arr size
    var def_array_init = ast_node('def_array_init', 'name element_type values') // ::arr {values}
    var goto_index_static = ast_node('goto_index_static', 'name index') //
    var goto_index_dynamic = ast_node('goto_index_dynamic', 'array_name index_var') //
    var for_loop    = ast_node('for_loop',    'array_name body') //
    var def_struct = ast_node('def_struct', 'name member_names') //
    var goto_member = ast_node('goto_member', 'name') //
    var breakpoint     = ast_node('breakpoint', '');

    return {
        array_concat: array_concat,
        ast_node: ast_node,
        bf_command: bf_command,
        multiplier: multiplier,
        include: include,
        def_var: def_var,
        go_var: go_var,
        at_var: at_var,
        dealloc_var: dealloc_var,
        l_paren: l_paren,
        r_paren: r_paren,
        def_macro: def_macro,
        put_argument: put_argument,
        put_macro: put_macro,
        go_offset: go_offset,
        at_offset: at_offset,
        store_str: store_str,
        print_str: print_str,
        def_array_size: def_array_size,
        def_array_init: def_array_init,
        goto_index_static: goto_index_static,
        goto_index_dynamic: goto_index_dynamic,
        for_loop: for_loop,
        def_struct: def_struct,
        goto_member: goto_member,
        breakpoint: breakpoint,
    };
}());

if (typeof module !== 'undefined') {
    module.exports = util;
}
