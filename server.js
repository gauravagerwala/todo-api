var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextid = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('ToDo API Root');
});

app.get('/todos', middleware.requireAuthentication, function(req, res){
    var query = req.query;
    var where ={ userId: req.user.get('id')};

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

app.get('/todos/:id', middleware.requireAuthentication, function(req, res){
  var todoId = parseInt(req.params.id, 10);

  db.todo.findOne({
      id: todoId,
      userId: req.user.get('id')
    }).then( function(todo){
    if(!!todo){
      res.send(todo.toJSON());
    }else{
      res.status(404).send();
    }
  }).catch(function(e){
    res.status(500).send();
  });

});

app.post('/todos', middleware.requireAuthentication, function(req, res){
  var body  = req.body;

  body = _.pick(body, 'description', 'completed');

    db.todo.create(body).then( function(todo){
    // res.send(todo.toJSON());
    req.user.addTodo(todo).then( function(){
      return todo.reload();
    }).then(function(todo){
      res.json(todo);
    });

  }).catch( function(e){
    res.status(400).json(e);
  });

})

app.delete('/todos/:id', middleware.requireAuthentication, function (req, res){
  var todoId = parseInt(req.params.id);

  db.todo.destroy({
    where: {
      id: todoId,
      userId: req.user.get('id')
    }
  }).then( function(rowsDeleted){
      if(rowsDeleted == 0){
        res.status(404).json({
          error: "No Todo found for id"
        });
      }else{
        res.status(204).send();
      }
    }, function(e){
    res.status(500).send();
  });
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res){
  var todoId = parseInt(req.params.id);
  
  var body = _.pick(req.body, 'description', 'completed');
  var item = {};
  
  if(body.hasOwnProperty('completed')){
    item.completed = body.completed;
  }

  if(body.hasOwnProperty('description')){
    item.description = body.description;
  }

  db.todo.findOne({
    where: {
      id: todoId,
      userId: req.user.get('id')
    }    
  }).then( function(todo){
    if(todo){
       todo.update(item).then( function(todo){
       res.json(todo.toJSON());
      }, function(e){
       res.status(400).json(e);
     })
    }else{
      res.status(404).send();
    }
  }, function(e){
    res.sendStatus(500);
  });
});

app.post('/users', function(req, res){
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then( function(user){
    res.send(user.toPublicJSON());
  }, function(e){
    res.status(400).json(e);
  });

});

app.post('/users/login', function(req,res){
  var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then( function(user){
      var token = user.generateToken('authentication');
      if(token){
        res.header('Auth', token).json(user.toPublicJSON()); 
      }else{
        res.status(401).send();
      }
      
    }, function(){
      res.status(401).send();
    });
});

db.sequelize.sync().then( function(){
  app.listen(PORT, function(){
    console.log('Express listening on port ' + PORT);
  });
});