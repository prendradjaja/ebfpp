; This program was written for PA6 part 2 demonstrating how the lacking of 
; certain constructs in the language greatly increases the complexity of 
; writing certain programs. This is what we intend to primarily address for 
; our final project by adding in support for these constructs.

{ read  ,>, }                   ; Macro definition for common operation 

&read 46-[46+ 2> &read 46-]     ; Get input and create formatted array.
 
<
3<
[                               ; Iterate over array read in and output
48-[>.<-]                       ; expanded version of input. 
3<
]
