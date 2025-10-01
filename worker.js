self.onmessage = async function(event) {
    const { algorithm, array } = event.data;
    const startTime = perofrmance.now();

    let result;
    switch (algorithm) {
        case 'bubble':
            result = bubbleSortWorker([...array]);
            break;
        case 'selection':
            result = selectionSortWorker([...array]);
            break;
        case 'insertion':
            result = insertionSortWorker([...array]);
            break;
        case 'merge':
            result = mergeSortWorker([...array]);
            break;
        case 'quick':
            result = quickSortWorker([...array]);
            break;
        case 'heap':
            result = heapSortWorker([...array]);
            break;
        default:
            self.postMessage({ error: `Unknown algo ${algorithm}` });
            return;
    }

    const totalTime = performance.now() - startTime;    
}

function bubbleSortWorker(arr) {
    const STEPS = [];
    let n = arr.length;   
}

