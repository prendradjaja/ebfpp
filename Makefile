.PHONY: parser interpreter test clean

parser: compiler/grammar.js

interpreter: bff4/bff4

compiler/grammar.js: compiler/grammar.jison
	npm run generate-parser

bff4/bff4: bff4/bff4.c
	gcc bff4/bff4.c -o bff4/bff4

test:
	cd compiler && ./run_tests.py

clean:
	rm bff4/bff4 compiler/grammar.js
