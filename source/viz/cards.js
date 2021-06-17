
class Cards {
    constructor(id, data, settings) {
        this.data = data;
        this.id = id;
        this.render();
        this.selected = {};
        this.color = settings.color || "cadetblue";
        this.semaphore = true;
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
                    <span>
                        Year:  <span class="info"> ${d.year} </span> </br>
                    </span>
                `)
                
        this.cards.select(".card_title")
                .style("color", this.color)
    }

    bind(eventName="click", callback) {
        let cards = this.cards;
        let color = this.color;
        let self = this;
        cards.on(eventName, function(d) {
            cards
                .style("background", "white")
                .select(".card_title")
                    .style("color", color)
            if (self.selected !== d) {
                d3.select(this)
                    .style("background", color)
                    .select(".card_title")
                        .style("color", "white")
                self.selected = d;
            } else {
                self.selected = {};
            }
            callback(d);
        })
    }
}