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

const versionMajor = 1;
const versionMinor = 1;
const versionStr = `v${versionMajor}.${versionMinor}`;

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
    func.desc = ['hide', arguments];
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
    func.desc = ['show', arguments];
    return func;
}

function hideLabel (...ids) {
    let verify = 1;
    const func = () => {
        if (verify) {
            verify = 0;
            for (let id of ids) {
                verifyId(id);
            }
        }
        for (let id of ids) {
            Calc.setExpression({id, showLabel: false});
        }
    }
    func.desc = ['hideLabel', arguments];
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
    func.desc = ['showLabel', arguments];
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
    func.desc = ['setLabel', arguments];
    return func;
}

function doSetValue (id, value) {
    const stop_slider = {id, type: 'set-slider-isplaying', isPlaying: 0};
    let name = Calc.getExpressions().filter(e => e.id === id.toString())[0].latex;
    name = name.slice(0, name.lastIndexOf('=') + 1);
    if (name[name.length - 1] != '=') {
        throw "expression does not contain '='";
    }
    const obj = { id, latex: `${name}${value}` };
    Calc.controller.dispatch(stop_slider);
    Calc.setExpression(obj);
}

function setValue (id, value, delay=0) {
    let verify = 1;
    const func = () => {
        if (verify) {
            verify = 0;
            verifyId(id);
        }
        doSetValue (id, value);
        return delay;
    }
    func.desc = ['setValue', arguments];
    return func;
}

function setValue0 (...ids) {
    let verify = 1;
    const func = () => {
        if (verify) {
            verify = 0;
            for (let id of ids) {
                verifyId(id);
            }
        }
        for (let id of ids) {
            doSetValue(id, 0);
        }
    }
    func.desc = ['setValue0', arguments];
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
    func.desc = ['startSlider', arguments];
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
    func.desc = ['stopSlider', arguments];
    return func;
}

function animateValue(id, startVal, endVal, interval, frameTime=0, delay=0) {
    let name;
    let stop_cond;
    let verify = 1;
    if (startVal == endVal) throw 'Animate values equal';
    if (interval <= 0) throw `Bad interval parameter: ${interval}`;
    function animateHelper (val, incr) {
        if (stop_cond(val, endVal) || animating == 2) {
            const obj = { id, latex: `${name}${endVal}` }
            Calc.setExpression(obj);
            animating = 0;
        } else {
            val += incr
            const obj = { id, latex: `${name}${val.toFixed(5)}` };
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
        name = name.slice(0, name.lastIndexOf('=')+1);
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
    func.desc = ['animateValue', arguments];
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
    func.desc = ['setSliderLimits', arguments];
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
                    throw('set function with unknown id without latex property');
                }
            }
        }
        Calc.setExpression(obj);
        return delay;
    }
    func.desc = ['set', {1: id, 2: JSON.stringify(properties), 3: delay}];
    return func;
}

function stop (messageStr) {
    const func = () => {
        message.innerHTML = messageStr;
        startButton.firstChild.innerHTML = 'Start';
        running = 0;
    }
    func.desc = ['stop', arguments];
    return func;
}

function pause (delay) {
    const func = () => delay;
    func.desc = ['pause', arguments];
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
    labelFunc.desc = ['label', arguments];
    return labelFunc;
}

function goto (name, repeat=-1) {
    let count = repeat;
    let lastReset = 0;
    const gotoFunc = () => {
        if (grouping) {
            throw('"goto" not allowed in a statement group');
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
            message.innerHTML = `Error: unknown label ("${name}")`;
            throw(`Unknown label: ${name}`);
        }
    }
    gotoFunc.desc = ['goto', arguments];
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
let history = [];
let userChanged = false;
let changeCount = 0;
let progClosure = undefined;

// Counter that increments when the reset button is
// pressed.  Used by the goto instruction to reset
// its internal count if a reset has occurred since
// it was last executed.
let resetCount = 0;

function testlog (s) {
    console.log(`%c${s}`, 'font-weight: bold; border: 1px solid black; border-radius: 10px; padding: 3px 5px 3px 5px');
}

function steplog (index, undo) {
    let dash = undo ? '-' : '';
    if (steps[index].constructor === Array) {
        let str = `${dash}${index + 1}: `;
        const indent = str.length;
        for (let i of steps[index]) {
            if (i != steps[index][0]) {
                str += ' '.repeat(indent);
            }
            str += `${i.desc[0]}(${Object.values(i.desc[1])})`;
            if (i != steps[index][steps[index].length-1]) {
                str += '\n';
            }
        }
        testlog(str);
    } else {
        testlog(`${dash}${index+1}: ${steps[index].desc[0]}(${Object.values(steps[index].desc[1])})`);
    }
}

function playerButtonColor (el) {
    if (el == revStepButton) {
        if (history.length > 0 && history[history.length - 1].userChangeCount != changeCount) {
            return 'dcg-btn-red';
        }
    }

    return 'dcg-btn-blue';
}

function enableButton (el) {
    if (el != undefined) {
        let color = playerButtonColor(el);
        let btn = el.firstChild;
        if (!btn.classList.contains(color)) {
            btn.classList.remove('dcg-btn-blue');
            btn.classList.remove('dcg-btn-red');
            btn.classList.add(playerButtonColor(el));
            btn.classList.remove('disabled-save-btn');
        }
    }
}

function disableButton (el) {
    if (el != undefined && !el.firstChild.classList.contains('disabled-save-btn')) {
        let btn = el.firstChild;
        btn.classList.add('disabled-save-btn');
        btn.classList.remove('dcg-btn-blue');
        btn.classList.remove('dcg-btn-red');
    }
}

function checkBackStepStomp () {
    if (debugMode && history.length > 0) {
        if (history[history.length - 1].userChangeCount == changeCount) {
            if (revStepButton.firstChild.classList.contains('dcg-btn-red')) {
                revStepButton.firstChild.classList.add('dcg-btn-blue');
                revStepButton.firstChild.classList.remove('dcg-btn-red');
            }
        } else {
            if (revStepButton.firstChild.classList.contains('dcg-btn-blue')) {
                revStepButton.firstChild.classList.add('dcg-btn-red');
                revStepButton.firstChild.classList.remove('dcg-btn-blue');
            }
        }
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
        try {
            delay = stmt();
        } catch (e) {
            const prog = document.querySelector('.program-loaded');
            if (prog) {
                prog.classList.add('program-error');
                prog.classList.remove('program-loaded');
            }
            console.error(e);
            startStop();
        }
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
}

function markState (index) {
    if (index >= 0) {
        if (index < steps.length && debugMode && !backStepping) {
            history.push({i: index, userChangeCount: changeCount, state: Calc.getState()});
        }
        enableButton(resetButton);
        if (debugMode) enableButton(revStepButton);
    } else {
        disableButton(resetButton);
        if (history.length == 0) {
            disableButton(revStepButton);
        }
    }
    if (index >= steps.length - 1) {
        disableButton(startButton);
        disableButton(stepButton);
    } else {
        enableButton(startButton);
        enableButton(stepButton);
    }
    message.innerHTML = (``);
}

// Text of currently loaded program, if any
let programText = undefined;

// See if the text has changed since it was loaded
// or since it had an error.  If so, clear the button.
function changeCheck(el) {
    const textarea = el.querySelector('.dcg-displayTextarea');
    if (textarea.textContent !== programText) {
        el.classList.remove('program-loaded');
        el.classList.remove('program-error');
    } else if (!el.classList.contains('program-error')) {
        el.classList.add('program-loaded');
    }
}

// Check for a version comment in the program and if found,
// confirm that it is compatible with the current version.
function checkVersion(prog) {
    const headerObj = /\/\/ @desmosPlayer \(v[0-9|.]*\)/.exec(prog);
    if (!headerObj) {
        return true;
    }
    const header = headerObj.toString();
    const progVersion = header.slice(header.indexOf('(')+1, header.indexOf(')'));
    const vnums = progVersion.split(/[v(.)]/);
    if ((vnums[1] && vnums[1] != versionMajor) ||
        (vnums[2] && vnums[2] > versionMinor)) {
        return window.confirm(`This program appears to be written for version ${progVersion}. You are currently running version ${versionStr}. Please consider upgrading to the latest version.  Would you like to try running this program anyway?`)
    }

    return true;
}

// JS string that assigns a function to global progClosure that
// will support finding expressions by the symbolic name for their ID.
// This string will be eval'd along with the user's program which
// contains those symbolic names.
const progClosureStr = "\nprogClosure = (str) => eval(str)";

// Change a normal "note" expression to a "program", given the
// HTML element for the expression.  Implements changeNoteToProgram().
function cNTP (el) {
    if (!el || el.classList.contains('program-textexpr')) {
        return;
    }
    el.classList.add('program-textexpr');
    const textarea = el.querySelector('textarea');
    if (!textarea) return;
    textarea.classList.add('program-textarea');
    if (!textarea.onKeyDownBackup) {
        let changeCheckTimer;
        textarea.onKeyDownBackup = textarea.onkeydown;
        textarea.onkeydown = e => {
            const e1 = e.key == 'Enter';
            const e2 = e.key == 'ArrowDown';
            const e3 = e.key == 'ArrowUp';
            if (!(e1 || e2 || e3)) {
                textarea.onKeyDownBackup();
            }
            clearTimeout(changeCheckTimer);
            changeCheckTimer = setTimeout(() => {
                changeCheck(el);
            }, 250);
        }
        textarea.spellcheck = false;
    }
    const tab = el.querySelector('.dcg-tab');
    const button = document.createElement('span');
    button.classList.add('dcg-circular-icon-container');
    button.classList.add('dcg-expression-icon-container');
    button.role = 'button';
    tab.appendChild(button);
    const anotherone = document.createElement('span');
    anotherone.classList.add('dcg-circular-icon');
    anotherone.classList.add('dcg-thick-outline');
    button.appendChild(anotherone);
    const progIcon = el.querySelector('i.dcg-icon-text');
    anotherone.appendChild(progIcon);
    button.addEventListener('click', () => {
        const el = document.querySelector('.dcg-expressiontext.dcg-hovered');
        if (!el.classList.contains('program-loaded')) {
            const textarea = el.querySelector('.dcg-displayTextarea');
            if (checkVersion(textarea.textContent)) {
                const loaded = document.querySelector('.program-loaded');
                el.classList.add('program-error');
                eval(textarea.textContent + progClosureStr);
                programText = textarea.textContent;
                el.classList.add('program-loaded');
                el.classList.remove('program-error');
                if (loaded) {
                    loaded.classList.remove('program-loaded');
                }
            }
        }
    });
    setTimeout(changeCheck(el), 250);
}

// Change behavior a "note" expression so that it becomes a program
// expression.  Icon changes, and enter, up-arrow and down-arrow do
// not move to another expression.
function changeNoteToProgram (expr) {
    const el = document.querySelector(`.dcg-expressiontext[expr-id="${expr.id}"]`);
    cNTP(el);
}

// Reset the Calc state to the given state.  But first,
// replace the text of any program in the saved state
// with the current version of that program.
function setCalcState(state) {
    foreachProgram((expr) => {
        const stateExprs = state.expressions.list.filter(e => e.id === `${expr.id}`);
        if (stateExprs.length != 0) {
            stateExprs[0].text = expr.text;
        }
    });
    Calc.setState(state, {allowUndo: true});
}

function verifyId (id, desc) {
    const expr = Calc.getExpressions().filter(e => e.id === id.toString())[0];
    if (expr === undefined) {
        throw `invalid id (${id})`;
    }
}

function foreachProgram (func) {
    for (let expr of Calc.getState().expressions.list) {
        if (expr.type == 'text' && isAProgram(expr.text)) {
            func(expr);
        }
    }
}

function resetState() {
    const func = () => {
        running = 0;
        currentIndex = -1;
        resetCount++;
        startButton.firstChild.innerHTML = 'Start';
        history = [];
        markState(-1);
        console.clear();
        testlog('desmosPlayer ready');
    }
    if (currentIndex < 0) {
        return;
    }
    if (animating) {
        cancelAnimation(func);
    } else {
        func();
    }
}

function startStop() {
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

        if (properties.debugMode == true) {
            debugMode = true;
        } else {
            debugMode = false;
        }

        console.clear();
        testlog('desmosPlayer ready');

        // If we're being called for the first time, set up the buttons
        // and other objects.  Otherwise, just reset everything.
        if (saveButton !== undefined) {
            resetState();
        } else {
            saveButton = document.querySelector('.save-button');

            startButton = saveButton.cloneNode(true);
            startButton.firstChild.innerHTML = 'Start';
            startButton.addEventListener('click', startStop);
            startButton.firstChild.classList.remove('dcg-btn-green');
            startButton.firstChild.classList.remove('disabled-save-btn');
            startButton.firstChild.classList.add('dcg-btn-blue');
            saveButton.after(startButton);

            resetButton = startButton.cloneNode(true);
            resetButton.firstChild.innerHTML = 'Reset';
            resetButton.addEventListener('click', resetState);
            resetButton.classList.add('player-button');
            startButton.after(resetButton);

            startButton.classList.add('start-button');

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
            resetButton.after(stepButton);

            revStepButton = stepButton.cloneNode(true);
            revStepButton.firstChild.innerHTML = 'Back Step';
            revStepButton.addEventListener('click', () => {
                const func = () => {
                    if (running) {
                        return;
                    } else if (currentIndex > -1) {
                        let lastState = history.pop();
                        backStepping = 1;
                        currentIndex = lastState.i - 1;
                        changeCount = lastState.userChangeCount;
                        setCalcState(lastState.state);
                        steplog(lastState.i, true);
                        if (steps[lastState.i].name == 'gotoFunc') {
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

            const title = document.querySelector('.dcg-variable-title');
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
            if (steps[labelIndex].name == 'labelFunc') {
                // The label name is known only to the function in the program
                // It will fill in labels[labelName] if global labelIndex >= 0.
                steps[labelIndex]();
            }
        }
        labelIndex = -1;

        markState(currentIndex);
    }
}

function undoDesmosPlayer () {
    resetState();
    steps = undefined;
    programText = undefined;
    saveButton = undefined;
    progClosure = undefined;
    if (startButton) {
        startButton.remove();
        resetButton.remove();
        stepButton.remove();
    }
    if (revStepButton) {
        revStepButton.remove();
    }
}

// Check if the given program string is a script that we should execute.
// Checks for "desmosPlayer" followed by an open paren and a close paren.
function isAProgram (text) {
    if (text === undefined) {
        return false;
    }
    const dpPos = text.indexOf('desmosPlayer');
    if (dpPos == -1) {
        return false;
    }
    const dpCall = text.slice(dpPos);
    const oParen = dpCall.indexOf('(');
    if (oParen == -1) {
        return false;
    }
    const cParen = dpCall.indexOf(')');
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

    function copyToClipboard (text) {
        const el = document.activeElement;
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        el.focus();
    }

    // Find the offset in pixels from the top of the expression
    // list to the start of the given element (a displayTextarea).
    function getExprListOffset (exprElem) {
        let offset = exprElem.offsetTop;
        let elem = exprElem.offsetParent;
        while (!elem.classList.contains('dcg-expressionlist')) {
            offset += elem.offsetTop;
            elem = elem.offsetParent;
        }
        return offset;
    }

    function init () {

        // Set up a listener to implement ctrl-click actions for finding the
        // ID of an expression or finding an expression for the ID currently
        // in selected text, and the alt-click action of searching for the
        // selected text within the program.
        const exprList = document.querySelector('.dcg-exppanel-outer');
        exprList.addEventListener('click', e => {
            if (e.altKey) {
                // implement alt-click search for the next (or the ctrl-alt-click search
                // for the previous) occurance of the selected text within the program.
                let selExprId = Calc.selectedExpressionId;
                const el = document.querySelector(`.dcg-expressionitem[expr-id="${selExprId}"]`);
                if (el.classList.contains('program-textexpr')) {
                    const textarea = el.querySelector('textarea');
                    const display = el.querySelector('.dcg-displayTextarea');
                    const selStart = textarea.selectionStart;
                    const selEnd = textarea.selectionEnd;
                    if (selEnd > selStart) {
                        let nextIndex;
                        let selection = window.getSelection();
                        const searchStr = selection.toString();
                        if (e.ctrlKey || e.metaKey) {
                            // Reverse search
                            nextIndex = textarea.value.slice(0, selStart).lastIndexOf(searchStr);
                            if (nextIndex == -1) {
                                nextIndex = textarea.value.lastIndexOf(searchStr);
                            }
                        } else {
                            // Forward search
                            nextIndex = textarea.value.slice(selEnd).indexOf(searchStr);
                            if (nextIndex == -1) {
                                nextIndex = textarea.value.indexOf(searchStr);
                            } else {
                                nextIndex += selEnd;
                            }
                        }
                        if (nextIndex >= 0) {
                            // Move the secection to the next/previoius occurrance
                            window.getSelection().empty();
                            textarea.setSelectionRange(nextIndex, nextIndex + selEnd - selStart);
                            // Scroll to new selection
                            if (selStart != nextIndex) {
                                // Find the vertical pixel locations of the current and next
                                // occurrance of the search string.  Do this by truncating the
                                // text content of the displayTextarea and getting the resulting
                                // scrollHeight.  Then restore the text to its original content.
                                const origText = display.textContent;
                                display.textContent = origText.slice(0, nextIndex);
                                const newSelOffset = display.scrollHeight;
                                display.textContent = origText.slice(0, selStart);
                                const scrollDiff = newSelOffset - display.scrollHeight;
                                display.textContent = origText;
                                if (scrollDiff != 0) {
                                    // If there is a difference in the vertical position of the
                                    // new selection, check whether it is within the displayed
                                    // region, and scroll to it if not.
                                    const newScrollPos = newSelOffset + getExprListOffset(display);
                                    const scroller = exprList.querySelector('.dcg-exppanel');
                                    if (newScrollPos < scroller.scrollTop + 30 || newScrollPos > scroller.scrollTop + scroller.clientHeight) {
                                        scroller.scrollTop = scroller.scrollTop + scrollDiff;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (e.ctrlKey || e.metaKey) {
                // Ctrl-click detected. Decide what to do based on whether the
                // currently selected expression is a program or not.
                let expr;
                let selExprId = Calc.selectedExpressionId;
                const exprArr = Calc.getState().expressions.list;
                const el = document.querySelector(`.dcg-expressionitem[expr-id="${selExprId}"]`);
                if (el.classList.contains('program-textexpr') && window.getSelection().toString().length > 0) {
                    // We clicked in a pragram and there is a selection.  Do the ctrl-click action
                    // of grabbing the id of the selected text, either literally or by looking up the
                    // selected symbolic name, and then select and scroll to the corresponding expression.
                    let sel = window.getSelection().toString();
                    let exprs = exprArr.filter(e => e.id == sel);
                    if (exprs.length == 0) {
                        // Selected text is not an ID, maybe it's a variable for an ID
                        if (progClosure) {
                            try {
                                sel = progClosure(sel);
                            } catch {
                                throw('Selected text is not an ID or a symbolic name of an ID');
                            }
                            exprs = exprArr.filter(e => e.id == sel.toString());
                            if (exprs.length == 0) {
                                throw('Selected text is not an ID or a symbolic name for an ID');
                            }
                        } else {
                            throw('Selected text is not an ID (load program to enable symbolic name lookup)');
                        }
                    }
                    expr = exprs[0];
                    selExprId = sel;
                    // Select and scroll to the expression
                    expr.folderId && Calc.controller.dispatch({type: 'set-folder-collapsed', id: expr.folderId, isCollapsed: false});
                    Calc.controller.dispatch({type: 'set-focus-location', location: {type: expr.type, id: expr.id}});
                } else {
                    // We did not click in a program or there was no selection.  Copy the ID of the
                    // selected expression to the clipboard.
                    expr = exprArr.filter(e => e.id === selExprId)[0];
                    copyToClipboard(selExprId);
                }

                // Display the ID and index of the indicated expression in the console
                const idx = exprArr.indexOf(expr) + 1;
                if (isNaN(selExprId)) {
                    selExprId = `"${selExprId}"`;
                }
                testlog(`[${idx}] id: ${selExprId}`);
            }
        });

        function injectStyle() {
            const styleEl = document.createElement('style')
            styleEl.innerHTML = `
             .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr .dcg-icon-text {
                 opacity: .8;
                 -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=80)";
                 filter: alpha(opacity=80);
             }
             .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr .dcg-circular-icon-container.dcg-hovered .dcg-icon-text {
                 opacity: 1;
                 -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";
                 filter: alpha(opacity=100);
             }
             .dcg-drag-container .dcg-expressionitem.dcg-expressiontext.program-textexpr .dcg-smart-textarea-container .dcg-displayTextarea,
             .dcg-drag-container .dcg-expressionitem.dcg-expressiontext.program-textexpr .dcg-smart-textarea-container .dcg-smart-textarea,
             .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr .dcg-smart-textarea-container .dcg-displayTextarea,
             .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr .dcg-smart-textarea-container .dcg-smart-textarea {
                font-family: courier;
                font-size: 80%;
             }
             .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr .dcg-circular-icon-container {
                position: sticky;
                left: 3px;
                cursor: pointer;
              }
              .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr.dcg-selected .dcg-circular-icon,
              .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr.dcg-dragging .dcg-circular-icon {
                border-color: #fff;
                opacity: .9;
              }
              .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr.dcg-selected .dcg-circular-icon.dcg-hovered .dcg-circular-icon,
              .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr.dcg-dragging .dcg-circular-icon.dcg-hovered .dcg-circular-icon {
                border-color: #fff;
                opacity: 1;
              }
             .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr.program-loaded .dcg-circular-icon {
                background-color: #30A030;
                opacity: .8;
              }
              .dcg-calculator-api-container .dcg-expressionitem.dcg-expressiontext.program-textexpr.program-error .dcg-circular-icon {
                background-color: #D03030;
                opacity: .8;
              }
             .program-textexpr .dcg-icon-text::before {
               content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAIAAAC0tAIdAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA4SURBVChTYyAJMALx////IRz8gJERpJgEADUbqI+gDUA1TFAm8QBiKn6zIbKjLkEG9HEJsYCBAQAAATXz2xDSpwAAAABJRU5ErkJggg==);
               position: absolute;
               top: -1px;
               left: -1px;
             }
             .program-textexpr.dcg-selected .dcg-icon-text::before,
             .program-textexpr.dcg-dragging .dcg-icon-text::before{
               content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAIAAAC0tAIdAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABESURBVChTY/z//z8D0QCkOmXWGSgPL5iTZkKW2UB9BG0AqmGCMokDLFAaDIC6oSwMALEZRTVBx4y6BBOQ5hJS0gkDAwBCeyZ1Jwji5AAAAABJRU5ErkJggg==);
               position: absolute;
               top: -1px;
               left: -1px;
             }
             .prog-action-newexpression .dcg-icon-new-expression::before {
               content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAUCAIAAAD3FQHqAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVDhPY6AiYATi////QziUAEZGRiYoc7ABhB+BjqTEs1T2IzXNwu5HIBvCwA+QwwSoZbCG16gfCYBRPw4aP1IPMDAAAA+SRRngEMxiAAAAAElFTkSuQmCC);
             }
             .dcg-calculator-api-container .save-btn-container .save-button .dcg-btn-blue, .dcg-calculator-api-container .save-btn-container .save-button .dcg-btn-red {
               display: inline-block;
               height: 28px;
               line-height: 28px;
               padding: 0 15px;
             }
             .player-button {
                margin-left: 8px;
             }
             .start-button {
                margin-left: 40px;
             }
             .start-button .dcg-btn-blue, .player-button .dcg-btn-blue, .player-button .dcg-btn-red, .dcg-calculator-api-container .save-btn-container .player-button .disabled-save-btn {
               border-radius: 20px;
             }
             `
            document.head.appendChild(styleEl)
        }

        function addToExpressionDropdown () {
            if (!document.querySelector('.prog-action-newexpression')) {
                const newExpressionNode = document.querySelector('.dcg-action-newexpression');
                const newThreeNode = document.querySelector('.prog-action-newexpression');
                const newExpr = document.querySelector('.dcg-icon-new-expression');
                if (document.querySelector('.dcg-icon-new-expression') && !newThreeNode) {
                    const newNode = newExpressionNode.cloneNode(true);
                    newNode.classList.remove('dcg-action-newexpression');
                    newNode.classList.add('prog-action-newexpression');
                    newNode.querySelector('i').nextSibling.nodeValue = 'program';
                    newNode.addEventListener('click', () => {
                        const d = Calc.controller.createItemModel({
                            text: `// @desmosPlayer (${versionStr})\n\n// Helpful constants\nconst id1 = 1;\n\n// Program array\nconst program = [\n\nsetValue(id1, 0),\nhide(id1)\n\n]\n\ndesmosPlayer(program, {debugMode: true})`,
                            type: 'text',
                            id: Calc.controller.generateId(),
                        });
                        Calc.controller.setEditListMode(false);
                        Calc.controller._toplevelNewItemAtSelection(d, {
                            shouldFocus: true
                        });
                        Calc.controller._closeAddExpression();
                        Calc.controller.updateRenderShellsBeforePaint();
                        Calc.controller.updateViews();
                        Calc.controller.updateRenderShellsAfterDispatch();
                        setTimeout(() => changeNoteToProgram(d), 100);
                    });
                    newExpressionNode.after(newNode);
                }
            }
        }

        function initExpressionsObserver () {
            // Set up a mutation observer to recognize when an expression element is
            // created (e.g. when it scrolls back into view, etc.) and switch it to
            // a "program" if necessary.
            const targetNode = document.querySelector('.dcg-template-expressioneach')
            const config = { attributes: false, childList: true, subtree: false }
            const observer = new window.MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeName === '#text') {
                            continue;
                        }
                        const id = addedNode.attributes['expr-id']?.value
                        const expr = id ? Calc.getState().expressions.list.filter(e => e.id === id.toString())[0] : undefined
                        if (expr && expr.type == 'text' && isAProgram(expr.text)) {
                            cNTP(addedNode);
                        }
                    }
                }
            });
            observer.observe(targetNode, config);

            // Set up a second observer to do the same for the element created when an
            // expression is being dragged to a new position in the list.
            const targetNode1 = document.querySelector('.dcg-expressionlist')
            const observer1 = new window.MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeName === '#text') {
                            continue;
                        }
                        if (addedNode.classList.contains('dcg-drag-container')) {
                            const child = addedNode.querySelector('.dcg-expressiontext');
                            cNTP(child);
                        }
                    }
                }
            });
            observer1.observe(targetNode1, config);

            // Observe changes to the graph so we can stop the save button from turning
            // green for changes initiated by the running program, and to take note when
            // the user manually changes a graph element (that isn't a program).
            Calc.observeEvent('change', () => {
                if (saveButton) {
                    if (running || stepping || backStepping || animating) {
                        if (!userChanged && !saveButton.firstChild.classList.contains('disabled-save-btn')) {
                            Calc.controller.dispatch({type: 'clear-unsaved-changes'});
                        }
                    } else if (!document.activeElement.classList.contains('program-textarea')) {
                        userChanged = 1;
                        changeCount++;
                        if (debugMode && currentIndex >= 0) {
                            // Change button color if necessary
                            enableButton(revStepButton);
                        }
                    }
                }
            });
        }

        function handleDispatchedEvent (e) {
            switch (e.type) {
                case 'toggle-add-expression':
                    // Sneak our program item into the add-expression menu before it displays
                    addToExpressionDropdown();
                    break;
                case 'show-expressions-list':
                    // Expression list is brought (back) into existence, so change notes to
                    // programs and set up the observers.
                    foreachProgram(changeNoteToProgram);
                    initExpressionsObserver();
                    break;
                case 'clear-undoredo-history':
                    // A new graph has presumably been loaded, so toss any loaded program.
                    undoDesmosPlayer();
                    break;
                case 'clear-unsaved-changes':
                    // The user likely just clicked "save", so clear our flag indicating
                    // that there are unsaved user modifications to the graph.
                    if (!stepping && !running && !backStepping && !animating) {
                        userChanged = 0;
                    }
                    break;
            }
        }

        // Squelch the automatic scroll-into-view behavior for programs
        Calc.controller.origScrollItemIntoView = Calc.controller.scrollItemIntoView;
        Calc.controller.scrollItemIntoView = function (expr) {
            if (expr && expr.text && isAProgram(expr.text)) {
                // No auto scrolling for a program!
                return;
            }
            Calc.controller.origScrollItemIntoView(expr);
        }

        injectStyle();
        Calc.controller.dispatcher.register(handleDispatchedEvent);
        foreachProgram (changeNoteToProgram);
        initExpressionsObserver();

    } // Init()

} )() // Anonymous starting function
