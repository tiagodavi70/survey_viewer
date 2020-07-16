

class SunburstHeatMap {
    constructor(id, settings, data){
        this.id = id;

        this.color = d3.scaleSequential(d3.interpolateYlOrBr).domain([0, data.data.maxValue]);
        
        let margin = {top: 50, right: 50, bottom: 50, left: 50};
        this.width = ((settings.size) || 600) - margin.left - margin.right;
        this.height = ((settings.size) || 600) - margin.top - margin.bottom;
        
        // draw in a square sized svg
        this.size = Math.min(this.width, this.height) * .98; // to avoid screen overflow   
        this.depth_index = ( (settings.depth) || 2 ) ;
        // console.log(this.depth_index)
        this.margin = margin;
        this.data = data;
    }

    getValue(d){
        let leaves = this.data.data.leaves;
        let group = leaves
            .map(leaf => leaf[d.parent.data.key]) // aggregation of column
            .filter(value => value.split(", ").indexOf(d.data.key) >= 0) // count of attributes
        return group.length;
    }

    render() {
        let size = this.size;
        let margin = this.margin;
        let width = this.width;
        let height = this.height;
        let data = this.data;
        
        let labelTransform = (d) => {
            let x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            let y = (d.y0 + d.y1) / 2 * this.radius;
            return `rotate(${x - 90}) translate(${y}, 0) rotate(${x < 180 ? 0 : 180})`;
        }

        let svg_parent = d3.select(this.id).append("svg")
            .attr("width", size + margin.left + margin.right)  // width + margin.left + margin.right
            .attr("height", size + margin.top + margin.bottom) // height + margin.top + margin.bottom
            .attr("viewBox", [0, 0, size, size])
            .style("font", "8px sans-serif")
            .style("background", "#F8F8F8");
  
        let svg = svg_parent.append("g")
            .attr("transform", `translate(${size / 2},${size / 2})`);
        
        let radius = size/8; // size / 6 for 2 layers
        this.radius = radius;

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
                .attr("fill", d => d.children ? "lightgray" : this.color(this.getValue(d)) )
                .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
                .attr("d", d => arc(d.current));
    
        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);
    
        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.key).reverse().join("/")}\n` 
                        + ( d.children ? `` : `Works: ${this.getValue(d)}`));
    
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

        // label.selectAll("tspan")
        //     .data(d => d.data.key.split(" "))
        //     .join("tspan")
        //         .text(d => d + " ")
        //         // .attr("transform", (d,i) => "rotate(" + (100*i) + ")")
        //         .attr("dy", (d,i) => (i * .8) + "em")
        //         .attr("x", function(d,i){
        //             return - (i * 2.8 ) + ""
        //         })
    
        let parent = svg.append("circle")
            .datum(this.data)
            .attr("r", this.radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);

        let stateClicked = {}
        let parentText = svg.append("text")
            .text(" ")
            .attr("dx", "-.8em")
            .attr("fill", "black")
            .attr("pointer-events", "all")
            .on("click", () =>{
                clicked(stateClicked)
            });

        function clicked(p) {
            stateClicked = p.parent || data; 
            parent.datum(p.parent || data);

            let parentKey = p.data.key || " ";
            parentText.text(parentKey)
                .attr("dx", d => (-parentKey.length * .2) + "em")

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
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attrTween("d", d => () => arc(d.current));
        
            label.filter(function(d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
        }

        function format(d) {
            return d3.format(",d")(d);
        }
    
        function arcVisible(d) {
            return d.y1 <= 4 && d.y0 >= 1 && d.x1 > d.x0; // d.y1 <= 3 for 2 layers
        }
        
        function labelVisible(d) {
            return d.y1 <= 4 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        }
    }
}