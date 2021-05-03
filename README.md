# DesmosPlayer
Program the action in your Desmos graph to create animations for videos, presentations, etc.
## Introduction
When I started making short math videos using Desmos for the visuals, I would write down the sequence of actions I needed to perform on the expressions while doing a screen capture.  For example:  1) Show expression "1"; 2) Start slider for expression "1"; 3) Hide expression "1" and show expression "2"; and so on.  As my videos got longer and more involved, this became quite tedious.  If only there were a way to program those actions so it would just happen automatically.  Well, that is what DesmosPlayer will do.  You create a list of these actions, including pauses to get the timing right, and then click a button to start it running.
## Installation
Install the file desmosPlayer.user.js in your browser using your favorite script manager and make sure the installed script is enabled.  Typically (e.g. with Tampermonkey installed) this is done by clicking on the file name above, then clicking "Raw" and then "Install".  Then navigate to any Desmos calculator graph.
## Usage
To initialize the system, you will need to call the function desmosPlayer() with an array of instructions.  This can be done either by adding the call in the installed script itself, or by putting the same JavaScript code in the graph itself as a "note".  See below for complete details on how to write the instructions.  Once initialized, there will be some new buttons next to the "Save" button above the graph.  These include "Start", "Reset" and "Step" buttons, which control the execution of the instructions.
## Documentation
### Function: desmosPlayer
Parameters:  program - an array of functions to be executed
                       in sequence that control expressions
                       in a Desmos graph.
             properties - An object that conveys additional
                          configuration parameters.
This is the main function of the DesmosPlayer module.  It sets up the
environment needed to run the given program.  Create a program by
filling an array with the results of "instruction functions" (see
examples above).  Then pass this program to the desmosPlayer function,
along with optional properties:

     graphTitle: A string value that has to match the title of the graph
                 in order for the system to be activated.
     allowSave:  If set to true, do not disable the "save" button after
                 the program has started.  It is normally disabled to
                 prevent accidental modification to the initial state.
     debugMode:  Set to 'true' to enable back-stepping.

A "Start" button will be added next to the "Save" button.
Clicking it will start the program and turn it into a "Stop"
button.  Clicking it again will stop execution of the program.  A
"Reset" button will also appear which when clicked will put the graph and
the running program back to their initial states so that the program can
be run again.  Note: if allowSave mode is on and the save button is
accidentally used to overwrite the original graph after the program has
run, hit the "Reset" button and save again.  There is also a "Step"
button which will execute one function in the program at a time.  If
debugMode is true, then a "Back Step" button also appears after the
program has started, allowing you to undo the effect of the previous
step, all the way back to the start of the program. This is expensive
since it saves the entire graph state after every step.

Each instruction takes one or more expression ID parameters, which are
not the same as the index of the expression displayed in the expression
list. To get the ID of an expression, select it and press ctrl-Q.  The ID
will appear in the console window.  Normally these are numbers, but they
could be strings if the expressions were created by your program (see the
set command below).

Execution of the instructions proceeds automatically from one to the next.
The pause() instruction can be used to insert delays.  Also, most
instructions take an optional delay value as the final parameter which
inserts a pause implicitly.

Instructions can be grouped together using square brackets.  Instructions
in such groupings will be run without delays and without giving Desmos a
chance to update its graph until they have all run.  This can eliminate
glitches in the graph and make it look as though the instructions ran
simultaneously.  For example:

   const testProg = [
      startSlider(1, 5000),
      [setValue(1, 0),
       setValue(2, 1.0),
       setValue(3, 2.5),
       hideLabel(3),
       showLabel(4)],
      startSlider(1, 5000)
   ]

In this hypothetical scenario, a slider runs once to animate something
and then it is reset and a bunch of other elements are altered, hidden
and revealed all at once, then the animation is run again.  Without the
grouping, intermediate settings might be visible as glitches.  Delays
within the grouped commands are ignored, and animateValue instructions
will go directly to the ending value.  It is an error to have a goto
instruction inside a grouping.

When each instruction is executed, a message is displayed in the console
so it is possible to see what the program is doing.  When back-stepping,
the console will show the instruction that was just undone.

Here is a summary of the instructions.  Detailed descriptions appear above
each instruction function in the code below.

    hide (<id>, [<id>, ...])
    show (<id>, [<id>, ...])
    hideLabel (<id>, [<id>, ...])
    showLabel (<id>, [<id>, ...])
    setLabel (<id>, <label-string>)
    setValue (<id>, <value>, [<delay>])
    startSlider (<id>, [<delay>])
    stopSlider (<id>, [<delay>])
    animateValue (<id>, <start-value>, <end-value>, <increment>, [<frame-delay>], [<delay>])
    setSliderProperties (<id>, {<properties>}, [<delay>])
    set (<id>, <properties>, [<delay>])
    stop (<message-string>)
    pause (<delay>)
    label (<label-name-string>)
    goto (<label-name-string>, [<repeat-count>])

### Instruction: hide
Parameter: ids - comma separated list of expression id's to hide
Hides all the expressions given as arguments to the instruction.
Equivalent to set(id, {hidden: true}) for each of the given id's.
Moves on to the next instruction immediately.

## Credits
Thanks to GitHub users jared-hughes and FabriceNayret for their guidance, examples and ideas for improvement.
