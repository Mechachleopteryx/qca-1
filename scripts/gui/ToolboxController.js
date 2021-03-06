/*
    global
    AppController
    DragAndDropControls
    Editor
    Qubit
*/
/*
    exported
    ToolboxController
    ToolboxControllerInstance
*/

/**
 * @warning THIS IS NOT YOUR TOOLBOX CONTROLLER. WHAT USED TO BE TOOLBOX CONTROLLER IS NOW UICONTROLLER!
 * @class ToolBoxController
 */
class ToolboxController {
    /**
     * @brief set the editor to use the tool matching given element id
     * @param {String} toolID id of the tool dom Element
     */
    select(toolID) {
        // save tool states
        this.previousTool = this.activeTool
        this.activeTool = toolID

        // update selection display on the toolbox DOM
        this.toolsDomElements.forEach(element => {
            element.classList.toggle("active", element.id === toolID)
        })

        // setup tool interaction settings
        this._toggleCameraControl(toolID)
        this._toggleMagneticCursor(toolID)
        this._selectEditorMode(toolID)
        this._setMouseCursor(toolID)

        document.getElementById("tool-info").textContent = `select: ${toolID}`
    }

    /**
     * @brief toggles camera movement
     * @param {String} toolID button id
     */
    _toggleCameraControl(toolID) {
        var hideCamerTouchControls
        switch (toolID) {
            case "camera-tool":
                if (ToolboxController.CONSOLE_OUTPUT) console.log("Free camera")
                AppControllerInstance.view.orbitControls.enableRotate = true
                AppControllerInstance.view.orbitControls.enablePan = true
                hideCamerTouchControls = false
                break

            case "qubit-tool":
            case "input-tool":
            case "output-tool":
            case "remove-tool":
            case "bridge-tool":
                if (ToolboxController.CONSOLE_OUTPUT) console.log("Locked camera")
                AppControllerInstance.view.orbitControls.enableRotate = false
                AppControllerInstance.view.orbitControls.enablePan = false
                hideCamerTouchControls = true
                break

            default:
                break
        }

        // find camera controls element and hide it with css
        const elementId = "camera-touch-controls"
        document.getElementById(elementId).classList.toggle("hidden", hideCamerTouchControls)
    }

    /**
     * @brief toggles the editor cursor magnetism (jumping to the closest block)
     * @param {String} toolID button id
     */
    _toggleMagneticCursor(toolID) {
        switch (toolID) {
            case "bridge-tool":
            case "camera-tool":
                if (ToolboxController.CONSOLE_OUTPUT) console.log("Enabled Magnetic cursor")
                EditorInstance.cursor.isMagnetic = true
                break

            case "qubit-tool":
            case "input-tool":
            case "output-tool":
            case "remove-tool":
                if (ToolboxController.CONSOLE_OUTPUT) console.log("Disabled Magnetic cursor")
                EditorInstance.cursor.isMagnetic = false
                break

            default:
                break
        }
    }

    /**
     * @brief matches button to editor mode
     * @param {String} toolID button id
     */
    _selectEditorMode(toolID) {
        switch (toolID) {
            case "qubit-tool":
                UxSaverInstance.add("setQbitToolClick")
                EditorInstance.canEdit = Editor.modes.QUBIT
                break

            case "input-tool":
                UxSaverInstance.add("setInputToolClick")
                EditorInstance.canEdit = Editor.modes.INPUT
                break

            case "output-tool":
                UxSaverInstance.add("setOutputToolClick")
                EditorInstance.canEdit = Editor.modes.OUTPUT
                break

            case "remove-tool":
                UxSaverInstance.add("setEraserToolClick")
                EditorInstance.canEdit = Editor.modes.REMOVE
                break

            case "bridge-tool":
                UxSaverInstance.add("setBridgeToolClick")
                EditorInstance.canEdit = Editor.modes.BRIDGE
                break

            case "camera-tool":
                UxSaverInstance.add("setCameraToolClick")
                EditorInstance.canEdit = Editor.modes.NOTHING
                break

            default:
                break
        }
        if (ToolboxController.CONSOLE_OUTPUT) console.log("tool:", toolID, EditorInstance.canEdit)
    }


    _setMouseCursor(toolID) {
        var cursor
        switch (toolID) {
            case "qubit-tool":
            case "input-tool":
            case "output-tool":
            case "remove-tool":
            case "bridge-tool":
                cursor = "crosshair"
                break

            case "camera-tool":
                cursor = "grab"
                break

            default:
                break
        }

        AppControllerInstance.view
            .renderer.domElement.style.cursor = cursor
    }


    _mapKeyboardCodeWithToolId(Keycode) {
        switch (Keycode) {
            case 77: // M
            case 67: // C
                return "camera-tool"

            case 73: // I
                return "input-tool"

            case 81: // Q
            case 75: // K
                return "qubit-tool"

            case 79: // O
                return "output-tool"

            case 82: // R
                return "remove-tool"

            case 66: // B
                return "bridge-tool"

            default:
                return false
        }
    }


    _populateClockSelector(id) {
        var clockSelector = document.getElementById(id)
        Qubit.FAMILY_COLORS.forEach((color, id) => {
            let colorPill = document.createElement("DIV")
            colorPill.addEventListener("click", () => {
                document.getElementById("clock-indicator").style.backgroundColor = color
                Qubit.selectedClockId = id
            })
            colorPill.classList.add("clock-color")
            colorPill.style.backgroundColor = color
            clockSelector.append(colorPill)
        })

        document.getElementById("clock-indicator").style.backgroundColor = Qubit.FAMILY_COLORS[Qubit.selectedClockId]
    }

    _setDraggableTools() {
        this._dragAndDropToolControls = new DragAndDropControls(".draggable.tool", false)

        this._dragAndDropToolControls.onDragCallback(targetElement => {
            targetElement.classList.toggle("locked")
            this.select(targetElement.id)
            return targetElement
        })

        this._dragAndDropToolControls.onDropCallback(payload => {
            EditorInstance.edit()
            payload.classList.toggle("locked", false)
        })

        this._dragAndDropToolControls.onCancelCallback(payload => {
            setTimeout(() => payload.classList.toggle("show", false), 2000)
            payload.classList.toggle("locked", false)
            payload.classList.toggle("show", true)
        })
    }


    /**
     * @constructor
     * @param {String} toolClassName css class name identifing tools
     */
    constructor(toolClassName = "tool") {
        this.toolsDomElements = document.querySelectorAll(`.${toolClassName}`)
        this.toolsDomElements.forEach(element => {
            element.addEventListener("click", event => {
                this.select(event.currentTarget.id)
            })
        })

        document.addEventListener("keydown", event => {
            if (event.keyCode === 16 || event.keyCode === 32) {
                return this.select(this.previousTool)
            }
            const mappedId = this._mapKeyboardCodeWithToolId(event.keyCode)
            if (mappedId) this.select(mappedId)
        })

        this._populateClockSelector("clock-selector")
        this.select("camera-tool")
        this._setDraggableTools()

    }
}

// toggles console logging of tool configurations 
ToolboxController.CONSOLE_OUTPUT = false