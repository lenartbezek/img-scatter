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

    public scene: ImageScatterScene | undefined;

    public async attributeChangedCallback(name: string, _: string, value: string) {
        switch (name) {
            case "src":
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
            case "animatechanges":
                if (this.scene) {
                    return this.scene.setAnimateChanges(JSON.parse(value));
                } else {
                    return;
                }
            case "autorotate":
                if (this.scene) {
                    return this.scene.setAutoRotate(JSON.parse(value));
                } else {
                    return;
                }
            case "sortmethod":
                if (this.scene) {
                    return this.scene.setSortMethod(value as PixelSortMethod);
                } else {
                    return;
                }
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
