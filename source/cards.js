
class Cards {
    constructor(id, data, settings) {
        this.data = data;
        this.id = id;
    }

    render() {
        d3.select(this.id)
            .selectAll("div")
            .data(this.data)
            .join("div")
                .classed("card", true)
                .html(d => `
                    <div class="card_title">
                        ${d.id}
                    </div>
                    <div>
                        Year:  <span class="info"> ${d.year} </span> </br>
                    </div>
                `)
    }
}