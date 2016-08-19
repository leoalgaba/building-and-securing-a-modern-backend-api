
// Dependencias
var express = require('express');
var app = express();
var jwt = require('express-jwt');
var rsaValidation = require('auth0-api-jwt-rsa-validation');

// Middleware para validar el token de acceso cuando nuestro API se llama.
// Los datos los copiamos de la API creada.
var jwtCheck = jwt({
  					secret: rsaValidation(),
  					algorithms: ['RS256'],
  					issuer: "https://leoalgaba.eu.auth0.com/",
  					audience: 'http://movieanalyst.com'
				});

var guard = function (req, res, next) {
	// Vamos a utilizar una sentencia switch case para el itinerario solicitado
	switch(req.path){
		// Si la solicitud es para reseñas de películas vamos a comprobar para ver si el elemento tiene alcance general.
		case '/movies': {
			var permissions = ['general'];
			for (var i=0; i<permissions.length; i++){
				if(req.user.scope.includes(permissions[i])){
					next();
				} else {
					res.send(403, {message:'Prohibido'})
				}
			}
			break;
		}
		// lo mismo para las revisiones (reviewers)
		case '/reviewers': {
			var permissions = ['general'];
			for (var i=0; i<permissions.length; i++){
				if(req.user.scope.includes(permissions[i])){
					next();
				} else {
					res.send(403, {message:'Prohibido'})
				}
			}
			break;
		}
		// lo mismo para publicaciones
		case '/publications': {
			var permissions = ['general'];
			for (var i=0; i<permissions.length; i++){
				if(req.user.scope.includes(permissions[i])){
					next();
				} else {
					res.send(403, {message:'Prohibido'})
				}
			}
			break;
		}
		// Para la ruta pendiente (pending) , vamos a comprobar para asegurarse de que el token tiene el alcance de administrador antes de devolver los resultados
		case '/pending':{
			var permissions =['admin'];
			console.log(req.user.scope);
			for (var i=0; i<permissions.length; i++){
				if (req.user.scope.includes(permissions[i])){
					next();
				} else {
					res.send(403, {message:'Prohibido'});
				}
			}
			break;
		}
	}
};

// Permitir el uso del middleware jwtCheck en todas nuestras rutas
app.use(jwtCheck);
app.use(guard);

// Si no obtenemos las credenciales correctas , enviamos un mensaje apropiado.
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
		res.status(401).json({Mensaje:'Falta token o desautorizado'});
  }
});

// Implementamos el endpoint movies de la API
app.get('/movies', function (req,res) {
	// Lista de peliculas
	var movies = [
    	{title : 'Suicide Squad', release: '2016', score: 8, reviewer: 'Robert Smith', publication : 'The Daily Reviewer'},
    	{title : 'Batman vs. Superman', release : '2016', score: 6, reviewer: 'Chris Harris', publication : 'International Movie Critic'},
    	{title : 'Captain America: Civil War', release: '2016', score: 9, reviewer: 'Janet Garcia', publication : 'MoviesNow'},
    	{title : 'Deadpool', release: '2016', score: 9, reviewer: 'Andrew West', publication : 'MyNextReview'},
   	 	{title : 'Avengers: Age of Ultron', release : '2015', score: 7, reviewer: 'Mindy Lee', publication: 'Movies n\' Games'},
    	{title : 'Ant-Man', release: '2015', score: 8, reviewer: 'Martin Thomas', publication : 'TheOne'},
    	{title : 'Guardians of the Galaxy', release : '2014', score: 10, reviewer: 'Anthony Miller', publication : 'ComicBookHero.com'}
  		];

  		// Envia la respuesta como array JSON
  		res.json(movies)
});

// Implementamos el endpoint reviewers (colaboradores) de la API
app.get('/reviewers', function (req,res) {
	// Lista de colaboradores
	var authors = [
  		{name : 'Robert Smith', publication : 'The Daily Reviewer', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/angelcolberg/128.jpg'},
   		{name: 'Chris Harris', publication : 'International Movie Critic', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/bungiwan/128.jpg'},
    	{name: 'Janet Garcia', publication : 'MoviesNow', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/grrr_nl/128.jpg'},
    	{name: 'Andrew West', publication : 'MyNextReview', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/d00maz/128.jpg'},
    	{name: 'Mindy Lee', publication: 'Movies n\' Games', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/laurengray/128.jpg'},
    	{name: 'Martin Thomas', publication : 'TheOne', avatar : 'https://s3.amazonaws.com/uifaces/faces/twitter/karsh/128.jpg'},
   		{name: 'Anthony Miller', publication : 'ComicBookHero.com', avatar : 'https://s3.amazonaws.com/uifaces/faces/twitter/9lessons/128.jpg'}
  		];

  		// Envia la respuesta como array JSON
  		res.json(authors)
});

// Implementamos el endpoint publications de la API
app.get('/publications', function (req,res) {
	// Lista de publicaciones
	var publications = [
    	{name : 'The Daily Reviewer', avatar: 'glyphicon-eye-open'},
    	{name : 'International Movie Critic', avatar: 'glyphicon-fire'},
   		{name : 'MoviesNow', avatar: 'glyphicon-time'},
   		{name : 'MyNextReview', avatar: 'glyphicon-record'},
    	{name : 'Movies n\' Games', avatar: 'glyphicon-heart-empty'},
    	{name : 'TheOne', avatar : 'glyphicon-globe'},
    	{name : 'ComicBookHero.com', avatar : 'glyphicon-flash'}
  	];

  	// Envia la respuesta como array JSON
  	res.json(publications)
});

// Implementamos el endpoint pending (pendiente de revision) de la API
app.get('/pending', function (req,res) {
	// Lista de pendientes
	var pending = [
    {title : 'Superman: Homecoming', release: '2017', score: 10, reviewer: 'Chris Harris', publication: 'International Movie Critic'},
    {title : 'Wonder Woman', release: '2017', score: 8, reviewer: 'Martin Thomas', publication : 'TheOne'},
    {title : 'Doctor Strange', release : '2016', score: 7, reviewer: 'Anthony Miller', publication : 'ComicBookHero.com'}
  	];

  	// Envia la respuesta como array JSON
  	res.send(pending)
});

// Corremos el servidor en el puerto 8080
app.listen(8080)

