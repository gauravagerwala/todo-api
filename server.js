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
    var query = req.query;
    var where ={};

    if(query.hasOwnProperty('completed') && query.completed === 'true'){
      where.completed = true;
    } else if(query.hasOwnProperty('completed') && query.completed === 'false'){
      where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length > 0){
      where.description = {
        $like : '%' + query.q + '%'
      };
    }

    db.todo.findAll({where: where}).then(function(todos){
      res.json(todos);
    }, function(e){
      res.status(500).send();
    });
})

app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);

  db.todo.findById(todoId).then( function(todo){
    if(!!todo){
      res.send(todo.toJSON());
    }else{
      res.status(404).send();
    }
  }).catch(function(e){
    res.status(500).send();
  });

});

app.post('/todos', function(req, res){
  var body  = req.body;

  body = _.pick(body, 'description', 'completed');

  if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
    return res.sendStatus(400);
  }

  body.description = body.description.trim();

  db.todo.create(body).then( function(todo){
    res.send(todo.toJSON());
  }).catch( function(e){
    res.status(400).json(e);
  });

})

app.delete('/todos/:id', function (req, res){
  var todoId = parseInt(req.params.id);

  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then( function(rowsDeleted){
      if(rowsDeleted == 0){
        res.status(404).json({
          error: "No Todo found for id"
        })
      }else{
        res.status(204).send();
      }
    }, function(e){
    res.status(500).send();
  });
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
