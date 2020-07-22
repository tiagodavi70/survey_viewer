

// let columns = ["frequency", "duration", "scene capture", "human factors", "share or create", "type", "context"]
// let order_hierarchies = 3;

let visible_hierarchies = 3;
let taxonomy = 0;

d3.csv("datasets/taxonomy_tree.csv").then(tax => {
    taxonomy = tax;
    return d3.csv("datasets/taxonomy_RACollab.csv");
}).then( data => {
    
    let nested_heatmap = formatDataHeatMap(taxonomy, data);
    data.bins = Histogram.binData(data)

    let cards = new Cards("#card_list", data);
    
    let sunburst = new SunburstHeatMap("#sunburst_overview", nested_heatmap, {"depth":visible_hierarchies, size: window.innerHeight *.88});
    let histogram = new Histogram("#histogram", data, {"size": window.innerWidth * .15})

    cards.bind("click", d => sunburst.select(d))
    generate_slider('nouislider', data.bins, [cards, histogram, sunburst])
});


function generate_slider(id, bins, charts) {
    let year_extent = d3.extent(bins, d => d.x0)
    let slider = document.getElementById(id);
    
    noUiSlider.create(slider, {
        "start": year_extent,
        "connect": true,
        "range": {
            'min': year_extent[0],
            'max': year_extent[1]
        },
        "behaviour": 'tap-drag',
        "tooltips": true,
        "step": 1,
        format: {
            to: function (value) {
                return value + '';
            },
            // 'from' the formatted value.
            // Receives a string, should return a number.
            from: function (value) {
                return Number(value.replace(',-', ''));
            }
        }
    });

    slider.noUiSlider.on("slide", values => {
        for (let vis of charts ) {
            vis.render({"min":+values[0], "max":+values[1]})
        }
    })
}

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

// function generateDropdown(order_hierarchies, columns) {
//     d3.select("#dropdowns")
//         .selectAll("select")
//         .data(d3.range(1, order_hierarchies + 1))
//         .join("select")
//             .attr("id", d => "dropdown_" + d)
//             .on("change", () => updateVis())
//         .selectAll("option")
//         .data(columns)
//         .join("option")
//             .attr("value", d => d)
//             .text(d => d)
    
//     d3.select("#dropdowns")
//         .selectAll("select")
//         .nodes().forEach(function(value, index, arr) {
//             arr[index].selectedIndex += index;
//         })
// }

// function getColumns() {
//     return d3.select("#dropdowns")
//         .selectAll("select")
//         .nodes().map( node => {
//             return node.value;
//         });
// }

// function updateVis() {
//     d3.select(sunburst.id).select("svg").remove();
//     sunburst.data = formatData(data, getColumns());
//     sunburst.render();
// }
