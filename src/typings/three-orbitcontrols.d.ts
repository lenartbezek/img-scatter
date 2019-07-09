declare module "three-orbitcontrols" {

    class OrbitControls {
        constructor(
            camera: THREE.Camera,
            element: HTMLCanvasElement,
        );
    }

    export = OrbitControls;
}