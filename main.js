const visualizer = document.getElementById("visualizer");
let array = [];
let arrLen = 51; // Array length
const delay = 40; // Algo delay 
let controller = null; // AbortController

function generateArray(type) {
    array = Array.from({length: arrLen}, (_, i) => i + 1);
    if (type === "random") array.sort(() => Math.random() - 0.5);
    if (type === "reversed") array.reverse();
    renderBars();
}

function renderBars(compare = [], swap = []) {
    visualizer.innerHTML = "";
    array.forEach((value, idx) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        if (compare.includes(idx)) bar.classList.add("comparing");
        if (swap.includes(idx)) bar.classList.add("swapping");
        bar.style.height = `${(value / array.length) * 100}%`;
        bar.style.width = `${100 / array.length}%`;
        visualizer.appendChild(bar);
    });
}

let arrayType = document.querySelectorAll('input[name="arrayType"]');

arrayType.forEach((radio) => {
    radio.addEventListener('change', (event) => {
        generateArray(event.target.value);
    })
})

generateArray(getSelectedRadioValue("arrayType") || "random");

function getSelectedRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (const radio of radios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return "random";
}

function sort() {
    // AbortController
    if (controller) controller.abort();
    controller = new AbortController();
    const signal = controller.signal;

    const algo = getSelectedRadioValue("sort-algo");
    switch (algo) {
        case "bubble":
            bubbleSort(array, signal);
            break;
        case "selection":
            selectionSort(array, signal);
            break;
        case "insertion":
            insertionSort(array, signal);
            break;
        case "merge":
            mergeSort(array, signal);
            break;
        case "quick":
            quickSort(array, signal);
            break;
        case "heap":
            heapSort(array, signal);
            break;
        default:
            break;
    }
}

function reset() {
    if (controller) controller.abort();
    controller = null;
    const type = getSelectedRadioValue("arrayType") || "random";
    generateArray(type);
    renderBars();
}

/** ----------- -----------  Sorting Algorithms ----------- ----------- */

/** ----------- -----------  Bubble Sort ----------- ----------- */
async function bubbleSort(array, signal) {
    let n = array.length
    for (let i = 0; i < n - 1; i++) {
        if (signal.aborted) return;
        let swapped = false
        for (let j = 0; j < n - i - 1; j++) {
            if (signal.aborted) return;
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                renderBars([], [j, j + 1]);
                await new Promise(resolve => setTimeout(resolve, delay));
                swapped = true
            }
        }
        if (!swapped) break
    }
    renderBars();
}

/** ----------- -----------  Selection Sort ----------- ----------- */
async function selectionSort(array, signal) {
    let n = array.length;
    for (let i = 0; i < n - 1; i++) {
        if (signal.aborted) return;
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        renderBars([], [i, minIndex]);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

/** ----------- -----------  Insertion Sort ----------- ----------- */
async function insertionSort(array, signal) {
    let n = array.length;
    for (let i = 1; i < n; i++) {
        if (signal.aborted) return;
        let key = array[i]
        let j = i - 1; 

        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
        renderBars([], [j + 1, i]);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}