var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
  var matched = _.findWhere(todos, {id:todoId});

  // var matched;
  // todos.forEach(function (todo){
  //   if(todo.id === todoId){
  //     matched = todo;
  //   }
  // });


  if(matched){
    res.json(matched);
  }else{
    res.status(404).send();
  }
});

app.post('/todos', function(req, res){
  var body  = req.body;

  body = _.pick(body, 'description', 'completed');

  if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
    return res.sendStatus(400);
  }

  body.description = body.description.trim();

  body.id = todoNextid++;

  todos.push(body);

  res.send(todos)
})

app.delete('/todos/:id', function (req, res){
  var todoId = parseInt(req.params.id);
  var item = _.findWhere(todos, {id: todoId});

  if(!item){
    res.status(404).json({"error": "No todo found for the id "});
  }else{
  todos = _.without(todos, item);
  res.json(item);
  }
});

app.listen(PORT, function(){
  console.log('Express listening on port ' + PORT);
});
