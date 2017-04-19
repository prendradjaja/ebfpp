# EBF++ compiler

This is a compiler for the [EBF++][ebfpp] language, an extension of
[Brainf\*ck][bf] (BF). It turns EBF++ code into plain BF.

See [here][ebfpp] for more information on EBF++, a language developed by Pandu
Rendradjaja, John Tran, and John Wilkey.

## Requirements
- `gcc` and `make` (For running BF code. Not necessary for running the EBF++
  compiler itself.)
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


## Directory structure and files

### The compiler
- `compiler/`
  - `compiler.js`
  - `run_tests.py`
  - `tests/`: See [below](#adding-tests).
  - `ebfpp.jison`: Grammar.
  - `ebfpp.js`: Parser module generated by Jison from `ebfpp.jison`.
  - `parser.js`: Command-line interface for `ebfpp.js`. See
    [below](#parser.js).
  - `util.js`

### Helpers
- `aliases.sh`: Useful shortcuts for working with this project.
- `language-notes.pdf`: Cheat sheet (two pages) of BF, EBF, and EBF++ syntax.
- `bff4/`: The [bff4] BF interpreter by Oleg Mazonka. This is *not* our
  work.
  - You'll have to compile it first with `make interpreter`.

### Included code
This repo includes:

- `demo-1.ebf`: A fancy way of printing `.....` to the screen
  (demonstrates EBF++ macros).
- `hello-world.bf`: Hello World in plain BF.
- A variety short examples under `compiler/tests/`.

### Adding tests
Tests are in subdirectories of `compiler/tests/`. Add subdirectories as needed
for organization; `run_tests.py` will find them automatically.

- (any test subdirectory): File structure is:
  - `TEST_NAME.ebf`: EBF++ code to be compiled.
  - `TEST_NAME.ebf.out`: Expected BF output.
  - `TEST_NAME.ebf.tmp`: Actual output by the compiler. This is
    `.gitignore`d.

## Parser.js
To use the standalone parser, use the `parse` alias:

    parse demo-1.ebf


[ebfpp]: https://prendradjaja.github.io/ebfpp-demo/
[bf]: https://en.wikipedia.org/wiki/Brainfuck
[bff4]: http://mazonka.com/brainf/
