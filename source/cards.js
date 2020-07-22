
class Cards {
    constructor(id, data, settings) {
        this.data = data;
        this.id = id;
        this.render();
    }

    render(filter={}) {
        checkFilter(filter, this.data);

        this.cards = d3.select(this.id)
            .selectAll("div")
            .data(this.data.filter(d => d["year"] >= filter.min && d["year"] <= filter.max))
            .join("div")
                .classed("card", true)
                .html(d => `
                    <span class="card_title">
                        ${d.id}
                    </span>
                    </br>
                    </br>
                    <span>
                        Year:  <span class="info"> ${d.year} </span> </br>
                    </span>
                `)
    }

    bind(eventName="click", f) {
        this.cards.on(eventName, f)
    }
}