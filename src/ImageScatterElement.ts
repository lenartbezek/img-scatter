import { html, LitElement, property } from "lit-element";
import { ImageScatterScene } from "./ImageScatterScene";
import { PixelSortMethod } from "./util";

export class ImageScatterElement extends LitElement {

    private get div(): HTMLDivElement | null {
        if (this.shadowRoot) {
            return this.shadowRoot.querySelector("div");
        } else {
            return null;
        }
    }

    @property({ type: String })
    public src: string = "";

    @property({ type: Boolean })
    public animatechanges: boolean = true;

    @property({ type: Boolean })
    public autorotate: boolean = true;

    @property({ type: String })
    public sortmethod: PixelSortMethod = PixelSortMethod.Hue;

    @property({ type: Number })
    public scatterfactor: number = 50;

    public scene: ImageScatterScene | undefined;

    public async attributeChangedCallback(name: string, _: string, value: string) {
        if (name === "src") {
            const data = await this.getImageData(value);
            if (this.scene) {
                this.scene.loadImage(data);
            } else {
                this.scene = new ImageScatterScene(this.div!, data);
                this.scene.setAnimateChanges(this.animatechanges);
                this.scene.setAutoRotate(this.autorotate);
                this.scene.setSortMethod(this.sortmethod);
            }
            return;
        }
        if (!this.scene) { return; }
        switch (name) {
            case "animatechanges":
                return this.scene.setAnimateChanges(JSON.parse(value));
            case "autorotate":
                return this.scene.setAutoRotate(JSON.parse(value));
            case "sortmethod":
                return this.scene.setSortMethod(value as PixelSortMethod);
            case "scatterfactor":
                return this.scene.setScatterFactor(parseFloat(value));
        }
    }

    protected render() {
        return html`
            <style>
                :host {
                    overflow: hidden;
                    display: block;
                    height: 100%;
                    width: 100%;
                    position: relative;
                }
                div {
                    height: 100%;
                    width: 100%;
                }
            </style>
            <div></div>
        `;
    }

    private getImageData(src?: string) {
        const image = new Image();
        image.src = src || this.src;
        return new Promise<ImageData>((resolve, reject) => {
            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    return reject(new Error("Could not get canvas context."));
                }
                ctx.drawImage(image, 0, 0);
                const data = ctx.getImageData(0, 0, image.width, image.height);

                return resolve(data);
            };
            image.onerror = (event, source, lineno, colno, error) => {
                reject(error);
                if (this.onerror) {
                    this.onerror(event, source, lineno, colno, error);
                }
            };
        });

    }
}

customElements.define("img-scatter", ImageScatterElement);
