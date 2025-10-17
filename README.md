# Big-O

A visual sorting algorithm playground built with vanilla JavaScript and Web Workers.

## What is it?

An interactive web app that lets you watch sorting algorithms do their thing in real-time. Pick an algorithm, choose your array type, and watch the bars dance as they get sorted.

## Algorithms

- **Bubble Sort** - The classic, slow and steady
- **Selection Sort** - Finding the minimum, one step at a time
- **Insertion Sort** - Building a sorted array piece by piece
- **Merge Sort** - Divide and conquer
- **Quick Sort** - Fast and recursive
- **Heap Sort** - Using a heap data structure

## Features

- Real-time visualization with color-coded comparisons and swaps
- Three array types: Random, Sorted, and Reversed
- Compare all algorithms side-by-side *(work in progress)*
- Runs in Web Workers to keep the UI smooth (trivial at this scale)

## Usage

Just open `index.html` in your browser. No build step, no dependencies.