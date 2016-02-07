var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextid = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('ToDo API Root');
});

app.get('/todos', function(req, res){
    res.json(todos);
})

app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);
  var matched;
  todos.forEach(function (todo){
    if(todo.id === todoId){
      matched = todo;
    }
  });

  if(matched){
    res.json(matched);
  }else{
    res.status(404).send();
  }
});

app.post('/todos', function(req, res){
  var body  = req.body;

  body.id = todoNextid++;

  todos.push(body);

  res.send(todos)
})

app.listen(PORT, function(){
  console.log('Express listening on port ' + PORT);
});
