class Table {
    constructor(id, data, settings={}){
        this.id = id;
        this.data = data;

        let columns = this.data.columns;

        let table = d3.select(this.id)
            .style("overflow", "auto")
            .append('table')
            .classed("tablejs", true);
        
        d3.select(table.node().parentNode)
            .style("height", settings.size? settings.size + "px": "75vh")

        // create table header
        table.append('thead').append('tr')
            .selectAll('th')
            .data(columns)
            .join('th')
                .text(d => d)
                .classed("t_head", true);

        // create table body
        this.tr = table.append('tbody')
            .selectAll('tr')
            .data(data)
            .join('tr')
        
        this.table = table;
        this.render()
    }

    // loosely inspired by: http://bl.ocks.org/gka/17ee676dc59aa752b4e6
    render(filter={}){
        checkFilter(filter, this.data);
        this.tr.selectAll('td')
            .data((row, i) => {
                if (row["year"] >= filter.min && row["year"] <= filter.max) {
                    let cell = [];
                    for (let k in row){
                        cell.push(row[k]);
                    }
                    return cell;
                } else {
                    return [];
                }
            }).join('td')
                .html(d => d)
                .classed("t_body", true)
                .classed("id_head", (d, i) => i === 0);
    }
}