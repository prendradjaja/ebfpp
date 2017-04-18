#!/usr/bin/env python3

import os, sys, subprocess, difflib, time, signal
from sys import platform, argv

POLLTIME = 0.1

class Timeout(RuntimeError):
    def __str__(self):
        return "Timeout"
        
def runProc(process, timeout):
    start = time.time()
    while process.poll() is None:
        time.sleep(POLLTIME)
        if float(time.time() - start) > float(timeout):
            os.kill(process.pid, signal.SIGKILL)
            os.waitpid(-1, os.WNOHANG)
            raise Timeout
    return process.communicate()

def compare(ref, test):
    diffOutput = difflib.unified_diff(open(ref,'U').readlines(), 
                                      open(test,'U').readlines(), 
                                      fromfile="Solutions", 
                                      tofile="Test")
    tx = ''
    for line in diffOutput:
        tx = tx + line
        
    if tx: return 0
    else: return 1

def runTest(test, ref_output, test_output):
    try:
        p = subprocess.Popen('%s %s %s > %s' % ("node", program, test, test_output), shell=True)
        runProc(p, timeout)
        return compare(ref_output, test_output)
    except Timeout:
        print ("Timeout")
        return 0
    except Exception as e:
        print (e)
        print ("Interpreter Error")
        return 0

program = "compiler.js"
testDir = "tests" + os.sep
timeout = 30

if len(sys.argv) == 1:
    categories = os.listdir(testDir)
    categories.sort()
elif len(sys.argv) == 2:
    categories = [sys.argv[1]]
else:
    raise Exception('too many command-line arguments')

tests = {}
scores = {}
max_scores = {}
for cat in categories:
    tests[cat] = filter(lambda f: f.endswith(".ebf"), os.listdir(testDir + cat))
    scores[cat] = 0
    max_scores[cat] = 0

failed = {}

for (cat, tl) in tests.items():
    failed[cat] = []
    for test in tl:
        testPath = testDir + cat + os.sep + test
        ref_output = testPath + '.out'
        test_output = testPath + '.tmp'
        res = runTest(testPath, ref_output, test_output)
        if (res == 0):
            print ((cat + os.sep + test + '  Failed ' + '*' * 80)[:80])
            failed[cat].append(test)
        else:
            print (cat + os.sep + test + '  OK')
        scores[cat] = scores[cat] + res
        max_scores[cat] = max_scores[cat] + 1
      
total = 0
max_total = 0  
print ("\nResult:")
for cat in categories:
    print ("\t" + cat + ": " + str(scores[cat]) + " passed out of " + str(max_scores[cat]))
    if (scores[cat] < max_scores[cat]):
        print('***        ', '\n***         '.join(failed[cat]))
    total = total + scores[cat]
    max_total = max_total + max_scores[cat]

print ("Total: " + str(total) + " \ " + str(max_total))

