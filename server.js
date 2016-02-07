var express = require('express');
var app = express();
var PORT = process.env.port || 3000;
var todos = [{
  id: 1,
  description: 'Finish this course',
  completed: false
},{
  id: 2,
  description: 'Do coompetitive',
  completed: false
}];

app.get('/', function(req, res){
    res.send('ToDo API Root');
});

app.get('/todos', function(req, res){
    res.json(todos);
})

app.get('/todos/:id', function(req, res){

})

app.listen(PORT, function(){
  console.log('Express listening on port ' + PORT);
});
