### Some command-line shortcuts that are helpful for development.

## Essentials

function ebf () {
    # Run our compiler
    python3 main.py $1; }
function reff () {
    # Run the reference compiler (via the BFF4 interpreter)
    maybecompilebff4;
    cat tools/ebf.bf $1 | tools/bff4; }
function ref () {
    # Run the reference compiler, minifying the result
    reff $1 | minify; }

## Testing

function maketest () {
    # Make a reference-output file.
    ref $1 | minify > $1.out
    echo $1.out:
    cat $1.out; }
function runtest () {
    # Run a test, comparing against an existing output file.
    diff <(ebf $1) $1.out; }
function slowtest () {
    # Run a test, running against the reference compiler.
    diff <(ebf $1) <(ref $1); }

alias mt='maketest'
alias rt='runtest'
alias st='slowtest'

## Other

function tokenize () {
    python3 tokenize.py $1; }
function rle () {
    python3 tools/rle.py; }

alias tok='tokenize'

## Internal utility

function minify () {
    # Minify BF code.
    tr -dc '[]<>+-.,' | addfinalnewline; }
function addfinalnewline () {
    sed '$s/$/\n/'; }
function maybecompilebff4 () {
    # Check if the bff4 binary exists. If not, compile it.
    if [ ! -f tools/bff4 ]; then
        gcc tools/bff4.c -o tools/bff4
    fi; }
