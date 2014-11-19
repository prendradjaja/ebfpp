; This program was written for PA6 part 2 demonstrating how the lacking of 
; certain constructs in the language greatly increases the complexity of 
; writing certain programs. This is what we intend to primarily address for 
; our final project by adding in support for these constructs.

{read $count,$letter,}       ; Macro definition for common operation 

:count                          ; Variable definitions for struct.
:letter

&read 46-[46+ > @count &read 46-]     ; Get input and create formatted array.
 
<
2<
[@count                               ; Iterate over array read in and output
48-[$letter.-]                  ; expanded version of input. 
2<
]
