const visualizer = document.getElementById("visualizer")
let array = [];

function generateArray(type) {
    array = Array.from({length: 101}, (_, i) => i);
    if (type === "random") array.sort(() => Math.random() - 0.5);
    if (type === "reversed") array.reverse();
    renderBars();
}

function renderBars() {
    visualizer.innerHTML = "";
    array.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar')
        bar.style.height = `${(value / array.length) * 100}%`;
        bar.style.width = `${100 / array.length}%`;
        visualizer.appendChild(bar);
    })
}
generateArray("random");