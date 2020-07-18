

class Sunburst {
    constructor(id, data, settings){
        this.id = id;
        this.color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
    
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
            .style("font", "10px sans-serif");
  
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
                .attr("fill", d => { while (d.depth > 1) d = d.parent; return this.color(d.data.key); })
                .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
                .attr("d", d => arc(d.current));
    
        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);
    
        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.key).reverse().join("/")}\n${format(d.value)}`);
    
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
                .text(d => d.data.key);
    
        let parent = svg.append("circle")
            .datum(this.data)
            .attr("r", this.radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);

        function clicked(p) {
            parent.datum(p.parent || data);
        
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