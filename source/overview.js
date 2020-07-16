

let columns = ["frequency", "duration", "scene capture", "human factors", "share or create", "type", "context"]
let visible_hierarchies = 3;
let order_hierarchies = 3;
let sunburst = 0;
let data = 0;

// d3.csv("datasets/taxonomy_RACollab.csv").then(taxonomy => {

//     data = taxonomy;
//     generateDropdown(order_hierarchies, columns);
    
//     d3.select("#change").on("mousedown", () => {
//         updateVis(columns);
//     });
//     console.log(formatData(taxonomy, getColumns()))
//     sunburst = new SunburstHeatMap("#sunburst_overview", {"depth":visible_hierarchies}, formatData(data, getColumns()))
//     sunburst.render();
// });

d3.csv("datasets/taxonomy_tree.csv").then(taxonomy => {
    data = taxonomy;
    return d3.csv("datasets/taxonomy_RACollab.csv");
}).then( leaves => {
    
    let nested_heatmap = formatDataHeatMap(data, leaves);
    sunburst = new SunburstHeatMap("#sunburst_overview", {"depth":visible_hierarchies}, nested_heatmap);
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
    sunburst.render();
}
