
// heavely based on https://observablehq.com/@d3/zoomable-sunburst
class SunburstHeatMap {

    constructor(id, data, settings){
        this.id = id;

        this.color = d3.scaleSequential(d3.interpolateYlOrBr).domain([0, data.data.maxValue]);

        let margin = {top: 25, right: 25, bottom: 25, left: 25};
        this.width = ((settings.size) || 600) - margin.left - margin.right;
        this.height = ((settings.size) || 600) - margin.top - margin.bottom;
        
        // draw in a square sized svg
        this.size = Math.min(this.width, this.height) * .98; // to avoid screen overflow   
        this.depth_index = ( (settings.depth) || 2 ) ;
        // console.log(this.depth_index)
        this.margin = margin;
        this.data = data;
        this.background = (settings.background || "#F0F0FF");
        this.clickcb = settings.clickcb;
        this.leaf_text = "";
        
        this.create();
        this.render();
        this.legend();
        this.selected = {};
    }

    getValue(d, filter){
        let leaves = this.data.data.leaves;
        let group = leaves
            .filter(leaf => leaf["year"] >= filter.min && leaf["year"] <= filter.max) // filter year
            .map(leaf => leaf[d.parent.data.key]) // aggregation of column
            .filter(value => value.split(", ").indexOf(d.data.key) >= 0) // count of attributes
        return group.length;
    }

    render(filter={}) {
        checkFilter(filter, this.data.leaves)
        this.path
            .attr("fill", d => d.children ? "lightgray" : this.color(this.getValue(d, filter)) )
            
        this.path.selectAll("title")
            .text(d => `${d.ancestors().map(d => d.data.key).reverse().join("/")}\n` 
                    + ( d.children ? `` : `Works: ${this.getValue(d, filter)}`));
    }

    isValidSelection(template, d) {
        if (!d.children) {
            return template[d.parent.data.key] == d.data.key;
        } else {
            return false;
        }
    }

    select(item={}) {
        
        if (!item || item === this.selected) {
            this.selected = {};
            if (this.data.leaves.map(d => d["id"])
                    .includes(d3.select("#parentText").text())){
                        d3.select("#parentText")
                        .text(this.leaf_text)
                        .attr("dx", (-item["id"].length * .2) + "em")
            }
            this.leaf_text = "";
            this.render();
        } else {
            if (!this.selected.id) {
                console.log(d3.select("#parentText").text(), this.leaf_text)
                this.leaf_text = d3.select("#parentText").text()
            }
                
            this.selected = item;
            // if (d3.select("#parentText").text() === " ")
                d3.select("#parentText")
                    .text(item["id"])
                    .attr("dx", (-item["id"].length * .2) + "em")

            this.path
                .attr("fill", d => {
                    return d.children ? "lightgray" : (!this.isValidSelection(item, d) ? `lightgray` : `burlywood`) ; 
                })
                
            this.path.selectAll("title")
                .text(d => `${d.ancestors().map(d => d.data.key).reverse().join("/")}\n` 
                        + ( d.children ? `` : item["id"]));
        }
    }

    create() {

        let size = this.size;
        let margin = this.margin;
        let data = this.data;
        let clickcb = this.clickcb;
        let legend_size = size / 5;
        this.legend_size = legend_size;
        let radius = size/8; // size / 6 for 2 layers
        this.radius = radius;

        let labelTransform = (d) => {
            let x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            let y = (d.y0 + d.y1) / 2 * this.radius;
            return `rotate(${x - 90}) translate(${y}, 0) rotate(${x < 180 ? 0 : 180})`;
        }

        let svg_parent = d3.select(this.id).append("svg")
            .attr("width", size + margin.left + margin.right + legend_size)  // width + margin.left + margin.right
            .attr("height", size + margin.top + margin.bottom) // height + margin.top + margin.bottom
            .attr("viewBox", [-margin.left, 0, size + legend_size, size])
            .style("font", "8px sans-serif")
            .style("background", this.background);
  
        let svg = svg_parent.append("g")
            .attr("transform", `translate(${size / 2},${size / 2})`);
        this.svg = svg;

        let arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius * 1.5)
            .innerRadius(d => d.y0 * radius)
            .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))
        
        this.arc = arc;
        this.data.each(d => d.current = d);

        let path = svg.append("g")
            .selectAll("path")
            .data(this.data.descendants().slice(0))
            .join("path")
                .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.8 : 0.75) : 0)
                .attr("d", d => arc(d.current));
    
        this.path = path;

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);
        
        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.key).reverse().join("/")}\n` 
                    + ( d.children ? `` : ``));
    
        let label = svg.append("g")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .style("user-select", "none")
            .selectAll("text")
            .data(this.data.descendants().slice(0))
            .join("text")
                .attr("dy", "0.35em")
                .attr("fill-opacity", d => +labelVisible(d.current))
                .attr("transform", d => labelTransform(d.current))
                .text(d => {
                    let k = d.data.key;
                    if (k.split(" ").length > 1)
                        return k.slice(0, 8) + "..."
                    else return k;
                })
    
        let parent = svg.append("circle")
            .datum(this.data)
            .attr("r", this.radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);
        
        function clicked(p) {
            parent.datum(p.parent || data);

            let parentKey = p.data.key || " ";
            d3.select("#parentText").text(parentKey)
                .attr("dx", d => (-parentKey.length * .25) + "em")

            data.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });
        
            const t = svg.transition().duration(750);
        
            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.transition(t)
                .tween("data", d => {
                    let i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .filter(function(d) {
                    return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.8 : 0.75) : 0)
                .attrTween("d", d => () => arc(d.current));
        
            label.filter(function(d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));

            // if (clickcb) {
            //     console.log(p)
            //     console.log(p.data)
            //     clickcb(p.data.key)
            // }
            updatedescription(p)
        }
        this.clicked = clicked;

        function format(d) {
            return d3.format(",d")(d);
        }
    
        function arcVisible(d) {
            return d.y1 <= 4 && d.y0 >= 1 && d.x1 > d.x0; // d.y1 <= 3 for 2 layers
        }
        
        function labelVisible(d) {
            return d.y1 <= 4 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        }

        function updatedescription(d) {
            if (d.depth == 0) clickcb("Taxonomy")
            if (d.depth == 1) clickcb(d.data.key)
            if (d.depth == 2) clickcb(d.parent.data.key)
        }
    }

    legend() {
        
        let svg = this.svg;
        let legend_size = this.legend_size;
        let margin = this.margin;

        svg.append("text")
            .text(" ")
            .attr("dx", "-.8em")
            .attr("fill", "black")
            .attr("id", "parentText")
            .attr("pointer-events", "none")
        
        let domain_legend = d3.range(this.color.domain()[1] + 1);
        let legendscale = d3.scaleBand()
                    .range([legend_size, 0])
                    .domain(domain_legend)
                    .paddingInner(0.1);

        let legends = svg.append("g")
            .attr("transform", `translate(${this.size/2 - margin.left/2}, ${this.size/2 - margin.top/2 - legend_size})`)

        legends.append("rect")
            .attr("y", -20)
            .attr("x", -10)
            .attr("width", legend_size * 0.9)
            .attr("height", this.size*.98 - this.size/2 - margin.top/2 - legend_size)
            .style("fill", this.background)
            .style("stroke","lightgrey")

        legends.append("g").selectAll("rect")
            .data(domain_legend)
            .join("rect")
            .attr("y", d => legendscale(d))
            .attr("width", legend_size * .6)
            .attr("height", legendscale.bandwidth())
            .style("fill", d => this.color(d))

        legends.append("g").selectAll("text")
            .data(domain_legend)
            .join("text")
            .attr("x", legend_size * .65)
            .attr("y", d => legendscale(d) + legendscale.bandwidth() * .7)
            .style("font-size", "10px")
            .text(d => d)
        
        legends.append("text")
            .text("Works")
            .attr("dy", -9)
            .attr("dx", 37)
            .style("font-size", "10px")
        
        this.legends = legends;
    }
}