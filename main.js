const visualizer = document.getElementById("visualizer");
let array = [];
let arrLen = 51;
const delay = 40;
const compDelay = 5;
let controller = null; // for AbortController()
let bars = []; // cache for bar elements
let allAlgorithmsWorkers = []; // track workers for "all algorithms" mode
const algorithms = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'];


function generateArray(type) {
    array = Array.from({length: arrLen}, (_, i) => i + 1);
    if (type === "random") array.sort(() => Math.random() - 0.5);
    if (type === "reversed") array.reverse();

    if (bars.length !== arrLen) {
        visualizer.innerHTML = "";
        bars = [];
        for (let i = 0; i < arrLen; i++) {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            bar.style.width = `${100 / arrLen}%`;
            visualizer.appendChild(bar);
            bars.push(bar);
        }
    }
    renderBars();
}

function renderBars(compare = [], swap = [], targetBars = bars, targetArray = array) {
    targetBars.forEach((bar, idx) => {
        bar.style.transition = 'none';

        bar.classList.remove("comparing", "swapping");

        if (compare.includes(idx)) bar.classList.add("comparing");
        if (swap.includes(idx)) bar.classList.add("swapping");
        
        bar.style.height = `${(targetArray[idx] / arrLen) * 100}%`;

        bar.offsetHeight;
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

function buildMultiVisualizerContainer(ARRAY) {
    visualizer.innerHTML = "";
    visualizer.style.display = "grid";
    visualizer.style.gridTemplateColumns = "repeat(3, 1fr)";
    visualizer.style.gap = "20px";
    visualizer.style.height = "auto";

    const visualizers = new Map();

    algorithms.forEach(algo => {
        const container = document.createElement("div");
        container.style.border = "1px solid #ccc";
        container.style.padding = "10px";
        container.style.boxSizing = "border-box";

        const title = document.createElement("h3")
        title.textContent = algo.charAt(0).toUpperCase() + algo.slice(1) + " Sort";
        title.style.textAlign = "center";
        container.appendChild(title);

        const vizContainer = document.createElement("div");
        vizContainer.style.display = "flex";
        vizContainer.style.alignItems = "flex-end";
        vizContainer.style.height = "200px";
        vizContainer.style.position = "relative";
        vizContainer.style.width = "100%";
        vizContainer.style.border = "1px solid #000";
        vizContainer.style.backgroundColor = "#f9f9f9";
        container.appendChild(vizContainer);
        
        visualizer.appendChild(container);

        const algoBars = [];
        const algoArray = [...ARRAY];

        for (let i = 0; i < arrLen; i++) {
            const bar = document.createElement("div");
            bar.classList.add("bar");
            bar.style.width = `${100 / arrLen}%`;
            bar.style.height = `${(algoArray[i] / arrLen) * 100}%`;
            bar.style.transition = "none";
            vizContainer.appendChild(bar);
            algoBars.push(bar);
        }

        visualizers.set(algo, {
            bars: algoBars,
            array: algoArray
        });
    });
    // Returns map of visualizers, so that each algorithm can access its own bars and array
    return visualizers;
}

function sort() {
    // AbortController
    if (controller) {
        controller.worker?.terminate();
        controller.abortController?.abort();
    }
    const abortController = new AbortController();
    controller = { 
        signal: abortController.signal,
        abortController: abortController,
        worker: null
    };
    const signal = controller.signal;
    const algo = getSelectedRadioValue("sort-algo");

    if (algo === "all") {
        runAllAlgorithms();
        return;
    }

    if (!window.Worker) return;
    
    const worker = new Worker("worker.js");
    controller.worker = worker;

    worker.postMessage({
        algorithm: algo,
        array: [...array]
    });

    worker.onmessage = async function(event) {
        const { type, compare, swap, updates, algorithm } = event.data;
        if (signal.aborted) return;

        if (type === 'step') {
            if (swap && swap.length === 2) {
                const [i, j] = swap;
                [array[i], array[j]] = [array[j], array[i]];
            }
            if (updates && updates.length > 0) {
                updates.forEach(({index, value}) => {
                    array[index] = value;
                })
            }
            renderBars(compare || [], swap || []);
        }
    }
    worker.onerror = function(error) {
        console.error(`Error in ${algo} worker: `, error.message);
        worker.terminate();
        controller = null;
    }
}

function reset() {
    // Terminate any running workers and abort operations
    if (controller) {
        controller.worker?.terminate();
        controller.abortController?.abort();
    }
    
    // Terminate all workers from runAllAlgorithms if any
    if (allAlgorithmsWorkers) {
        allAlgorithmsWorkers.forEach(worker => worker.terminate());
        allAlgorithmsWorkers = [];
    }
    
    controller = null;
    
    // Reset visualizer to single mode
    visualizer.style.display = "flex";
    visualizer.style.gridTemplateColumns = "";
    visualizer.style.gap = "";
    visualizer.style.height = "";
    
    // Regenerate array and bars
    const type = getSelectedRadioValue("arrayType") || "random";
    generateArray(type);
}

function runAllAlgorithms() {
    if (window.Worker) {
        // Clear any existing workers
        allAlgorithmsWorkers.forEach(w => w.terminate());
        allAlgorithmsWorkers = [];
        
        const ARR = [...array]
        const visualizers = buildMultiVisualizerContainer(ARR);

        algorithms.forEach(algorithm => {
            const worker = new Worker("worker.js");
            allAlgorithmsWorkers.push(worker);
            
            worker.postMessage({
                algorithm: algorithm,
                array: ARR
            });

            worker.onmessage = async function(event) {
                const { type, compare, swap, updates } = event.data;
                const viz = visualizers.get(algorithm);

                if (!viz) return; 

                if (type === 'step') {
                    if (swap && swap.length === 2) {
                        const [i, j] = swap;
                        [viz.array[i], viz.array[j]] = [viz.array[j], viz.array[i]];
                    }
                    if (updates && updates.length > 0) {
                        updates.forEach(({index, value}) => {
                            viz.array[index] = value;
                        })
                    }
                    renderBars(compare, swap, viz.bars, viz.array);
                } else if ( type === 'complete') {
                    renderBars([],[], viz.bars, viz.array);
                    worker.terminate();
                }
            }
            worker.onerror = function(error) {
                console.error(`Error in ${algorithm} worker:`, error.message);
            }
        });
    }
}