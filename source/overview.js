

let visible_hierarchies = 3;
let taxonomy = 0;
let defaultcolor = "burlywood"
let description = "";

d3.json("datasets/description.json").then(desc => {
    description = desc;

    d3.select("#desctitle").text("Taxonomy")
    d3.select("#textdescription").html(description.Taxonomy)
    return d3.csv("datasets/taxonomy_tree.csv")

}).then(tax => {
    taxonomy = tax;
    return d3.csv("datasets/taxonomy_RACollab.csv");
}).then(data => {
    
    let nested_heatmap = formatDataHeatMap(taxonomy, data);
    data.bins = Histogram.binData(data)

    let clickcb = header => {
        let key = Object.keys(description).filter(k => k.toUpperCase() == header.toUpperCase())
        
        d3.select("#desctitle").text(key)
        d3.select("#textdescription").html(description[key])
    };

    let cards = new Cards("#card_list", data, {"color": defaultcolor});
    let sunburst = new SunburstHeatMap("#sunburst_overview", nested_heatmap, {  "depth":visible_hierarchies,
                                                                                "size": window.innerHeight *.82,
                                                                                "clickcb": clickcb});
    let histogram = new Histogram("#histogram", data, {"size": window.innerWidth * .20, "color": defaultcolor})
    let table = new Table("#table_overview", data, {"size": window.innerHeight *.78, "color": defaultcolor})

    
    cards.bind("click", item => {
        sunburst.select(item);
        sunburst.legends.style("display","none");
    })

    generate_slider('nouislider', data.bins, [cards, histogram, sunburst, table])
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

