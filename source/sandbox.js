
// d3.csv("https://gist.githubusercontent.com/curran/a08a1080b88344b0c8a7/raw/0e7a9b0a5d22642a06d3d5b9bcbad9890c8ee534/iris.csv").then(dataRaw => {
Promise.all([d3.csv("./datasets/TAMAZ3D.csv"), d3.text("./datasets/num_cols_TAMAZ3D.txt")]).then( results => {
    console.log("aaa");
    let dataRaw = results[0];
    let cols = results[1].split(",");
    
    // sem slice, tem q usar o map para pegar as colunas númericas
    // let cols = "sepal_length,sepal_width,petal_length,petal_width".split(",");

    let data = dataRaw.map(d => {
        let t = {}
        for (let i of cols)
            t[i] = isNaN(+d[i]) ? 0 : +d[i];
        return t
    })
    data.columns = cols;
    let pc = new ParallelCoordinates("#vis_pc", data,
    {   
        "color": "burlywood", 
        "width": 1400, 
        "height": 400,
        "orientation": "horizontal"
    });

    let pc_2 = new ParallelCoordinates("#vis_pc_2", data,
    {   
        "color": "burlywood", 
        "width": 600, 
        "height": 1000,
        "orientation": "vertical"
    });


}).catch(error => {
    console.log(error.message)
});

