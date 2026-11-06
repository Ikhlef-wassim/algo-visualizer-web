const barsEl = document.getElementById("bars");
const algoSelect = document.getElementById("algoSelect");
const sizeSlider = document.getElementById("sizeSlider");
const speedSlider = document.getElementById("speedSlider");
const shuffleBtn = document.getElementById("shuffleBtn");
const sortBtn = document.getElementById("sortBtn");
const compEl = document.getElementById("compCount");
const swapEl = document.getElementById("swapCount");

let values = [], sorting = false, comps = 0, swaps = 0;

function sleep() {
  const delay = Math.max(8, 220 - Number(speedSlider.value) * 2);
  return new Promise((r) => setTimeout(r, delay));
}

function resetStats() {
  comps = 0;
  swaps = 0;
  compEl.textContent = "0";
  swapEl.textContent = "0";
}

function render(active = [], swapping = [], sorted = []) {
  barsEl.innerHTML = "";
  values.forEach((v, idx) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    if (sorted.includes(idx)) bar.classList.add("sorted");
    else if (swapping.includes(idx)) bar.classList.add("swap");
    else if (active.includes(idx)) bar.classList.add("compare");
    bar.style.height = `${v}%`;
    barsEl.appendChild(bar);
  });
}

function generateArray() {
  if (sorting) return;
  resetStats();
  const n = Number(sizeSlider.value);
  values = Array.from({ length: n }, () => Math.floor(Math.random() * 88) + 8);
  render();
}

function setControlsLocked(locked) {
  sorting = locked;
  algoSelect.disabled = locked;
  sizeSlider.disabled = locked;
  shuffleBtn.disabled = locked;
  sortBtn.disabled = locked;
}

async function bubbleSort() {
  const done = [];
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values.length - i - 1; j++) {
      comps++;
      compEl.textContent = comps;
      render([j, j + 1], [], done);
      await sleep();
      if (values[j] > values[j + 1]) {
        [values[j], values[j + 1]] = [values[j + 1], values[j]];
        swaps++;
        swapEl.textContent = swaps;
        render([], [j, j + 1], done);
        await sleep();
      }
    }
    done.push(values.length - i - 1);
  }
  render([], [], values.map((_, i) => i));
}

async function selectionSort() {
  const done = [];
  for (let i = 0; i < values.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < values.length; j++) {
      comps++;
      compEl.textContent = comps;
      render([minIdx, j], [], done);
      await sleep();
      if (values[j] < values[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [values[i], values[minIdx]] = [values[minIdx], values[i]];
      swaps++;
      swapEl.textContent = swaps;
      render([], [i, minIdx], done);
      await sleep();
    }
    done.push(i);
  }
  render([], [], values.map((_, i) => i));
}

async function insertionSort() {
  for (let i = 1; i < values.length; i++) {
    let j = i;
    while (j > 0) {
      comps++;
      compEl.textContent = comps;
      render([j - 1, j]);
      await sleep();
      if (values[j - 1] > values[j]) {
        [values[j - 1], values[j]] = [values[j], values[j - 1]];
        swaps++;
        swapEl.textContent = swaps;
        render([], [j - 1, j]);
        await sleep();
        j--;
      } else {
        break;
      }
    }
  }
  render([], [], values.map((_, i) => i));
}

async function quickSort(low = 0, high = values.length - 1) {
  if (low >= high) return;
  const pivot = values[high];
  let i = low;
  for (let j = low; j < high; j++) {
    comps++;
    compEl.textContent = comps;
    render([j, high]);
    await sleep();
    if (values[j] < pivot) {
      [values[i], values[j]] = [values[j], values[i]];
      swaps++;
      swapEl.textContent = swaps;
      render([], [i, j]);
      await sleep();
      i++;
    }
  }
  [values[i], values[high]] = [values[high], values[i]];
  swaps++;
  swapEl.textContent = swaps;
  render([], [i, high]);
  await sleep();
  await quickSort(low, i - 1);
  await quickSort(i + 1, high);
  if (low === 0 && high === values.length - 1) {
    render([], [], values.map((_, idx) => idx));
  }
}

sortBtn.addEventListener("click", async () => {
  if (sorting) return;
  resetStats();
  setControlsLocked(true);
  const algo = algoSelect.value;
  if (algo === "bubble") await bubbleSort();
  else if (algo === "selection") await selectionSort();
  else if (algo === "insertion") await insertionSort();
  else if (algo === "quick") await quickSort();
  setControlsLocked(false);
});

shuffleBtn.addEventListener("click", generateArray);
sizeSlider.addEventListener("input", generateArray);
generateArray();
