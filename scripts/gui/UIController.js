/*
    global
    QubitEditor
    AppController
    DragAndDropControls
    OverlaySelector
    JoystickCameraControls
*/
/*
    exported
    UIController
    UIControllerInstance
*/

class UIController {


    // Tool buttons //
    // =================== Choice Holder ===================

    revealChoice() {
        if (!this.$choiceHolder)
            this.$choiceHolder = document.getElementById("choice-holder")

        this.$choiceHolder.classList.add("revealed")
    }

    hideChoice() {
        if (!this.$choiceHolder)
            this.$choiceHolder = document.getElementById("choice-holder")

        this.$choiceHolder.classList.remove("revealed")
    }

    choiceClick() {
        if (!this.$choiceHolder)
            this.$choiceHolder = document.getElementById("choice-holder")
        const $tutorial = this.$choiceHolder.children.namedItem("choice-tutorial")
        const $sandbox = this.$choiceHolder.children.namedItem("choice-sandbox")

        let promises = [
            new Promise((resolve) => {
                $tutorial.onclick = () => {
                    UxSaverInstance.add('chooseTutorial')
                    resolve("tutorial")
                }
            }),
            new Promise((resolve) => {
                $sandbox.onclick = () => {
                    UxSaverInstance.add('chooseSandbox')
                    resolve("sandbox")
                }
            })
        ]
        return Promise.race(promises)
    }

    // =================== Info Holder ===================
    hideInfoHolder() {
        if (!this.$infoHolder)
            this.$infoHolder = document.getElementById("info-holder")

        this.$infoHolder.classList.add("info-holder-hidden")
    }

    revealInfoHolder() {
        if (!this.$infoHolder)
            this.$infoHolder = document.getElementById("info-holder")

        this.$infoHolder.classList.remove("info-holder-hidden")
    }

    addInfoHolderText(text) {
        if (!this.$infoHolder)
            this.$infoHolder = document.getElementById("info-holder")
        const p = document.createElement("p")
        p.innerHTML = text
        this.$infoHolder.children[1].appendChild(p)
    }

    setInfoHolderTitle(title) {
        if (!this.$infoHolder)
            this.$infoHolder = document.getElementById("info-holder")

        const $title = this.$infoHolder.children[0]
        $title.innerText = title
    }

    clearInfoHolder() {
        if (!this.$infoHolder)
            this.$infoHolder = document.getElementById("info-holder")
        const node = this.$infoHolder.children[1]
        while (node.firstChild) {
            node.removeChild(node.firstChild)
        }
    }

    setInfoHolderNextClickCallback(callback) {
        if (!this.$infoHolder)
            this.$infoHolder = document.getElementById("info-holder")
        this.$infoHolder.children[2].onclick = callback
    }

    infoHolderSkipClickCallback(callback) {
        if (!this.$infoHolderSkip)
            this.$infoHolderSkip = document.getElementById("info-holder-skip")
        this.$infoHolderSkip.onclick = callback
    }

    // =================== UI ===================
    revealUI() {
        if (!this.$ui)
            this.$ui = document.querySelectorAll(".ui")
        this.$ui.forEach(ui => {
            ui.classList.remove("hidden")
        })
    }

    hideUI() {
        if (!this.$ui)
            this.$ui = document.querySelectorAll(".ui")

        this.$ui.forEach(ui => {
            ui.classList.add("hidden")
        })

    }


    // =================== OTHER ===================

    _setHistoryButtons() {
        this._updateHistoryButtons()
        var self = this
        document.getElementById("undo-button").onclick = function () {
            UxSaverInstance.add('undo')
            History.undo()
            self._updateHistoryButtons()
        }
        document.getElementById("redo-button").onclick = function () {
            UxSaverInstance.add('redo')
            History.redo()
            self._updateHistoryButtons()
        }
    }

    _updateHistoryButtons() {
        const undoBtn = document.getElementById("undo-button")
        const redoBtn = document.getElementById("redo-button")
        if (History.canUndo() && undoBtn.classList.contains("inactive")) undoBtn.classList.remove("inactive")
        else if (!History.canUndo() && !undoBtn.classList.contains("inactive")) undoBtn.classList.add("inactive")

        if (History.canRedo() && redoBtn.classList.contains("inactive")) redoBtn.classList.remove("inactive")
        else if (!History.canRedo() && !redoBtn.classList.contains("inactive")) redoBtn.classList.add("inactive")
    }

    _setToolbox() {
        this.toolbox = new ToolboxController()
    }

    _setDraggableTools() {
        this._dragAndDropToolControls = new DragAndDropControls(".draggable.tool", false)

        this._dragAndDropToolControls.onDragCallback(targetElement => {
            UxSaverInstance.add('dragAndDrop', targetElement.id)
            switch (targetElement.id) {
                case "get-camera":
                    return Editor.modes.NOTHING
                case "place-qubits":
                    return Editor.modes.QUBIT
                case "positive-input":
                    return Editor.modes.POSITIVE_INPUT
                case "negative-input":
                    return Editor.modes.NEGATIVE_INPUT
                case "place-output":
                    return Editor.modes.OUTPUT
                case "eraser":
                    return Editor.modes.REMOVE
            }
        })

        this._dragAndDropToolControls.onDropCallback(payload => {
            EditorInstance.canEdit = payload
            EditorInstance.edit()
        })
    }

    _setCameraJoystick() {
        this._joystickCameraControls = new JoystickCameraControls("joystick-control", "zoom-control", false)
    }


    _setOverlaySelector() {
        this.overlaySelector = new OverlaySelector()
    }

    // Speed buttons //

    _setDustbinButton() {
        document.getElementById('dustbin-button').onclick = function () {
            AppControllerInstance.automata.reset()
        }
    }

    _setResetButton() {
        document.getElementById('settings-reset').onclick = function () {
            localStorage.clear()
            location.reload()
        }
    }


    _setTimeControl() {
        this._timeControls = new TimeControls()
    }


    init() {
        this._setHistoryButtons()
        this._setDustbinButton()
        this._setCameraJoystick()
        this._setOverlaySelector()
        this._setToolbox()
        this._setTimeControl()
        this._setResetButton()

        this.currentToolSelected = "get-camera"
        this.lastToolSelected = ""

        /*
        window.addEventListener("keydown", ev => this._keydownHandler(ev))
        window.addEventListener("keyup", ev => this._keyupHandler(ev))
        */
    }

    constructor() {
        if (!UIController.instance) {
            UIController.instance = this
        }

        return UIController.instance
    }
}

const UIControllerInstance = new UIController()
UIController.buttonIdList = ["get-camera", "negative-input", "place-qubits", "place-output", "bridge", "eraser"]