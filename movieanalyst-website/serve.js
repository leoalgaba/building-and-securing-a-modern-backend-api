// Declaramos dependencias
var express = require('express');
var request = require('superagent');

// Instanciamos express
var app = express();

// Indicamos que tipo de plantilla vamos a usar y
// directorio de las vistas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views/');

// Indicamos a express donde van los archivos estaticos
app.use(express.static(__dirname + '/public'))

// Estas dos variables la obtendremos de nuestro cliente Auth0 MovieAnalyst-Website
// Para ello vamos al dashboard de auth0
// Copia el id del cliente y el cliente secreto
var NON_INTERACTIVE_CLIENT_ID = 'P2VN4APbBKMURXoEc4ZPhXp2RhiSpZqa';
var NON_INTERACTIVE_CLIENT_SECRET = '-mARrTDhu5OVhQAn51lKMFhAMa82oCuATSA8H4V8MoYUvFxvYqmDcOj8IzWkPBpl';

// A continuación, vamos a definir un objeto que vamos a utilizar para intercambiar
//  nuestras credenciales para un token de acceso
var authData = {
  client_id: NON_INTERACTIVE_CLIENT_ID,
  client_secret: NON_INTERACTIVE_CLIENT_SECRET,
  grant_type: 'client_credentials',
  audience: 'https://movieanalyst.com'
}

// Vamos a crear un middleware para hacer una solicitud a oauth/token de la API Auth0 con authData
// Nuestros datos serán validados y si todo es correcto , nos pondremos en contacto un acceso token
// Almacenaremos este token en la variable req.access_token y continuar la ejecución de la petición
function getAccessToken(req, res, next){
  request
    .post('https://leoalgaba.eu.auth0.com/oauth/token')
    .send(authData)
    .end(function(err, res) {
      if(req.body.access_token){
        req.access_token = res.body.access_token;
        next();
      } else {
        res.send(401, ‘Unauthorized’);
      }
    })
}

// Renderizamos la pagina principal, esta estara siempre disponible
// no interactuara con MovieAnalyst API
app.get('/', function (req, res) {
	res.render('index')
})

// Para la ruta movies , llamaremos al middleware getAccessToken para asegurar que tenemos acceso. Si tenemos un acess_token válido , vamos a hacer una petición con la biblioteca superagent y vamos a estar seguro de agregar nuestro acess_token en un encabezado de autorización antes de hacer la solicitud a nuestra API .
// Una vez que la solicitud se lleva a cabo, nuestra API validará que elacess_token tiene el alcance del derecho a solicitar recurso movies y si lo hace , devolverá los datos de la película . Tomaremos estos datos película, y pasamos junto a nuestra plantilla para la representación movies.ejs
app.get('/movies', getAccessToken, function(req, res){
  request
    .get('http://localhost:8080/movies')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if(data.status == 403){
        res.send(403, '403 Forbidden');
      } else {
        var movies = data.body;
        res.render('movies', { movies: movies} );
      }
    })
})

// El proceso será el mismo para las rutas restantes. Nos aseguraremos de obtener el acess_token primero y luego hacer la solicitud a nuestra API para obtener los datos.
app.get('/authors', getAccessToken, function(req, res){
  request
    .get('http://localhost:8080/reviewers')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if(data.status == 403){
        res.send(403, '403 Forbidden');
      } else {
        var authors = data.body;
        res.render('authors', {authors : authors});
      }
    })
})

app.get('/publications', getAccessToken, function(req, res){
  request
    .get('http://localhost:8080/publications')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if(data.status == 403){
        res.send(403, '403 Forbidden');
      } else {
        var publications = data.body;
        res.render('publications', {publications : publications});
      }
    })
})

// Hemos añadido la ruta pending, pero llamar a esta ruta desde la Web MovieAnalyst siempre resultará en un error 403 Forbidden ya que este cliente no tiene el alcance de administración necesaria para obtener los datos.
app.get('/pending', getAccessToken, function(req, res){
  request
    .get('http://localhost:8080/pending')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end(function(err, data) {
      if(data.status == 403){
        res.send(403, '403 Forbidden');
      }
    })
})

app.listen(3000);