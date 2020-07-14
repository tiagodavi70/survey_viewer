

let columns = ["frequency", "duration", "scene capture", "human factors", "share or create", "type", "context"]
let visible_hierarchies = 3;
let order_hierarchies = 3;
let sunburst = 0;
let data = 0;

d3.csv("datasets/taxonomy_RACollab.csv").then(taxonomy => {

    data = taxonomy;
    generateDropdown(order_hierarchies, columns);
    
    sunburst = new Sunburst("#sunburst_overview", {"depth":visible_hierarchies}, formatData(data, getColumns()))
    sunburst.render();
});

function generateDropdown(order_hierarchies, columns) {

    d3.select("#dropdowns")
        .selectAll("select")
        .data(d3.range(1, order_hierarchies + 1))
        .join("select")
            .attr("id", d => "dropdown_" + d)
            .on("change", () => updateVis())
        .selectAll("option")
        .data(columns)
        .join("option")
            .attr("value", d => d)
            .text(d => d)
    
    d3.select("#dropdowns")
        .selectAll("select")
        .nodes().forEach(function(value, index, arr) {
            arr[index].selectedIndex += index;
        })
    // let sel = document.getElementById('sel')
    // sel.selectedIndex = i
}

function getColumns() {
    return d3.select("#dropdowns")
        .selectAll("select")
        .nodes().map( node => {
            return node.value;
        });
}

function updateVis() {
    d3.select(sunburst.id).select("svg").remove();
    sunburst.data = formatData(data, getColumns());
    console.log(sunburst.data)
    sunburst.render();
}

d3.select("#change").on("mousedown", () => {
    updateVis(columns);
});

function formatData(data, columns) {
    let nested = d3.nest();
    for (let col of columns) 
        nested.key( d => d[col])
    
    nested = nested.rollup(function(leaves) { return leaves.length; })
        .entries(data)

    // root node addition
    nested = {"key": "root", "values": nested}

   let partition = data => d3.partition()
    .size([2 * Math.PI, columns.length + 1])
    (d3.hierarchy(data, d => d.values)
        .sum(d => d.value ? d.value : 0)
        .sort((a, b) => b.value - a.value))
    
    return partition(nested);
}