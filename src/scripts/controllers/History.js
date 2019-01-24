/*
	exported
	History
*/


class HistoryClass {
    init() {
        this.back = []
        this.front = []
    }
    undo() {
        if (this.back.length > 0) {
            let lastAction = this.back.pop()
            let revertedAction = this.applyAction(lastAction)
            this.front.push(revertedAction)
        }
    }
    redo() {
        if (this.front.length > 0) {
            let lastAction = this.front.pop()
            let revertedAction = this.applyAction(lastAction)
            this.back.push(revertedAction)
        }
    }
    applyAction(action) {
        this.historyAction = true
        switch (action.act) {
            case "add":
                AppControllerInstance.automata.removeBlock(action.position)
                break
            case "remove":
                switch (action.type) {
                    case "qubit":
                        AppControllerInstance.automata.addQubit(action.position)
                        break
                    case "input":
                        AppControllerInstance.automata.addInput(action.position, action.value > 0)
                        break
                    case "output":
                        AppControllerInstance.automata.addOutput(action.position)
                        break
                }
                break
            case "change":
                    AppControllerInstance.automata.addInput(action.position, action.value > 0)
                break
            case "bridge":
                AppControllerInstance.automata.removeBridgeWithPosition(action.position,action.value)
                break
            case "unbridge":
                AppControllerInstance.automata.makeBridge(action.position)
                AppControllerInstance.automata.makeBridge(action.value)
                break
        }
        this.historyAction = false
        action.revert()
        return action
    }
    canRedo() {
        return this.front.length > 0
    }
    canUndo() {
        return this.back.length > 0
    }
    add(action, type, position, value = 0) {
        if (!this.historyAction) {
            this.front = []
            this.back.push(new Action(action, type, position, value))
        }
        ToolboxControllerInstance._updateHistoryButtons()
    }
    reset()
    {
        this.front = []
        this.back = []
    }
    constructor() {
        if (!HistoryClass.instance) {
            this.init()
            HistoryClass.instance = this
        }
        this.historyAction = false
        return HistoryClass.instance
    }
}

class Action {
	constructor(act,type,position,value) {
		this.act = act
		this.type = type
		this.position = new THREE.Vector3();
		this.position.copy(position)
		this.value = value
	}
	revert() {
		switch(this.act) {
			case "add":
				this.act = "remove"
				break
			case "remove":
				this.act = "add"
				break
            case "bridge":
                this.act = "unbridge"
                break
            case "unbridge":
                this.act = "bridge"
                break
		}
	}
	debug()
	{
		return "{act : "+this.act+", type : "+this.type+"}"
	}
}
const History = new HistoryClass()