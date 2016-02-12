var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextid = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('ToDo API Root');
});

app.get('/todos', function(req, res){
    var queryParams = req.query;
    var filteredTodos = todos;

    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
      filteredTodos = _.where(filteredTodos, {completed: true});
    }else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
      filteredTodos = _.where(filteredTodos, {completed: false});
    }

    if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
      filteredTodos = _.filter(filteredTodos, function(item){
         if(item.description.toLowerCase().indexOf(queryParams.q.toLowerCase())>=0){
           return true;
         }else{
           return false;
         }
      });
    }

    res.json(filteredTodos);
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
  //
  // body.id = todoNextid++;
  //
  // todos.push(body);
  //
  // res.send(todos);

  db.todo.create(body).then( function(todo){
    res.send(todo.toJSON());
  }).catch( function(e){
    res.status(400).json(e);
  });

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

app.put('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id);
  var item = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, 'description', 'completed');
  var validItem = {};
  if(!item){
      return res.status(404).send();
  }

  if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
    validItem.completed = body.completed;
  }else if(body.hasOwnProperty('completed')){
    return res.status(400).send();
  }

  if(body.hasOwnProperty('description') && _.isString('description') && body.description.trim().length > 0 ){
    validItem.description = body.description;
  }else if(body.hasOwnProperty('description')){
    return res.status(400).send();
  }

  _.extend(item, validItem);
  res.json(item);

});

db.sequelize.sync().then( function(){
  app.listen(PORT, function(){
    console.log('Express listening on port ' + PORT);
  });
});
