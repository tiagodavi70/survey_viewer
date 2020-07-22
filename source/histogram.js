
class Histogram {
    constructor(id, data, settings={}){
        this.id = id;
        this.color = "cadetblue";

        let margin = {top: 2, right: 2, bottom: 2, left: 2};
        this.width = (settings.size || 60) - margin.left - margin.right;
        this.height = (settings.size / (6/4) || 40) - margin.top - margin.bottom;
        
        // draw in a square sized svg
        this.size = Math.min(this.width, this.height) * .98; // to avoid screen overflow   
        this.margin = margin;
        this.data = data;

        if (!data.bins) {
            this.data.bins = Histogram.binData(this.data)
        }

        this.data.bins[data.bins.length -1].x1 = data.bins[data.bins.length -1].x0 + 1; // to solve the last rect bug

        let svg_parent = d3.select(this.id).append("svg")
            .attr("width", this.width + margin.left + margin.right)  // width + margin.left + margin.right
            .attr("height", this.height + margin.top + margin.bottom) // height + margin.top + margin.bottom
            // .style("font", "8px sans-serif");
  
        this.svg = svg_parent.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        this.x = d3.scaleLinear()
            .domain([d3.min(data, d => +d.year), d3.max(data, d => +d.year) + 1]).nice() // same fix as before, to solve the last rect
            .range([margin.left, this.width - margin.right])

        this.y = d3.scaleLinear()
            .domain([0, d3.max(data.bins, d => d.length)]).nice()
            .range([this.height - margin.bottom, margin.top])
        
        this.render();
    }

    render(filter={}) {
        let x = this.x;
        let y = this.y;
        
        checkFilter(filter, this.data)

        this.rects = this.svg
            .selectAll("rect")
            .data(this.data.bins)
            .join(
                enter => enter.append("rect")
                            .attr("x", d => x(d.x0) + 1)
                            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
                            .attr("y", d => y(d.length))
                            .attr("height", d => y(0) - y(d.length))
                            .attr("fill", d =>  d.x0 >= filter.min && d.x0 <= filter.max ? "cadetblue" : "lightgrey")
                        .append("title")
                            .text(d => "Works: " + d.length),
                update => update
                            .attr("x", d => x(d.x0) + 1)
                            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
                            .attr("y", d => y(d.length))
                            .attr("height", d => y(0) - y(d.length))
                            .attr("fill", d =>  d.x0 >= filter.min && d.x0 <= filter.max ? "cadetblue" : "lightgrey")
                        .select("title")
                            .text(d => "Works: " + d.length));
    }

    static binData(data, f= d => +d.year) {
        return d3.histogram()
                .thresholds(data.thresholds || d3.range(d3.min(data, d => +d.year), d3.max(data, d => +d.year) + 1))
                .value(f)
            (data);
    }
}