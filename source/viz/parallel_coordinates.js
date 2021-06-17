
// heavily based on https://bl.ocks.org/jasondavies/1341281
class ParallelCoordinates {

    constructor(dom_id, data, settings){
        this.dom_id = dom_id;
        
        this.color = settings.color;

        let margin = {top: 25, right: 25, bottom: 25, left: 25};
        this.orientation = settings.orientation || "horizontal"
        this.width = ((settings.width) || 600) - margin.left - margin.right;
        this.height = ((settings.height) || 200) - margin.top - margin.bottom;
        
        // draw in a square sized svg
        // this.size = Math.min(this.width, this.height) * .98; // to avoid screen overflow   
        
        this.margin = margin;
        this.data = data;
        this.background = (settings.background || "#FFF");
        this.clickcb = settings.clickcb;
        
        this.create();
        this.render();
        this.selected = {};
    }

    render(filter={}) {

    }

    
    create() {

        let width = this.width;
        let height = this.height;
        let margin = this.margin;
        let data = this.data;

        let clickcb = this.clickcb;
        let orientation = this.orientation;
        let brushSize = 20;
        let deselectedColor = "#CCC";
        let color = this.color;
        let keys = data.columns;
        let x, y, path; // shared vars

        let svg_parent = d3.select(this.dom_id).append("svg")
            .attr("width", width + margin.left + margin.right)  // width + margin.left + margin.right
            .attr("height", height + margin.top + margin.bottom) // height + margin.top + margin.bottom
            .style("font", "8px sans-serif")
  
        let svg = this.svg = svg_parent.append("g")
            .attr("transform",`translate(${margin.left},${margin.top})`);

        if (orientation == "vertical") {
            x = new Map(Array.from(keys, key => [key, d3.scaleLinear(d3.extent(data, d => d[key]), [margin.left, width - margin.right])]))
            y = d3.scalePoint(keys, [margin.top, height - margin.bottom]);

            let line = d3.line()
                .defined(([, value]) => value != null)
                .x(([key, value]) => x.get(key)(value))
                .y(([key]) => y(key))

            let brush = d3.brushX()
                .extent([
                    [margin.left, -(brushSize / 2)],
                    [width - margin.right, brushSize / 2]
                ])
                .on("start brush end", brushed);
            
            path = svg.append("g")
                    .attr("fill", "none")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-opacity", 0.4)
                .selectAll("path")
                .data(data.slice()) // .sort((a, b) => d3.ascending(a[keyz], b[keyz]))
                .join("path")
                    .attr("stroke", d => color)
                    .attr("d", d => line(d3.cross(keys, [d], (key, d) => [key, d[key]])));

            svg.append("g")
                .selectAll("g")
                .data(keys)
                .join("g")
                    .attr("transform", d => `translate(0,${y(d)})`)
                .each(function(d) { d3.select(this).call(d3.axisBottom(x.get(d))); })
                    .call(g => g.append("text") // title
                        .attr("x", 0)
                        .attr("y", -6)
                        .attr("text-anchor", "start")
                        .attr("fill", "currentColor")
                        .text(d => d))
                    .call(g => g.selectAll("text") // white outline
                        .clone(true).lower()
                        .attr("fill", "none")
                        .attr("stroke-width", 6)
                        .attr("stroke-linejoin", "round")
                        .attr("stroke", "white"))
                    .call(brush);            
        } else {
            x = d3.scalePoint(keys, [margin.left, width - margin.right]);
            y = new Map(Array.from(keys, key => [key, d3.scaleLinear(d3.extent(data, d => d[key]), [margin.top, height - margin.bottom])]))

            let line = d3.line()
                .defined(([, value]) => value != null)
                .x(([key]) => x(key))
                .y(([key, value]) => y.get(key)(value))

            let brush = d3.brushY()
                .extent([
                    [-(brushSize / 2), margin.left],
                    [brushSize / 2, height - margin.bottom]
                ])
                .on("start brush end", brushed);
            
            path = svg.append("g")
                    .attr("fill", "none")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-opacity", 0.4)
                .selectAll("path")
                .data(data.slice())
                .join("path")
                    .attr("stroke", d => color)
                    .attr("d", d => line(d3.cross(keys, [d], (key, d) => [key, d[key]])));

            svg.append("g")
                .selectAll("g")
                .data(keys)
                .join("g")
                    .attr("transform", d => `translate(${x(d)},0)`)
                .each(function(d) { d3.select(this).call(d3.axisLeft(y.get(d))); })
                    .call(g => g.append("text") // title
                        .attr("x", -20)
                        .attr("y", 16)
                        .attr("text-anchor", "start")
                        .attr("fill", "currentColor")
                        .text(d => d))
                    .call(g => g.selectAll("text") // white outline
                        .clone(true).lower()
                        .attr("fill", "none")
                        .attr("stroke-width", 6)
                        .attr("stroke-linejoin", "round")
                        .attr("stroke", "white"))
                    .call(brush);  
        }
        
        const selections = new Map();
        function brushed(key) {
            let brush_axis = orientation === "vertical"? x : y;
            let selection = d3.event.selection;
            if (selection === null) selections.delete(key);
            else selections.set(key, selection.map(brush_axis.get(key).invert));
            const selected = [];
            path.each(function(d) {
                const active = Array.from(selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
                d3.select(this).style("stroke", active ? color : deselectedColor);
                d3.select(this).style("opacity", active ? 1 : 0.3);

                if (active) {
                    d3.select(this).raise();
                    selected.push(d);
                }
            });
        }
    }

    select(item) {
        
    }


}