# DesmosPlayer
Program the action in your Desmos graph to create animations for videos, presentations, etc.
## Introduction
When I started making short math videos using Desmos for the visuals, I would write down the sequence of actions I needed to perform on the expressions while doing a screen capture.  For example:  1) Show expression "1"; 2) Start slider for expression "1"; 3) Hide expression "1" and show expression "2"; and so on.  As my videos got longer and more involved, this became quite tedious.  If only there were a way to program those actions so it would just happen automatically.  Well, that is what DesmosPlayer will do.  You create a list of these actions, including pauses to get the timing right, and then click a button to start it running.
##Installation
Install the file desmosPlayer.user.js in your browser using your favorite script manager and make sure the installed script is enabled.  Typically (e.g. with Tampermonkey installed), click on the file name above, then click "Raw" and then "Install".  Then navigate to any Desmos calculator graph.
##Usage
To initialize the system, you will need to call the function desmosPlayer() with an array of instructions.  This can be done either by adding the call in the installed script itself, or by putting the same JavaScript code in a "note" as part of the graph's list of expressions.  See the repository's wiki page for complete instructions on how to write the instructions.  Once initialized, there will be some new buttons next to the "Save" button above the graph.  These include "Start", "Reset" and "Step" buttons, which control the execution of the instructions.
##Credits
Thanks to GitHub users jared-hughes and FabriceNayret for their guidance, examples and ideas for improvement.
