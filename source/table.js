class Table {
    constructor(id, settings={}, data){
        this.id = id;
        // this.color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
    
        let margin = {top: 50, right: 50, bottom: 50, left: 50};
        this.width = ((settings.size) || 600) - margin.left - margin.right;
        this.height = ((settings.size) || 600) - margin.top - margin.bottom;
        
        // draw in a square sized svg
        this.size = Math.min(this.width, this.height) * .98; // to avoid screen overflow   
        this.margin = margin;
        this.data = data;
    }

    // loosely inspired by: http://bl.ocks.org/gka/17ee676dc59aa752b4e6
    render(){
        let data = this.data;
        let columns = this.data.columns;

        let table = d3.select('body')
            .append('table');

        // create table header
        table.append('thead').append('tr')
            .selectAll('th')
            .data(columns)
            .join('th')
                .text(d => d['head']);

        // create table body
        table.append('tbody')
            .selectAll('tr')
            .data(data)
            .join('tr')
            .selectAll('td')
            .data(function(row, i) {
                let cell = [];
                for (let k in row){
                    cell.push(row[k]);
                }
                return cell;
            }).join('td')
                .html(d => d);
    }
}