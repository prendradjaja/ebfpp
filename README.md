# EBF++ compiler

This is a compiler for the [EBF++][ebfpp] language, an extension of
[Brainf\*ck][bf] (BF). It turns EBF++ code into plain BF.

See [here][ebfpp] for more information on EBF++, a language developed by Pandu
Rendradjaja, John Tran, and John Wilkey.

## Requirements

- gcc
- make
- TODO js requirements

## Getting started

There are a couple of aliases in `aliases.sh`. Let's start by sourcing those:

    . aliases.sh

Now let's compile `demo-1.ebf` with the `compile` alias:

    compile demo-1.ebf > demo-1.bf

To run this program, you'll need a BF interpreter. Unfortunately, even a
language as simple as BF has a wide range of implementation-specific
behaviors. Our favorite implementation is [bff4] by Oleg Mazonka, so (for best
results) please use it when running our code.

For convenience, `bff4.c` is included in this repo. Compile the interpreter
with:

    make interpreter

It should compile very quickly. Now you can run the demo program!

    bf < demo-1.bf

You should see five dots appear in your terminal.


[ebfpp]: https://prendradjaja.github.io/ebfpp-demo/
[bf]: https://en.wikipedia.org/wiki/Brainfuck
[bff4]: http://mazonka.com/brainf/
