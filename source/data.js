

function formatData(data, columns) {
    let nested = d3.nest();
    for (let col of columns) 
        nested.key( d => d[col])
    
    nested = nested.rollup(function(leaves) { return leaves.length; })
        .entries(data)

    // root node addition
    nested = {"key": "root", "values": nested}

    let partition = data => d3.partition()
        .size([2 * Math.PI, columns.length + 1])
        (d3.hierarchy(data, d => d.values)
            .sum(d => d.value ? d.value : 0)
            .sort((a, b) => b.value - a.value))
    
    return partition(nested);
}

function formatDataHeatMap(dataTree, dataLeaves={}) {
    let nested = d3.nest();
    let leaves_value = [];
    for (let col of dataTree.columns)
        nested.key( d => d[col])

    nested = nested.rollup(function(leaves) { 
        let f_group = dataLeaves
            .map(d => d[leaves[0]["d2"]]) // group by dimension
            .filter((value, i, arr) => value.split(", ").indexOf(leaves[0]["leaf"]) >= 0 ); // search structure and count
        leaves_value.push(f_group.length);
        return 1;
    }).entries(dataTree)

    // root node addition
    nested = {"key": " ", "values": nested, "maxValue": d3.max(leaves_value), "leaves": dataLeaves}
    let partition = data => d3.partition()
        .size([2 * Math.PI, dataTree.columns.length + 1])
        (d3.hierarchy(data, d => d.values)
            .sum(d => d.value ? d.value : 0)
            .sort((a, b) => b.value - a.value))
    
    let complete = partition(nested);
    complete.leaves = dataLeaves; 
    return complete;
}


function checkFilter(filter, data, f= d=> +d.year) {
    if (!filter.min){
        filter.min = d3.min(data, f);
    }
    if (!filter.max){
        filter.max = d3.max(data, f);
    }
}

