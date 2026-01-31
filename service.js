const express= require('express')
const app= express();

app.get('/', function(req,res){
    res.send("hello sweta")
})
app.post('/',function (req,res) {
    res.send("complete")
})

app.listen(3000,()=>{
    console.log('lsitening on port 3000');
})