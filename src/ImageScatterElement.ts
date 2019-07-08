import { html, LitElement, property } from "lit-element";
import { ImageScatterScene } from "./ImageScatterScene";

export class ImageScatterElement extends LitElement {

    private get div(): HTMLDivElement | null {
        if (this.shadowRoot) {
            return this.shadowRoot.querySelector("div");
        } else {
            return null;
        }
    }

    @property({ type: "string " })
    public src: string = "";

    public scene: ImageScatterScene | undefined;

    public async firstUpdated() {
        const data = await this.getImageData();
        this.scene = new ImageScatterScene(this.div!, data);
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

    private getImageData() {
        const image = new Image();
        image.src = this.src;
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
            image.onerror = (err, ...args) => {
                reject(err);
                if (this.onerror) {
                    this.onerror(err, ...args);
                }
            };
        });

    }
}

customElements.define("img-scatter", ImageScatterElement);
