const visualizer = document.getElementById("visualizer");
let array = [];
let isSorting = false;

function generateArray(type) {
    array = Array.from({length: 51}, (_, i) => i + 1);
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

generateArray("random");

function getSelectedRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (const radio of radios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return null;
}

function sort() {
    isSorting = true;
    const algo = getSelectedRadioValue("sort-algo")
    if (algo === "bubble") {
        bubbleSort(array);
    }
    else if (algo === "selection") {
        selectionSort(array);
    }
}

function reset() {
    generateArray("random");
    isSorting = false;
    
}

/** ----------- -----------  Sorting Algorithms ----------- ----------- */

/** ----------- -----------  Bubble Sort ----------- ----------- */
async function bubbleSort(array) {
    let n = array.length
    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) return;
        let swapped = false
        for (let j = 0; j < n - i - 1; j++) {
            //renderBars([j, j + 1]);
            //await new Promise(resolve => setTimeout(resolve, 40));
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                renderBars([], [j, j + 1]);
                await new Promise(resolve => setTimeout(resolve, 40));
                swapped = true
            }
        }
        if (!swapped) break
    }
    renderBars();
    isSorting = false;
}

/** ----------- -----------  Selection Sort ----------- ----------- */
async function selectionSort(array) {
    let n = array.length;
    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) return;
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        renderBars([], [i, minIndex]);
        await new Promise(resolve => setTimeout(resolve, 40));
    }
    isSorting = false;
}

/** ----------- -----------  Insertion Sort ----------- ----------- */
function insertionSort(array) {

}