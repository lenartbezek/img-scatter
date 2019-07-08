import { addListener as addResizeListener, removeListener as removeResizeListener } from "resize-detector";
import {
    BufferAttribute,
    BufferGeometry,
    Clock,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PlaneBufferGeometry,
    Points,
    PointsMaterial,
    Scene,
    Vector2,
    Vector3,
    VertexColors,
    WebGLRenderer,
} from "three";
import { rgbToHsl, setBufferFromVector } from "./util";

export class ImageScatterScene {
    // Scene creation parameters that cannot be tuned during simulation.
    public readonly cameraFov = 60;
    public readonly particleSize = 1;

    // Private THREE.js objects.
    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera;
    private geometry: BufferGeometry;
    private object: Points;
    private plane: Mesh;
    private clock: Clock;
    private cursor: Vector2 | undefined;

    /** Stops rendering. */
    private stopped: boolean = false;

    constructor(
        public readonly element: HTMLElement,
        public readonly image: ImageData,
    ) {
        // Initialize scene.
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        this.renderer.setClearColor(0x00000000, 0);
        this.renderer.autoClear = false;

        // Append renderer to target element and add event listeners.
        const rect = this.element.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.element.appendChild(this.renderer.domElement);
        this.element.addEventListener("mousemove", this.onCursorMove);
        this.element.addEventListener("touchmove", this.onCursorMove, { passive: true });
        this.element.addEventListener("touchend", this.onCursorCancel, { passive: true });
        addResizeListener(this.element, this.onResize);

        this.camera = new PerspectiveCamera(this.cameraFov, rect.width / rect.height, 1, 1000);
        this.camera.position.set(0, 0, 250);
        this.scene.add(this.camera);

        const vertices: Vector3[] = [];
        const colors: Vector3[] = [];

        const { data, width, height } = image;

        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b] = data.slice(i, i + 3);
            const [h] = rgbToHsl(r, g, b);
            const y = Math.floor(i / width);
            const x = Math.floor(i % width);
            vertices.push(new Vector3(
                (x - width / 2) / width * 100,
                -(y - height / 2) / width * 100,
                h * 100,
            ));
            colors.push(new Vector3(
                r / 256,
                g / 256,
                b / 256,
            ));
        }

        // Generate buffers
        const vertexBuffer = new Float32Array(vertices.length * 3);
        vertices.forEach((v, i) => setBufferFromVector(vertexBuffer, i, v));
        const colorBuffer = new Float32Array(colors.length * 3);
        colors.forEach((v, i) => setBufferFromVector(colorBuffer, i, v));

        // Create geometry
        this.geometry = new BufferGeometry();
        this.geometry.addAttribute("position", new BufferAttribute(vertexBuffer, 3));
        this.geometry.addAttribute("color", new BufferAttribute(colorBuffer, 3));

        // Create an object
        this.object = new Points(this.geometry, new PointsMaterial({
            size: this.particleSize,
            vertexColors: VertexColors,
        }));

        this.scene.add(this.object);

        // Add raycasting plane.
        this.plane = new Mesh(new PlaneBufferGeometry(500, 500, 0, 0), new MeshBasicMaterial({ visible: false }));
        this.plane.position.z = 35;
        this.scene.add(this.plane);

        this.clock = new Clock();

        this.render();
    }

    public stop() {
        this.stopped = true;
        this.element.removeEventListener("mousemove", this.onCursorMove);
        this.element.removeEventListener("touchmove", this.onCursorMove);
        this.element.removeEventListener("touchend", this.onCursorCancel);
        removeResizeListener(this.element, this.onResize);
    }

    public onResize = () => {
        const rect = this.element.getBoundingClientRect();
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height);
    }

    private render() {
        if (this.stopped) { return; }
        requestAnimationFrame(this.render.bind(this));
        const delta = this.clock.getDelta();

        // Rotate object.
        this.object.rotation.y += delta * 0.2;

        // Render scene.
        this.renderer.render(this.scene, this.camera);
    }

    private onCursorMove = (event: MouseEvent | TouchEvent) => {
        let cursorX: number;
        let cursorY: number;
        if ("touches" in event) {
            cursorX = event.touches[0].clientX;
            cursorY = event.touches[0].clientY;
        } else {
            cursorX = event.clientX;
            cursorY = event.clientY;
        }
        const rect = this.element.getBoundingClientRect();
        const x = (cursorX / rect.width) * 2 - 1;
        const y = -(cursorY / rect.height) * 2 + 1;
        if (this.cursor) {
            this.cursor.set(x, y);
        } else {
            this.cursor = new Vector2(x, y);
        }
    }

    private onCursorCancel = () => {
        this.cursor = undefined;
    }
}
