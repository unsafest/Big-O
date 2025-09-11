const visualizer = document.getElementById("visualizer");
let array = [];
let arrLen = 51;
const delay = 40;
let controller = null; // for AbortController()

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
                // Show only swaps
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
            if (signal.aborted) return;

            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        // Show only swaps
        if (minIndex !== i) {
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            renderBars([], [i, minIndex]);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    renderBars();
}

/** ----------- -----------  Insertion Sort ----------- ----------- */
async function insertionSort(array, signal) {
    let n = array.length;
    for (let i = 1; i < n; i++) {
        if (signal.aborted) return;
        let key = array[i]
        let j = i - 1; 

        while (j >= 0 && array[j] > key) {
            if (signal.aborted) return;
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
        // Show only final placement (like other algorithms show key operations)
        renderBars([], [j + 1]);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    renderBars();
}

/** ----------- -----------  Merge Sort ----------- ----------- */
async function mergeSort(arr, signal, offset = 0) {
    if (signal.aborted || arr.length <= 1) return;

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    await mergeSort(left, signal, offset);
    if (signal.aborted) return;
    await mergeSort(right, signal, offset + middle);
    if (signal.aborted) return;

    await mergeArrays(arr, left, right, signal, offset);
}

async function mergeArrays(arr, left, right, signal, offset) {
    let i = 0, j = 0, k = 0;

    while (i < left.length && j < right.length) {
        if (signal.aborted) return;
        
        if (left[i] < right[j]) {
            arr[k] = left[i++];
        } else {
            arr[k] = right[j++];
        }
        array[offset + k] = arr[k]
        // Show only writes
        renderBars([], [offset + k]);
        await new Promise(resolve => setTimeout(resolve, delay));
        k++
    }
    // cleanup
    while (i < left.length) {
        if (signal.aborted) return;
        arr[k] = left[i++];
        array[offset + k] = arr[k]
        // Show only writes
        renderBars([], [offset + k]);
        await new Promise(resolve => setTimeout(resolve, delay));
        k++;
    }
    while (j < right.length) {
        if (signal.aborted) return;
        arr[k] = right[j++];
        array[offset + k] = arr[k]
        // Show only writes
        renderBars([], [offset + k]);
        await new Promise(resolve => setTimeout(resolve, delay));
        k++;
    }
    renderBars();
}

/** ----------- -----------  Quick Sort ----------- ----------- */
async function quickSort(arr, signal, low = 0, high = arr.length - 1) {
    if (low >= high || signal.aborted) return;

    const pivotIndex = await partition(arr, signal, low, high);
    if (signal.aborted || pivotIndex === undefined) return;

    await quickSort(arr, signal, low, pivotIndex - 1);
    if (signal.aborted) return; // Critical to check abort after first recursive call
    await quickSort(arr, signal, pivotIndex + 1, high);

}
async function partition(arr, signal, low, high) {
    if (signal.aborted) return undefined;

    const randomIndex = Math.floor(Math.random() * (high - low + 1)) + low;
    [arr[randomIndex], arr[high]] = [arr[high], arr[randomIndex]];

    renderBars([], [randomIndex, high]);
    await new Promise(resolve => setTimeout(resolve, delay));

    let pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (signal.aborted) return;

        if (arr[j] < pivot) {
            i++;
            if (i !== j) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                renderBars([], [i, j]);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    renderBars([], [i + 1, high]);
    await new Promise(resolve => setTimeout(resolve, delay));

    return i + 1;
}

/** ----------- -----------  Heap Sort ----------- ----------- */

async function heapSort(arr, signal) {
    // Build max-heap - start from last non-leaf node
    for (let i = Math.floor(arr.length / 2) -1; i >= 0; i--) {
        await heapify(arr, arr.length, i, signal);
        if (signal.aborted) return;
    }

    // Extract elements from heap one by one
    for (let i = arr.length -1; i > 0; i--) {
        // Swap current root to end
        [arr[0], arr[i]] = [arr[i], arr[0]];
        // Heapify the reduced heap
        await heapify(arr, i, 0, signal);
        if (signal.aborted) return;
        // Show only swaps
        renderBars([], [0, i]);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    renderBars();
}

async function heapify(arr, n, i, signal) {
    let largest = i; // Assume current node is largest
    const LEFT = 2 * i + 1; // Left child index
    const RIGHT = 2 * i + 2; // Right child index

    // Check if left child exists and is larger
    if (LEFT < n && arr[LEFT] > arr[largest]) {
        largest = LEFT;
    }
    // Check if right child exists and is larger
    if (RIGHT < n && arr[RIGHT] > arr[largest]) {
        largest = RIGHT;
    }
    // If largest is not in current node, swap and recurse 
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]]; // Swap
        await heapify(arr, n, largest, signal); // Heapify the subtree
    }
}