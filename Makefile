.PHONY: interpreter

interpreter: bff4/bff4.c
	gcc bff4/bff4.c -o bff4/bff4
