const compareDelay = 5;
const swapDelay = 40;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

self.onmessage = async function(event) {
    const { algorithm, array } = event.data;

    switch (algorithm) {
        case 'bubble':
            await bubbleSortWorker([...array]);
            break;
        case 'selection':
            await selectionSortWorker([...array]);
            break;
        case 'insertion':
            await insertionSortWorker([...array]);
            break;
        case 'merge':
            await mergeSortWorker([...array]);
            break;
        case 'quick':
            await quickSortWorker([...array]);
            break;
        case 'heap':
            await heapSortWorker([...array]);
            break;
        default:
            self.postMessage({ error: `Unknown algo ${algorithm}` });
            return;
    }
}

async function sendStep(algorithm, compare = [], swap = []) {
    self.postMessage({
        algorithm, 
        type: 'step',
        compare,
        swap
    });
}

async function bubbleSortWorker(arr) {
    const START = performance.now();
    let comparisons = 0;
    let swaps = 0;
    let n = arr.length;   

    for(let i = 0; i < n - 1; i++) {
        let swapped = false;
        for(let j = 0; j < n - i -1; j++) {
            comparisons++;
            await sendStep('bubble', [j, j + 1], []);
            await sleep(compareDelay);
            
            if(arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swaps++;
                swapped = true;
                await sendStep('bubble', [], [j, j + 1]);
                await sleep(swapDelay);
            }
        }
        if(!swapped) break;
    }
    
    const END = performance.now();

    self.postMessage({
        algorithm,
        type: 'complete',
        result: {
            time: END - START,
            comparisons,
            swaps
        }
    })
}

async function selectionSortWorker(arr) {
    const START = performance.now();
    let comparisons = 0;
    let swaps = 0;
    let n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            comparisons++;
            await sendStep('selection', [minIndex, j], []);
            await sleep(compareDelay);

            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            swaps++;
            await sendStep('selection', [], [i, minIndex]);
            await sleep(swapDelay);
        }
    }
    const END = performance.now();

    self.postMessage({
        algorithm: 'selection',
        type: 'complete',
        result: {
            time: END - START,
            comparisons,
            swaps
        }
    });
}

async function insertionSortWorker(arr) {
    const START = performance.now();
    let comparisons = 0;
    let swaps = 0;
    let n = arr.length;

    for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0) {
            comparisons++;
            await sendStep('insertion', [j - 1, j], []);
            await sleep(compareDelay);

            if (arr[j - 1] > arr[j]) {
                [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
                swaps++;
                await sendStep('insertion', [], [j - 1, j]);
                await sleep(swapDelay);
                j--;
            } else {
                break;
            }
        }
    }
    const END = performance.now();

    self.postMessage({
        algorithm: 'insertion',
        type: 'complete',
        result: {
            time: END - START,
            comparisons,
            swaps
        }
    });
}

async function mergeSortWorker(arr) {
    const START = performance.now();
    let comparisons = 0;
    let swaps = 0;

    async function mergeSortRecursive(arr, low, high) {
        if (low >= high) return;

        const middle = Math.floor((low + high) / 2);
        await mergeSortRecursive(arr, low, middle);
        await mergeSortRecursive(arr, middle + 1, high);
        await mergeArrays(arr, low, middle, high);
    }

    async function mergeArrays(arr, low, middle, high) {
        const temp = new Array(high - low + 1);
        let i = low, j = middle + 1, k = 0;

        while (i <= middle && j <= high) {
            comparisons++;
            await sendStep('merge', [i, j], []);
            await sleep(compareDelay);
            
            if (arr[i] <= arr[j]) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
                swaps++;
            }
        }
        while (i <= middle) {
            temp[k++] = arr[i++];
        }
        while (j <= high) {
            temp[k++] = arr[j++];
        }

        for (let m = 0; m < temp.length; m++) {
            arr[low + m] = temp[m];
            await sendStep('merge', [], [low + m]);
            await sleep(swapDelay);
        }
    }

    await mergeSortRecursive(arr, 0, arr.length - 1);
    const END = performance.now();

    self.postMessage({
        algorithm: 'merge',
        type: 'complete',
        result: {
            time: END - START,
            comparisons,
            swaps
        }
    });
}

async function quickSortWorker(arr) {
    const START = performance.now();
    let comparisons = 0;
    let swaps = 0;

    async function quickSortRecursive(arr, low, high) {
        if (low >= high) return;

        const pivotIndex = await partition(arr, low, high);
        await quickSortRecursive(arr, low, pivotIndex - 1);
        await quickSortRecursive(arr, pivotIndex + 1, high);
    }

    async function partition(arr, low, high) {
        const randomIndex = Math.floor(Math.random() * (high - low + 1)) + low;
        [arr[randomIndex], arr[high]] = [arr[high], arr[randomIndex]];
        swaps++;
        await sendStep('quick', [], [randomIndex, high]);
        await sleep(swapDelay);

        let pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            comparisons++;
            await sendStep('quick', [j, high], []);
            await sleep(compareDelay);
            
            if (arr[j] < pivot) {
                i++;
                if (i !== j) {
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    swaps++;
                    await sendStep('quick', [], [i, j]);
                    await sleep(swapDelay);
                }
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        swaps++;
        await sendStep('quick', [], [i + 1, high]);
        await sleep(swapDelay);
        return i + 1;
    }

    await quickSortRecursive(arr, 0, arr.length - 1);
    const END = performance.now();

    self.postMessage({
        algorithm: 'quick',
        type: 'complete',
        result: {
            time: END - START,
            comparisons,
            swaps
        }
    });
}

async function heapSortWorker(arr) {
    const START = performance.now();
    let comparisons = 0;
    let swaps = 0;

    async function heapify(arr, n, i) {
        let largest = i;
        const LEFT = 2 * i + 1;
        const RIGHT = 2 * i + 2;

        if (LEFT < n) {
            comparisons++;
            await sendStep('heap', [LEFT, largest], []);
            await sleep(compareDelay);
            
            if (arr[LEFT] > arr[largest]) {
                largest = LEFT;
            }
        }
        if (RIGHT < n) {
            comparisons++;
            await sendStep('heap', [RIGHT, largest], []);
            await sleep(compareDelay);
            
            if (arr[RIGHT] > arr[largest]) {
                largest = RIGHT;
            }
        }

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            swaps++;
            await sendStep('heap', [], [i, largest]);
            await sleep(swapDelay);
            await heapify(arr, n, largest);
        }
    }

    // Build max-heap
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
        await heapify(arr, arr.length, i);
    }

    // Extract elements from heap
    for (let i = arr.length - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        swaps++;
        await sendStep('heap', [], [0, i]);
        await sleep(swapDelay);
        await heapify(arr, i, 0);
    }

    const END = performance.now();

    self.postMessage({
        algorithm: 'heap',
        type: 'complete',
        result: {
            time: END - START,
            comparisons,
            swaps
        }
    });
}
