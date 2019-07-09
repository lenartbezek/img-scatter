declare module "three-orbitcontrols" {

    class OrbitControls {
        constructor(
            camera: THREE.Camera,
            element: HTMLCanvasElement,
        );

        public autoRotate: boolean;
        public autoRotateSpeed: number;
        public dampingFactor: number;
        public domElement: HTMLCanvasElement;
        public enabled: boolean;
        public enableDamping: boolean;
        public enableKeys: boolean;
        public enablePan: boolean;
        public enableRotate: boolean;
        public enableZoom: boolean;
        public keyPanSpeed: number;
        public keys: {
            LEFT: number;
            UP: number;
            RIGHT: number;
            BOTTOM: number;
        };
        public maxAzimuthAngle: number;
        public maxDistance: number;
        public maxPolarAngle: number;
        public maxZoom: number;
        public minAzimuthAngle: number;
        public minDistance: number;
        public minPolarAngle: number;
        public minZoom: number;
        public mouseButtons: {
            LEFT: number;
            RIGHT: number;
            MIDDLE: number;
        };
        public camera: THREE.Camera;
        public panSpeed: number;

        public update(): void;
    }

    export = OrbitControls;
}