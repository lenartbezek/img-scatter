import { ImageScatterElement } from "./ImageScatterElement";

const browseButton = document.querySelector("#browse")! as HTMLButtonElement;
const fileInput = document.querySelector("#file")! as HTMLInputElement;
const methodSelect = document.querySelector("#sortmethod")! as HTMLSelectElement;
const rotateCheckbox = document.querySelector("#autorotate")! as HTMLInputElement;
const animateCheckbox = document.querySelector("#animatechange")! as HTMLInputElement;

const img = document.querySelector("img-scatter")! as ImageScatterElement;

function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
        // @ts-ignore
        const data = e.target.result;
        img.setAttribute("src", data);
    };
    reader.readAsDataURL(file);
}

document.addEventListener("drop", (e) => {
    console.log(e);
    e.preventDefault();
    const [file] = e.dataTransfer && e.dataTransfer.files || [undefined];
    if (file && file.type.startsWith("image/")) {
        loadFile(file);
    }
});

browseButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("input", () => {
    const [file] = fileInput.files || [undefined];
    if (file && file.type.startsWith("image/")) {
        loadFile(file);
    }
});

methodSelect.addEventListener("change", () => {
    img.setAttribute("sortmethod", methodSelect.value);
});

rotateCheckbox.addEventListener("change", () => {
    img.setAttribute("autorotate", String(rotateCheckbox.checked));
});

animateCheckbox.addEventListener("change", () => {
    img.setAttribute("animatechanges", String(animateCheckbox.checked));
});
