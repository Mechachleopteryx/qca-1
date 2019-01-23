class AppController {

    startUpdateLoop() {
       this.interval = setInterval(() => {
            if(!this.pauseMode) this.automata.process()
        }, this.refreshRate)
    }

    _onAssetLoading() {
        ThreeViewControllerInstance.init()
        Dot.init()
        Electron.init()
        InputBlock.init()
        Qubit.startDeterminationUpdateLoop()
        new QubitEditor()
        AchievementManager.Get().obtained("missionOne")
        QubitEditorInstance.init()
        ToolboxControllerInstance.init()
    }

    init() {
        return new Promise( resolve => {
            AssetManager.Create().then(() => {
                this._onAssetLoading()
                this.automata = new QuantumAutomata()
                resolve()
            })
        })
    }

    setRefreshRate(rate) {
        this.refreshRate = rate
        clearInterval(this.interval)
        this.startUpdateLoop()
    }

    setPause() {
		this.pauseMode =! this.pauseMode
    }

    ready() {
        this.isReady = true
        this.show()
        console.log("ready for action.")
    }

    show() {
        var overlay = document.getElementById("loading-overlay")
        overlay.parentElement.removeChild(overlay)
    }


    /**
     * @brief Singleton constructor
     */
    constructor() {
        if (!AppController.instance) {
            AppController.instance = this
        }
        this.refreshRate = AppController.SPEED;
        this.pauseMode = false;
        return AppController.instance
    }
}

const AppControllerInstance = new AppController()

AppController.SPEED = 20
AppController.SPEED_SLOW = 150
AppController.SPEED_FAST = 1