.PHONY: interpreter test

interpreter: bff4/bff4.c
	gcc bff4/bff4.c -o bff4/bff4

test:
	cd compiler && ./run_tests.py
