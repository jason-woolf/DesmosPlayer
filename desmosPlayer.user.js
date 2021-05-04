// ==UserScript==
// @name          desmosPlayer
// @namespace     http://github.com/jason-woolf
// @version       1.1
// @description   Program a series of graph changes to create animation
// @author        Jason Woolf (MathyJaphy)
// @match         https://www.desmos.com/calculator*
// @grant         none
// @run-at        document-idle
// ==/UserScript==

// LICENSE: ISC
// Fork of https://gist.github.com/jared-hughes/b62dc3042947d6dcee16a186301227dc

"use strict"

function hide (...ids) {
    let verify = 1;
    const func = () => {
        if (verify) {
            verify = 0;
            for (let id of ids) {
                verifyId(id);
            }
        }
        for (let id of ids) {
            Calc.setExpression({id, hidden: true});
        }
    }
    func.desc = ["hide", arguments];
    return func;
}

function show (...ids) {
    let verify = 1;
    const func = () => {
        if (verify) {
            verify = 0;
            for (let id of ids) {
                verifyId(id);
            }
        }
        for (let id of ids) {
            Calc.setExpression({id, hidden: false});
        }
    }
    func.desc = ["show", arguments];
    return func;
}

function hideLabel (...ids) {
    let verify = 1;
    const func = () => {
        if (verify) {
            verify = 0;
            for (let id of ids) {
                verify(id);
            }
        }
        for (let id of ids) {
            Calc.setExpression({id, showLabel: false});
        }
    }
    func.desc = ["hideLabel", arguments];
    return func;
}

function showLabel (...ids) {
    let verify = 1;
    const func = () => {
        if (verify) {
            verify = 0;
            for (let id of ids) {
                verifyId(id);
            }
        }
        for (let id of ids) {
            Calc.setExpression({id, showLabel: true});
        }
    }
    func.desc = ["showLabel", arguments];
    return func;
}

function setLabel (id, labelStr, delay=0) {
    let verify = 1;
    const func = () => {
        if (verify) {
            verify = 0;
            verifyId(id);
        }
        Calc.setExpression({id, label: labelStr});
        return delay;
    }
    func.desc = ["setLabel", arguments];
    return func;
}

function setValue (id, value, delay=0) {
    let verify = 1;
    const stop_slider = {id, type: 'set-slider-isplaying', isPlaying: 0};
    const func = () => {
        if (verify) {
            verify = 0;
            verifyId(id);
        }
        let name = Calc.getExpressions().filter(e => e.id === id.toString())[0].latex;
        name = name.slice(0, name.lastIndexOf("=") + 1);
        if (name[name.length - 1] != '=') {
            throw "expression does not contain '='";
        }
        const obj = { id, latex: name + value };
        Calc.controller.dispatch(stop_slider);
        Calc.setExpression(obj);
        return delay;
    }
    func.desc = ["setValue", arguments];
    return func;
}

function startSlider (id, delay=0) {
    let verify = 1;
    const obj = {id, type: 'set-slider-isplaying', isPlaying: 1};
    const func = () => {
        if (verify) {
            verify = 0;
            verifyId(id);
        }
        Calc.controller.dispatch(obj);
        return delay;
    }
    func.desc = ["startSlider", arguments];
    return func;
}

function stopSlider (id, delay=0) {
    let verify = 1;
    const obj = {id, type: 'set-slider-isplaying', isPlaying: 0};
    const func = () => {
        if (verify) {
            verify = 0;
            verifyId(id);
        }
        Calc.controller.dispatch(obj);
        return delay;
    }
    func.desc = ["stopSlider", arguments];
    return func;
}

function animateValue(id, startVal, endVal, interval, frameTime=0, delay=0) {
    let name;
    let stop_cond;
    let verify = 1;
    if (startVal == endVal) throw "Animate values equal";
    if (interval <= 0) throw "Bad interval parameter: " + interval;
    function animateHelper (val, incr) {
        if (stop_cond(val, endVal) || animating == 2) {
            const obj = { id, latex: name + endVal }
            Calc.setExpression(obj);
            animating = 0;
        } else {
            val += incr
            const obj = { id, latex: name + val.toFixed(5) };
            Calc.setExpression(obj);
            setTimeout(() => animateHelper(val, incr), frameTime);
        }
    }
    const stop_slider = {id, type: 'set-slider-isplaying', isPlaying: 0};
    const func = () => {
        if (verify) {
            verify = 0;
            verifyId(id);
        }
        Calc.controller.dispatch(stop_slider);
        name = Calc.getExpressions().filter(e => e.id === id.toString())[0].latex;
        name = name.slice(0, name.lastIndexOf("=")+1);
        if (name[name.length - 1] != '=') {
            throw "expression does not contain '='";
        }
        if (grouping) {
            // Running as a group, so go straight to the end value
            stop_cond = (val, endVal) => (true);
            animateHelper(endVal);
        } else if (startVal < endVal) {
            stop_cond = (val, endVal) => (val >= endVal);
            animating = 1;
            animateHelper(startVal, interval);
        } else {
            stop_cond = (val, endVal) => (val <= endVal);
            animating = 1;
            animateHelper(startVal, -interval);
        }
        return delay;
    }
    func.desc = ["animateValue", arguments];
    return func;
}

function setSliderProperties(id, properties, delay=0) {
    let verify = 1;
    const func = () => {
        if (verify) {
            verify = 0;
            verifyId(id);
        }
        if (properties.min !== undefined) {
            Calc.controller.dispatch({id, type: 'set-slider-minlatex', latex: properties.min.toString()});
        }
        if (properties.max !== undefined) {
            Calc.controller.dispatch({id, type: 'set-slider-maxlatex', latex: properties.max.toString()});
        }
        if (properties.step !== undefined) {
            Calc.controller.dispatch({id, type: 'set-slider-steplatex', latex: properties.step.toString()});
        }
        if (properties.period !== undefined) {
            Calc.controller.dispatch({id, type: 'set-slider-animationperiod', animationPeriod: properties.period});
        }
        if (properties.loopmode !== undefined) {
            Calc.controller.dispatch({id, type: 'set-slider-loopmode', loopMode: properties.loopmode});
        }
        return delay;
    }
    func.desc = ["setSliderLimits", arguments];
    return func;
}

function set (id, properties, delay=0) {
    let verify = 1;
    const obj = { id, ...properties };
    const func = () => {
        if (verify) {
            verify = 0;
            const expr = Calc.getExpressions().filter(e => e.id === id.toString())[0];
            if (expr === undefined) {
                if (properties.latex === undefined) {
                    throw("set function with unknown id without latex property");
                }
            }
        }
        Calc.setExpression(obj);
        return delay;
    }
    func.desc = ["set", {1: id, 2: JSON.stringify(properties), 3: delay}];
    return func;
}

function stop (messageStr) {
    const func = () => {
        message.innerHTML = messageStr;
        startButton.firstChild.innerHTML = 'Start';
        running = 0;
    }
    func.desc = ["stop", arguments];
    return func;
}

function pause (delay) {
    const func = () => delay;
    func.desc = ["pause", arguments];
    return func;
}

function label (name) {
    const labelFunc = () => {
        // If called internally for filling in the labels object, add
        // this label to it.  Otherwise just return.
        if (labelIndex >= 0) {
            labels[name] = labelIndex;
        }
    }
    labelFunc.desc = ["label", arguments];
    return labelFunc;
}

function goto (name, repeat=-1) {
    let count = repeat;
    let lastReset = 0;
    const gotoFunc = () => {
        if (grouping) {
            throw("\"goto\" not allowed in a statement group");
        }
        if (name in labels) {
            // If we have hit "reset" since we were last here,
            // reset the repeat count
            if (lastReset != resetCount) {
                count = repeat;
                lastReset = resetCount;
            }
            if (backStepping) {
                // Reset the count to what it was
                if (count == repeat) {
                    count = 0;
                } else {
                    count++;
                }
            } else {
                // Goto label if count>0, otherwise reset the count
                if (count == 0) {
                    count = repeat;
                } else {
                    count--;
                    currentIndex = labels[name];
                }
            }
        } else {
            disableButton(startButton);
            disableButton(stepButton);
            message.innerHTML = "Error: unknown label (\"" + name + "\")";
            throw("Unknown label: " + name);
        }
    }
    gotoFunc.desc = ["goto", arguments];
    return gotoFunc;
}

// --------------------------------
// Internal variables and functions
// --------------------------------

let Calc;
let currentIndex = -1;
let resetButton, startButton, message;
let stepButton, revStepButton, saveButton;
let running = 0, stepping = 0, grouping = 0, animating = 0, backStepping = 0;
let steps;
let labelIndex = -1;
let labels = {};
let debugMode = false;
let allowSave = false;
let history = [];

// Counter that increments when the reset button is
// pressed.  Used by the goto instruction to reset
// its internal count if a reset has occurred since
// it was last executed.
let resetCount = 0;

function testlog (s) {
    console.log(`%c${s}`, 'font-weight: bold; border: 1px solid black; border-radius: 999px; padding: 3px 5px 3px 5px');
}

function steplog (index, undo) {
    let dash = undo ? "-" : "";
    if (steps[index].constructor === Array) {
        let str = dash + (index + 1) + ": ";
        const indent = str.length;
        for (let i of steps[index]) {
            if (i != steps[index][0]) {
                str += " ".repeat(indent);
            }
            str += i.desc[0] + "(" + Object.values(i.desc[1]) + ")";
            if (i != steps[index][steps[index].length-1]) {
                str += "\n";
            }
        }
        testlog(str);
    } else {
        testlog(dash + (index + 1) + ": " + steps[index].desc[0] + "(" +
                    Object.values(steps[index].desc[1]) + ")");
    }
}

function enableButton (el) {
    if (el != undefined) {
        el.firstChild.classList.add('dcg-btn-green');
        el.firstChild.classList.remove('disabled-save-btn');
    }
}

function disableButton (el) {
    if (el != undefined) {
        el.firstChild.classList.remove('dcg-btn-green');
        el.firstChild.classList.add('disabled-save-btn');
    }
}

// Wait for animation to finish
function waitForAnimation (func, delay) {
    const interval = setInterval(() => {
        if (!animating) {
            clearInterval(interval);
            setTimeout(func, delay);
        }
    }, 100);
}

// Tell the animation to stop and then wait for it to do so
function cancelAnimation (func) {
    if (animating == 1) {
        // Special value of 2 tells animateHelper to stop now!
        animating = 2;
        waitForAnimation (func, 0);
    }
}

function advance () {
    setState(currentIndex + 1);
}

function runStatement(stmt) {
    let delay = 0;
    if (stmt.constructor === Array) {
        let saveGrouping = grouping;
        grouping = 1;
        for (let i of stmt) {
            runStatement(i);
        }
        grouping = saveGrouping;
    } else {
        delay = stmt();
    }
    if (running && !grouping) {
        if (animating) {
            waitForAnimation(advance, delay);
        } else {
            setTimeout(advance, delay);
        }
    }
}

function setState (index) {
    if (!running && !stepping) {
        return;
    }
    if (index >= steps.length) {
        running = 0;
        stepping = 0;
        startButton.firstChild.innerHTML = 'Start';
        markState(index);
        return;
    }
    index = Math.max(index, 0);
    currentIndex = index;
    steplog(index, false);
    markState(index);
    runStatement(steps[index]);
    if (!allowSave) {
        disableButton(saveButton);
    }
}

function markState (index) {
    if (index >= 0) {
        enableButton(resetButton);
        enableButton(revStepButton);
    } else {
        disableButton(resetButton);
        if (history.length == 0) {
            disableButton(revStepButton);
        }
    }
    if (index === steps.length) {
        disableButton(startButton);
        disableButton(stepButton);
    } else {
        enableButton(startButton);
        enableButton(stepButton);
    }
    message.innerHTML = (``);

    if (index >= 0 && index < steps.length && (debugMode || index == 0) && !backStepping) {
        history.push({i: index, state: Calc.getState()});
    }
}

function verifyId (id, desc) {
    const expr = Calc.getExpressions().filter(e => e.id === id.toString())[0];
    if (expr === undefined) {
        throw "undefined id (" + id + ")";
    }
}

function resetState() {
    const func = () => {
        running = 0;
        currentIndex = -1;
        resetCount++;
        markState(-1);
        startButton.firstChild.innerHTML = 'Start';
        Calc.setState(history[0].state, { allowUndo: true });
        history = [];
    }
    if (history.length == 0) {
        return;
    }
    if (animating) {
        cancelAnimation(func);
    } else {
        func();
    }
}

// Set up the environment to run the given program
function desmosPlayer (program, properties={}) {

    const interval = setInterval(() => {
        if (document.querySelector('.save-button') && window.Calc) {
            Calc = window.Calc;
            init();
            clearInterval(interval);
        }
    }, 100);

    function init () {

        steps = program;

        let title = document.querySelector('.dcg-variable-title');

        // If a graphName is given, it has to match the graph title
        if ((properties.graphTitle != undefined) && (properties.graphTitle !== title.innerHTML)) {
            return;
        }

        if (properties.debugMode == true) {
            debugMode = true;
        } else {
            debugMode = false;
        }

        if (properties.allowSave == true) {
            allowSave = true;
        } else {
            allowSave = false;
        }

        testlog("desmosPlayer ready");

        // If we're being called for the first time, set up the buttons
        // and other objects.  Otherwise, just reset everything.
        if (saveButton !== undefined) {
            resetState();
        } else {
            saveButton = document.querySelector('.save-button');

            resetButton = saveButton.cloneNode(true);
            resetButton.firstChild.innerHTML = 'Reset';
            resetButton.addEventListener('click', resetState);
            saveButton.after(resetButton);

            startButton = resetButton.cloneNode(true);
            startButton.firstChild.innerHTML = 'Start';
            startButton.addEventListener('click', () => {
                const func = () => {
                    if (running) {
                        running = 0;
                        startButton.firstChild.innerHTML = 'Start';
                    } else {
                        running = 1;
                        startButton.firstChild.innerHTML = 'Stop';
                        setState(currentIndex + 1);
                    }
                    stepping = 0;
                }
                if (animating) {
                    cancelAnimation(func, 0);
                } else {
                    func();
                }
            })
            resetButton.after(startButton);
            enableButton(startButton);

            stepButton = resetButton.cloneNode(true);
            stepButton.firstChild.innerHTML = 'Step';
            stepButton.addEventListener('click', () => {
                const func = () => {
                    if (running) {
                        return;
                    } else {
                        stepping = 1;
                        advance();
                        stepping = 0;
                    }
                }
                if (animating) {
                    cancelAnimation(func);
                } else {
                    func();
                }
            })
            startButton.after(stepButton);
            enableButton(stepButton);

            if (debugMode) {
                revStepButton = resetButton.cloneNode(true);
                revStepButton.firstChild.innerHTML = 'Back Step';
                revStepButton.addEventListener('click', () => {
                    const func = () => {
                        if (running) {
                            return;
                        } else if (currentIndex > -1) {
                            let lastState = history.pop();
                            currentIndex = lastState.i - 1;
                            Calc.setState(lastState.state);
                            steplog(lastState.i, true);
                            backStepping = 1;
                            if (steps[lastState.i].name == "gotoFunc") {
                                steps[lastState.i]();
                            }
                            markState(currentIndex);
                            backStepping = 0;
                        }
                    }
                    if (animating) {
                        cancelAnimation(func);
                    } else {
                        func();
                    }
                })
                stepButton.after(revStepButton);
            }

            message = title.cloneNode(true);
            message.style.maxWidth = '600px';

            const buttonContainer = document.querySelector('.save-btn-container');
            buttonContainer.after(message);
            buttonContainer.style.position = 'relative';
            buttonContainer.style.top = '-18px';

            document.querySelector('.align-center-container').style.display = 'none';
        }

        // Fill in the label object with index values for each label
        for (labelIndex = 0; labelIndex < steps.length; labelIndex++) {
            if (steps[labelIndex].name == "labelFunc") {
                // The label name is known only to the function in the program
                // It will fill in labels[labelName] if global labelIndex >= 0.
                steps[labelIndex]();
            }
        }
        labelIndex = -1;

        markState(currentIndex);
    }
}

// Check if the given program string is a script that we should execute.
// Checks for "desmosPlayer" followed by an open paren and a close paren.
function isAProgram (text) {
    if (text === undefined) {
        return false;
    }
    const dpPos = text.indexOf("desmosPlayer");
    if (dpPos == -1) {
        return false;
    }
    const dpCall = text.slice(dpPos);
    const oParen = dpCall.indexOf("(");
    if (oParen == -1) {
        return false;
    }
    const cParen = dpCall.indexOf(")");
    return cParen > oParen;
}

(function () {
    const interval = setInterval(() => {
        if (document.querySelector('.save-button') && window.Calc) {
            Calc = window.Calc;
            init()
            clearInterval(interval);
        }
    }, 100);

    function init () {

        // Set up keydown events for expressions: ctrl-Q prints the selected
        // expression's ID in console; ctrl-shift-Q executes the selected
        // note's text as a script if it sees "desmosPlayer" in it.
        const exprList = document.querySelector('.dcg-exppanel-outer');
        exprList.addEventListener('keydown', e => {
            if (e.code === 'KeyQ' && e.ctrlKey) {
                const selExprId = Calc.selectedExpressionId;
                if (selExprId == undefined) {
                    testlog("Select an expression");
                } else if (!e.shiftKey) {
                    const latex = Calc.getExpressions().filter(e => e.id === selExprId.toString())[0].latex;
                    if (latex === undefined) {
                        testlog("id: " + selExprId);
                    } else {
                        testlog("id: " + selExprId + " (" + latex + ")");
                    }
                } else {
                    const prog = Calc.getState().expressions.list.filter(e => e.id === selExprId.toString())[0].text;
                    if (isAProgram(prog)) {
                        eval(prog);
                    } else {
                        testlog("Can't find call to desmosPlayer() in text");
                    }
                }
            }
        });

        // See if there is a script in a note.
        // If so, execute the first one found automatically.
        for (let expr of Calc.getState().expressions.list) {
            if (isAProgram(expr.text)) {
                eval(expr.text);
                break;
            }
        }
    }
} )()
