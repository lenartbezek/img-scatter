import { ImageScatterElement } from "./ImageScatterElement";

const input = document.querySelector("input")! as HTMLInputElement;
const img = document.querySelector("img-scatter")! as ImageScatterElement;

input.addEventListener("input", () => {
    const [file] = input.files || [undefined];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // @ts-ignore
            const data = e.target.result;
            img.setAttribute("src", data);
        };
        reader.readAsDataURL(file);
    }
});
