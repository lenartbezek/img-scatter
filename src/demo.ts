import { ImageScatterElement } from "./ImageScatterElement";

const fileInput = document.querySelector(`input[name="image"]`)! as HTMLInputElement;
const methodSelect = document.querySelector(`select`)! as HTMLSelectElement;
const rotateCheckbox = document.querySelector(`input[name="rotate"]`)! as HTMLInputElement;
const animateCheckbox = document.querySelector(`input[name="animate"]`)! as HTMLInputElement;

const img = document.querySelector("img-scatter")! as ImageScatterElement;

fileInput.addEventListener("input", () => {
    const [file] = fileInput.files || [undefined];
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

methodSelect.addEventListener("select", () => {
    img.setAttribute("sortmethod", methodSelect.value);
});

rotateCheckbox.addEventListener("change", () => {
    img.setAttribute("autorotate", String(rotateCheckbox.checked));
});

animateCheckbox.addEventListener("change", () => {
    img.setAttribute("animatechanges", String(animateCheckbox.checked));
});
