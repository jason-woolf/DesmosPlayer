# DesmosPlayer
Program the action in your Desmos graph to create animations for videos, presentations, etc.
## Introduction
When I started making short math videos using Desmos for the visuals, I would write down the sequence of actions I needed to perform on the expressions while doing a screen capture.  For example:  1) Show expression "1"; 2) Start slider for expression "1"; 3) Hide expression "1" and show expression "2"; and so on.  As my videos got longer and more involved, this became quite tedious.  If only there were a way to program those actions so it would just happen automatically.  Well, that is what DesmosPlayer will do.  You create a list of these actions, including pauses to get the timing right, and then click a button to start it running.
## Installation
Install the file desmosPlayer.user.js in your browser using your favorite script manager and make sure the installed script is enabled.  Typically (e.g. with Tampermonkey installed) this is done by clicking on the file name above, then clicking "Raw" and then "Install".  Then navigate to any Desmos calculator graph.
## Usage
To initialize the system, you will need to call the function desmosPlayer() with an array of instructions.  This can be done either by adding the call in the installed script itself, or by putting the same JavaScript code in the graph itself as a "note".  See below for complete details on how to write the instructions.  Once initialized, there will be some new buttons next to the "Save" button above the graph.  These include "Start", "Reset" and "Step" buttons, which control the execution of the instructions.
## Documentation
### Function: desmosPlayer (program, [properties])

Parameter | Description
---- | ----
program | An array of functions to be executed in sequence that control expressions in a Desmos graph.
properties | (optional) An object that conveys additional configuration parameters.

This is the main function of the DesmosPlayer module.  It sets up the environment needed to run the given program.
Create a program by filling an array with the results of "instruction functions" (see examples below), then pass this program
to the desmosPlayer() function, along with optional properties:

     graphTitle: A string value that has to match the title of the graph
                 in order for the system to be activated.
     allowSave:  If set to true, do not disable the "save" button after
                 the program has started.  It is normally disabled to
                 prevent accidental modification to the initial state.
     debugMode:  Set to 'true' to enable back-stepping.

### Instruction Functions

Instructions are generated by calling instruction functions.  Most of these functions take an `<id>` parameter
to indicate which expression(s) in the graph to operate on.  Each expression in a Desmos graph has a unique ID which is a string, although
they are normally numeric strings, so numeric syntax can be used (note: these are not the same as the index of the expression).  The ID
could be any string if the expression is created by your program (see the **set** instruction function below).

> :bulb: Tip: To find the ID of an expression, select that expression in the graph and type ctrl-Q.  The ID will be printed in the console window.

Here is an example of a typical desmosPlayer program:

```javascript
// Helpful symbolic names for expression ID's
const xPos = 139
const yPos = 140
const label = 141
const labelAngle = 144
const labelSize = 145
const val1 = 775
const val2 = 776

// Define the program
const exampleProgram = [
    show(label, 1000),
    startSlider(xPos, 1000),
    startSlider(yPos, 1000),
    startSlider(val1),
    animateValue(val2, 0, 1.5, 0.1, 0, 3000),
    stopSlider(val1),
    [startSlider(labelAngle),
     startSlider(labelSize)],
    pause(2500),
    hide(label)
]

// Load it
desmosPlayer(exampleProgram, {graphTitle: "Demo", debugMode: true});
```

There are two ways to create a program and call desmosPlayer() to load it.  One is to edit the desmosPlayer script (using your script manager's editor, for example) and insert this code somewhere within it, typically near the top, after the header comments, but before any actual code.  The other is to put it in a "note" expression within the Desmos graph itself.  If a graph has such a note, the desmosPlayer script will find and execute it when the graph is loaded.  If there are multiple notes with JavaScript code, only the first one will execute.

> :bulb: Tip: JavaScript notes can be executed manually by selecting the expression containing the note and typing ctrl-shift-Q.  This resets the graph to its initial state and runs the code.  This makes it easy to modify the program and re-run it.

> :bulb: Tip: Desmos currently does not have a way to type a newline character into a note. The program can be written in a separate text editor and then copy/pasted into the note.

### Buttons

When desmosPlayer has been called and a program is loaded and ready to run, a "Start" button will be added next to the "Save" button.
Clicking it will start the program and turn it into a "Stop"
button.  Clicking it again will stop execution of the program.  A
"Reset" button will also appear which when clicked will put the graph and
the running program back to their initial states so that the program can
be run again.

> :bulb: Tip: if the save button is accidentally used
> to overwrite the original graph after the program has run, hit the
> "Reset" button and save again.
    
There is also a "Step"
button which will execute one function in the program at a time.  If
debugMode is true, then a "Back Step" button also appears after the
program has started, allowing you to undo the effect of the previous
step, all the way back to the start of the program. This is expensive
since it saves the entire graph state after every step.

### Running the Program

When the "Start" button is pressed, execution of the instructions proceeds automatically from one to the next.
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

Without the grouping, intermediate states from setting individual values and showing or hiding
individual expressions might be visible as glitches.  Delays
within the grouped commands are ignored, and animateValue instructions
will go directly to the ending value.  It is an error to have a goto
instruction inside a grouping.

When each instruction is executed, a message is displayed in the console
so it is possible to see what the program is doing.  When back-stepping,
the console will show the instruction that was just undone.

Here is a summary of the instructions.  Detailed descriptions appear below.

    hide (<id>, [<id>, ...])
    show (<id>, [<id>, ...])
    hideLabel (<id>, [<id>, ...])
    showLabel (<id>, [<id>, ...])
    setLabel (<id>, <labelStr>)
    setValue (<id>, <value>, [<delay>])
    startSlider (<id>, [<delay>])
    stopSlider (<id>, [<delay>])
    animateValue (<id>, <startVal>, <endVal>, <increment>, [<frameDelay>], [<delay>])
    setSliderProperties (<id>, {<properties>}, [<delay>])
    set (<id>, <properties>, [<delay>])
    stop (<message-string>)
    pause (<delay>)
    label (<label-name-string>)
    goto (<label-name-string>, [<repeat-count>])

### Instruction Functions

#### hide \(\<id\>, \[\<id\>, ...\]\)
Parameter | Description
--- | ---
id | A comma-separated list of expression ID's to hide

Hides all the expressions given as arguments to the instruction.
Moves on to the next instruction immediately.

#### show \(\<id\>, \[\<id\>, ...\]\)
Parameter | Description
  --- | ---
  id | A comma-separated list of expression ID's

Shows (un-hides) all the expressions given as arguments to the instruction.
Moves on to the next instruction immediately.

#### hideLabel \(\<id\>, \[\<id\>, ...\]\)
Parameter | Description
--- | ---
id | A comma-separated list of expression ID's

Turns off the label of all the expressions given as arguments to
the instruction.  Moves on to the next instruction immediately.

#### showLabel \(\<id\>, \[\<id\>, ...\]\)
Parameter | Description
--- | ---
id | A comma-separated list of expression ID's

Turns on the label of all the expressions given as arguments to
the instruction.  Moves on to the next instruction immediately.

#### setLabel \(\<id\>, \<labelStr\>\)
Parameter | Description
--- | ---
id | The ID of an expression with a label
labelStr | The desired label string

Sets the label of the given expression to the given string.
If the string uses latex, enclose the latex in back-ticks as usual.

#### setValue \(\<id\>, \<value\>, \[\<delay\>\]\)
Parameter | Description
--- | ---
id | The ID of a "\<name\>=\<value\>" type of expression
value | Latex string or number of new value
delay | (optional) Number of ms to delay before next instruction

Replaces the `<value>` part of the given expression with the given value.
The value can be any latex expression string or a number.  If the
expression has a slider that is playing, it will be stopped first.

#### startSlider \(\<id\>, \[\<delay\>\]\)
Parameter | Description
--- | ---
id | The ID of an expression that has a slider
delay | (optional) Number of milliseconds to delay before next instruction

Equivalent to pressing the play button on a slider when it is not yet running.

#### stopSlider \(\<id\>, \[\<delay\>\]\)
Parameter | Description
--- | ---
id | The ID of an expression that has a slider
delay | (optional) Number of milliseconds to delay before next instruction

Equivalent to pressing the pause button on a slider when it is already running.

#### animateValue \(\<id\>, \<startVal\>, \<endVal\>, \<increment\>, \[\<frameTime\>\], \[\<delay\>\]\)
Parameter | Description
--- | ---
id | The ID of a "\<name\>=\<value\>" type of expression
startVal | The starting value for the animation
endVal | The ending value for the animation
interval | The amount to step by on each frame
frameTime | (optional) Number of milliseconds of explicit delay between frames
delay | (optional) Number of milliseconds to wait after animation is done

Animates a variable by setting its value to `startVal` and incrementing or
decrementing it by the given `interval` until it reaches `endVal`.  Speed
can be controlled by changing the `interval` and by giving a `frameTime` value.
This is similar to playing a slider, but allows explicit control over the
speed and the step size, and allows running in reverse.  The instruction
blocks until the `endVal` is reached, unlike startSlider which moves on to
the next instruction after the slider starts.  If the expression has a
slider that is playing, it will be stopped first.

#### setSliderProperties \(\<id\>, \{\<properties\>\}, \[\<delay\>\]\)
Parameter | Description
--- | ---
id | The ID of an expression with a slider
properties | The properties to be set
delay | Number of milliseconds to wait before next instruction

Sets the given properties of the given slider. Only the properties that you want to change need be specified. The properties are:

    min: <latex or number>
    max: <latex or number>
    step: <latex or number>
    period: <time in milliseconds from min to max>
    loopMode: "LOOP_FORWARD_REVERSE" or
              "LOOP_FORWARD" or
              "PLAY_ONCE" or
              "PLAY_FOREVER"

For example: `setSliderProperties(val1, {min: 0, max: 10, step: 1, period: 8000, loopMode: "PLAY_ONCE"})`\

## Credits
Thanks to GitHub users jared-hughes and FabriceNayret for their guidance, examples and ideas for improvement.
