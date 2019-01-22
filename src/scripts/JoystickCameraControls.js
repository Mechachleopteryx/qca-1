/**
 * @class Joystick Camera Controls
 * @brief set event listeners to control the camera with a joystick and a zoom slider
 */

class JoystickCameraControls {

    /**
     * @private @method
     * @brief starts a loop moving the camera on every frame until the user stop pressing the button
     * @param {Pointer} pointer object with ClientX and ClientY values
     */
    _start(pointer) {
        this._update(pointer)
        requestAnimationFrame(() => this._apply())
    }


    /**
     * @private @method
     * @brief updates the value of the stored pointer, so the update loop values folows the user's finger/mouse poisition
     * @param {Pointer} pointer object with clientX and clientY values
     */
    _update(pointer) { this.pointer = pointer}


    /**
     * @private @method
     * @brief sets the stored pointer to null, stopping the update loop in the process
     */
    _end() { this.pointer = null }


    /**
     * @private @method
     * @brief moves the camera with a vector relative to the user's position on the joystick
     */
    _apply() {
        // stops the loop if the pointer is undefined
        if (this.pointer) requestAnimationFrame(() => this._apply()); else return

        // creates vector from joystick center to pointer position
        var translate = new THREE.Vector3(this.pointer.clientX - this.CENTER_X, 0, this.pointer.clientY - this.CENTER_Y)
        if (translate.length > this.RADIUS) return

        // converts vector to a camera translation
        var cameraOrientation = new THREE.Quaternion()
        ThreeViewControllerInstance.camera.getWorldQuaternion(cameraOrientation)
        // scaling
        translate.multiplyScalar(this.DOLLY_SPEED)

        // orient to camera
        translate.applyQuaternion(cameraOrientation)

        // project on grid
        translate.projectOnPlane(this.UP)

        ThreeViewControllerInstance.orbitControls.target.add(translate)
        ThreeViewControllerInstance.camera.position.add(translate)

        ThreeViewControllerInstance.orbitControls.update()
        ThreeViewControllerInstance.shouldRender()
    }

    /**
     * @private @method
     * @brief change the camera zoom value based on the slider value
     * @param {Event} event 
     */
    _onSliderChange(event) {
        const zoom = parseInt(event.currentTarget.value)
        const currentzoom = ThreeViewControllerInstance.camera.position.distanceTo(ThreeViewControllerInstance.orbitControls.target)
        ThreeViewControllerInstance.camera.translateZ(zoom - currentzoom)

        // update controls
        ThreeViewControllerInstance.orbitControls.update()
        ThreeViewControllerInstance.shouldRender()
        event.stopPropagation()
    }

    /**
     * @private @method 
     * @brief sets the event lisenter
     * @param {String} zoomSliderId dom element id
     */
    _setZoomSlider(zoomSliderId) {
        const button = document.getElementById(zoomSliderId);

        button.addEventListener("mousemove", this._onSliderChange)
        button.addEventListener("touchmove", this._onSliderChange)

        // disables orbital camera controls in front of the slider
        button.addEventListener("mousedown", ev => ev.stopPropagation())

        ThreeViewControllerInstance.callbackOnRender(() => {
            const currentzoom = ThreeViewControllerInstance.camera.position.distanceTo(ThreeViewControllerInstance.orbitControls.target)
            button.value = currentzoom
        })
    }

    /**
     * @private @method
     * @brief sets event listener and compute constants
     * @param {String} joystickID dom element id
     */
    _setJoystick(joystickID) {
        const button = document.getElementById(joystickID)
        this.CENTER_X = button.offsetLeft
        this.CENTER_Y = button.offsetTop
        this.RADIUS = Math.hypot(button.clientWidth, button.clientHeight) / 2

        this.pointer = null


        button.addEventListener("mousedown", event => { this._start(event); event.stopPropagation() })
        button.addEventListener("mousemove", event => { this._update(event); event.stopPropagation()  })
        button.addEventListener("mouseup", event => { this._end(); event.stopPropagation() })

        button.addEventListener("touchstart", event => { this._start(event.touches.item(0)); event.stopPropagation()  })
        button.addEventListener("touchmove", event => { this._update(event.touches.item(0)); event.stopPropagation()  })
        button.addEventListener("touchend", event => { this._end(); event.stopPropagation() })
    }

    /**
     * @constructor
     * @param {String} joystickID dom element id
     * @param {String} zoomSliderId dom element id
     */
    constructor(joystickID, zoomSliderId) {
        this.UP = new THREE.Vector3(0,1,0)
        this.DOLLY_SPEED = 0.01;

        this._setJoystick(joystickID)
        this._setZoomSlider(zoomSliderId)
    }
}