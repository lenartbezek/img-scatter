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

    public async attributeChangedCallback(name: string, _: string, value: string) {
        switch (name) {
            case "src":
                const data = await this.getImageData(value);
                if (this.scene) {
                    this.scene.loadImage(data);
                } else {
                    this.scene = new ImageScatterScene(this.div!, data);
                }
                return;
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
