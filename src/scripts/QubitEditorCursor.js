class QubitEditorCursor {

    mousemoveHandler(event) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;	
        this.raycaster.setFromCamera(this.mouse, this.camera)

        const wasVisible = this.cursor.visible;
        const previousPosition = this.cursor.position.clone;
        
        let intersection = this.raycaster.intersectObject(this.grid.hitzone)

        this.cursor.visible = intersection != 0;

        if (intersection[0]) {
            let translation = intersection[0].point.sub(this.cursor.position).round();
            this.cursor.translateX(translation.x)
            this.cursor.translateZ(translation.z)
        }

        
        if (this.cursor.visible != wasVisible || !this.cursor.position.equals(previousPosition)) {
            this.callRender()
        }
    }


    makeCursor(threeViewController) {
        let cursorgeometry = new THREE.BoxGeometry(QubitEditorCursor.SIZE, QubitEditorCursor.HEIGHT, QubitEditorCursor.SIZE)
        let cursormaterial = new THREE.LineBasicMaterial({ color: QubitEditorCursor.COLOR })
        this.cursor = new THREE.LineSegments(new THREE.EdgesGeometry(cursorgeometry), cursormaterial)
        threeViewController.addObject(this.cursor)
    }


    makeGrid(threeViewController) {        
        threeViewController.getFont().then((font) => {
            this.grid = new Grid(font)
            threeViewController.addObject(this.grid.object)
            threeViewController.onRenderObservers.push(() => {
                this.grid.lookCamera(threeViewController.camera.position)
            })
        })
    }

    constructor(threeViewController) {
        document.addEventListener("mousemove", ev => this.mousemoveHandler(ev))

        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.camera = threeViewController.camera
        
        this.makeCursor(threeViewController)
        this.makeGrid(threeViewController)

        this.callRender = function() { threeController.render() }
    }    
}

QubitEditorCursor.SIZE = 1
QubitEditorCursor.HEIGHT = 0.3
QubitEditorCursor.COLOR = 0x999999