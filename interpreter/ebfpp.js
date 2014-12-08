/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[2,2],$V1=[1,18],$V2=[1,19],$V3=[1,20],$V4=[1,21],$V5=[1,22],$V6=[1,23],$V7=[1,24],$V8=[1,25],$V9=[1,26],$Va=[1,27],$Vb=[1,28],$Vc=[1,29],$Vd=[1,30],$Ve=[1,31],$Vf=[1,39],$Vg=[1,33],$Vh=[1,34],$Vi=[1,35],$Vj=[1,36],$Vk=[1,37],$Vl=[1,38],$Vm=[5,20,21,22,23,24,25,26,27,28,29,30,31,32,33,35,36,37,38,39,40,41,42],$Vn=[20,21,22,23,24,25,26,27,28,29,30,31,32,33,35,36,37,38,39,40,41,42];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"file":3,"p":4,"EOF":5,"bf_command":6,"def_var":7,"go_var":8,"at_var":9,"dealloc_var":10,"l_paren":11,"r_paren":12,"def_macro":13,"put_macro":14,"go_offset":15,"at_offset":16,"multiplier":17,"store_str":18,"print_str":19,"+":20,"-":21,"[":22,"]":23,"<":24,">":25,".":26,",":27,":ID":28,"$ID":29,"@ID":30,"!ID":31,"(":32,")":33,"l_brace_id":34,"}":35,"{ID":36,"&ID":37,"^NUM":38,"*_SIGN_NUM":39,"NUM_BFCHAR":40,"~_STR":41,"|_STR":42,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",20:"+",21:"-",22:"[",23:"]",24:"<",25:">",26:".",27:",",28:":ID",29:"$ID",30:"@ID",31:"!ID",32:"(",33:")",35:"}",36:"{ID",37:"&ID",38:"^NUM",39:"*_SIGN_NUM",40:"NUM_BFCHAR",41:"~_STR",42:"|_STR"},
productions_: [0,[3,2],[4,0],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[13,3],[34,1],[14,1],[15,1],[16,1],[17,1],[18,1],[19,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 return $$[$0-1]; 
break;
case 2:
this.$ = [];
break;
case 3: case 4: case 5: case 6: case 7: case 8: case 9: case 10: case 11: case 12: case 13: case 14: case 15: case 16:
this.$ = array_concat($$[$0-1], [$$[$0]]);
break;
case 17: case 18: case 19: case 20: case 21: case 22: case 23: case 24:
this.$ = bf_command($$[$0]);
break;
case 25:
this.$ = def_var($$[$0].substring(1));
break;
case 26:
this.$ = go_var($$[$0].substring(1));
break;
case 27:
this.$ = at_var($$[$0].substring(1));
break;
case 28:
this.$ = dealloc_var($$[$0].substring(1));
break;
case 29:
this.$ = l_paren();
break;
case 30:
this.$ = r_paren();
break;
case 31:
this.$ = def_macro($$[$0-2], $$[$0-1]);
break;
case 32:
this.$ = $$[$0].substring(1);
break;
case 33:
this.$ = put_macro($$[$0].substring(1));
break;
case 34:
this.$ = go_offset(Number($$[$0].substring(1)));
break;
case 35:
this.$ = at_offset(Number($$[$0].substring(1)));
break;
case 36:
this.$ = multiplier(
                  $$[$0].substring($$[$0].length-1),
                  Number($$[$0].substring(0, $$[$0].length-1)));
break;
case 37:
this.$ = store_str($$[$0].substring(2, $$[$0].length-1));
break;
case 38:
this.$ = print_str($$[$0].substring(2, $$[$0].length-1));
break;
}
},
table: [o([5,20,21,22,23,24,25,26,27,28,29,30,31,32,33,36,37,38,39,40,41,42],$V0,{3:1,4:2}),{1:[3]},{5:[1,3],6:4,7:5,8:6,9:7,10:8,11:9,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:$V1,21:$V2,22:$V3,23:$V4,24:$V5,25:$V6,26:$V7,27:$V8,28:$V9,29:$Va,30:$Vb,31:$Vc,32:$Vd,33:$Ve,34:32,36:$Vf,37:$Vg,38:$Vh,39:$Vi,40:$Vj,41:$Vk,42:$Vl},{1:[2,1]},o($Vm,[2,3]),o($Vm,[2,4]),o($Vm,[2,5]),o($Vm,[2,6]),o($Vm,[2,7]),o($Vm,[2,8]),o($Vm,[2,9]),o($Vm,[2,10]),o($Vm,[2,11]),o($Vm,[2,12]),o($Vm,[2,13]),o($Vm,[2,14]),o($Vm,[2,15]),o($Vm,[2,16]),o($Vm,[2,17]),o($Vm,[2,18]),o($Vm,[2,19]),o($Vm,[2,20]),o($Vm,[2,21]),o($Vm,[2,22]),o($Vm,[2,23]),o($Vm,[2,24]),o($Vm,[2,25]),o($Vm,[2,26]),o($Vm,[2,27]),o($Vm,[2,28]),o($Vm,[2,29]),o($Vm,[2,30]),o($Vn,$V0,{4:40}),o($Vm,[2,33]),o($Vm,[2,34]),o($Vm,[2,35]),o($Vm,[2,36]),o($Vm,[2,37]),o($Vm,[2,38]),o($Vn,[2,32]),{6:4,7:5,8:6,9:7,10:8,11:9,12:10,13:11,14:12,15:13,16:14,17:15,18:16,19:17,20:$V1,21:$V2,22:$V3,23:$V4,24:$V5,25:$V6,26:$V7,27:$V8,28:$V9,29:$Va,30:$Vb,31:$Vc,32:$Vd,33:$Ve,34:32,35:[1,41],36:$Vf,37:$Vg,38:$Vh,39:$Vi,40:$Vj,41:$Vk,42:$Vl},o($Vm,[2,31])],
defaultActions: {3:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
 /* utility */

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
var def_macro   = ast_node('def_macro',   'name body')    // {macro ...}
var put_macro   = ast_node('put_macro',   'name')         // &macro
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
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:/* skip comments */
break;
case 2:return 20
break;
case 3:return 21
break;
case 4:return 22
break;
case 5:return 23
break;
case 6:return 24
break;
case 7:return 25
break;
case 8:return 26
break;
case 9:return 27
break;
case 10:return 28
break;
case 11:return 29
break;
case 12:return 30
break;
case 13:return 31
break;
case 14:return 32
break;
case 15:return 33
break;
case 16:return 36
break;
case 17:return 35
break;
case 18:return 37
break;
case 19:return 38
break;
case 20:return 39
break;
case 21:return 40
break;
case 22:return 41
break;
case 23:return 41
break;
case 24:return 42
break;
case 25:return 42
break;
case 26:return 5
break;
case 27:return 'INVALID'
break;
}
},
rules: [/^(?:\s+)/,/^(?:;.*)/,/^(?:\+)/,/^(?:-)/,/^(?:\[)/,/^(?:\])/,/^(?:<)/,/^(?:>)/,/^(?:\.)/,/^(?:,)/,/^(?::[A-Za-z0-9_]+)/,/^(?:\$[A-Za-z0-9_]+)/,/^(?:@[A-Za-z0-9_]+)/,/^(?:![A-Za-z0-9_]+)/,/^(?:\()/,/^(?:\))/,/^(?:\{[A-Za-z0-9_]+)/,/^(?:\})/,/^(?:&[A-Za-z0-9_]+)/,/^(?:\^[0-9]+)/,/^(?:\*[-+][0-9]+)/,/^(?:[0-9]+[-+<>])/,/^(?:~"[^"]*")/,/^(?:~'[^']*')/,/^(?:\|"[^"]*")/,/^(?:\|'[^']*')/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}