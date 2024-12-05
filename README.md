# ForceGraphs WOPR

This project enhances graph visualization with components:

## Components

### Graph
- Renders graphs dynamically from different data sets.
- Data management: JSON data is the input for nodeJsonFound, data is transformed to be used by the graph - typeOfNode
- Custom tooltip on node hover. Takes into account changes in graph dimensions - node coordinates - and vieport coords

### NodeCard
- On node right-click, node details are displayed on the right hand side
- Copy to clipboard feature
- Dynamic card title, with marker in node color

### Home 
This page serves as the main App of the project

## Data
- Different size JSON files for testing performance

## Testing
- Tested renderization with standard, BMSL and location group data sets
- Vitest: for NodeCard features

## Libraries
- React JS + Vite framework
- Tailwind CSS
- Vasturiano
- Dagree for the graph layout
