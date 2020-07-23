
class Cards {
    constructor(id, data, settings) {
        this.data = data;
        this.id = id;
        this.render();
        this.selected = {};
    }

    render(filter={}) {
        checkFilter(filter, this.data);

        this.cards = d3.select(this.id)
            .selectAll("div")
            .data(this.data.filter(d => d["year"] >= filter.min && d["year"] <= filter.max))
            .join("div")
                .style("background", "white")
                .style("color", "black")
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
                
        this.cards.select(".card_title")
                .style("color", "cadetblue")
    }

    bind(eventName="click", f) {
        let cards = this.cards;
        cards.on(eventName, function(d) {
            cards
                .style("background", "white")
                .style("color", "black")
                .select(".card_title")
                    .style("color", "cadetblue")
            if (this.selected !== d) {
                d3.select(this)
                    .style("background", "cadetblue")
                    .style("color", "white")
                    .select(".card_title")
                        .style("color", "white")
                this.selected = d;
            } else {
                this.selected = {};
            }
            f(d);
        })
    }
}