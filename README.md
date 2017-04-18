# EBF++ compiler

This is a compiler for the [EBF++][ebfpp] language, an extension of
[Brainf\*ck][bf]. It turns EBF++ code into plain BF.

See [here][ebfpp] for more information on EBF++, a language developed by Pandu
Rendradjaja, John Tran, and John Wilkey.

## A note on running EBF++ and BF programs:

Unfortunately, even a language as simple as BF has a wide range of
implementation-specific behaviors. Our favorite implementation is the [bff4]
BF interpreter by Oleg Mazonka, so (for best results) please use it when
running our code.

For convenience, `bff4.c` is included in this repo. Compile the interpreter
with:

`make interpreter`

You can then run it like so: (Try it out in the included
`hello-world.bf`!)

`./bff4/bff4 < hello-world.bf`

Or, more conveniently:

    . aliases.sh
    bf < hello-world.bf


[ebfpp]: https://prendradjaja.github.io/ebfpp-demo/
[bf]: https://en.wikipedia.org/wiki/Brainfuck
[bff4]: http://mazonka.com/brainf/
