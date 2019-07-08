import { LitElement } from "lit-element";
import { ImageScatterScene } from "./ImageScatterScene";
export declare class ImageScatterElement extends LitElement {
    private readonly div;
    src: string;
    scene: ImageScatterScene | undefined;
    firstUpdated(): Promise<void>;
    protected render(): import("lit-element").TemplateResult;
    private getImageData;
}
