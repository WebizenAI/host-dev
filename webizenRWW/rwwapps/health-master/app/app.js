


// for debug only
var __kb;
var __scope;


/**
* The main app
*/
var App = angular.module('Nutrition', [
  'ngAudio',
  'lumx'
]);

App.config(function($locationProvider) {
  $locationProvider
  .html5Mode({ enabled: true, requireBase: false });
});

App.controller('Main', function($scope, $http, $location, $timeout, ngAudio, LxNotificationService, LxProgressService, LxDialogService) {
  // Namespaces
  var CHAT  = $rdf.Namespace("https://ns.rww.io/chat#");
  var CURR  = $rdf.Namespace("https://w3id.org/cc#");
  var DCT   = $rdf.Namespace("http://purl.org/dc/terms/");
  var FACE  = $rdf.Namespace("https://graph.facebook.com/schema/~/");
  var FOAF  = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
  var LIKE  = $rdf.Namespace("http://ontologi.es/like#");
  var LDP   = $rdf.Namespace("http://www.w3.org/ns/ldp#");
  var MBLOG = $rdf.Namespace("http://www.w3.org/ns/mblog#");
  var NUT   = $rdf.Namespace("https://melvincarvalho.github.io/nutrition/ns/nutrition.ttl#");
  var OWL   = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
  var PIM   = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
  var RDF   = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
  var RDFS  = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
  var SIOC  = $rdf.Namespace("http://rdfs.org/sioc/ns#");
  var SOLID = $rdf.Namespace("http://www.w3.org/ns/solid/app#");
  var TMP   = $rdf.Namespace("urn:tmp:");

  var f,g;

  var defaultStorageURI = 'https://nutrition.databox.me/Public/nutrition/test';
  var doap = 'https://melvincarvalho.github.io/health/doap.ttl#this';
  var defaultInbox = 'https://melvin.databox.me/Public/inbox';

  // INIT
  /**
  * Init app
  */
  $scope.initApp = function() {
    $scope.init();
  };

  /**
  * Set Initial variables
  */
  $scope.init = function() {

    $scope.initRDF();
    $scope.initUI();

    /*
    $scope.initRDF();
    $scope.initQueryString();
    $scope.initLocalStorage();
    */

    __kb = g;
    __scope = $scope;
  };


  /**
  * Init UI
  */
  $scope.initUI = function() {
    $scope.initialized = true;
    $scope.loggedIn = false;
    $scope.loginTLSButtonText = "Login";
    $scope.audio = ngAudio.load('audio/button-3.mp3');
    $scope.inbox = defaultInbox;

    $scope.foods = [
      { "name" : "BIO jogurt selský: Bílý Hollandia", "uri" : "urn:tmp:0"},
      { "name" : "Bio Olmíci jogurt bílý 110 g Olma", "uri" : "urn:tmp:1"},
      { "name" : "Caesar s kuřetem a krutony titbit", "uri" : "urn:tmp:2"},
      { "name" : "Count on Us Beef Lasagne Marks & Spencer", "uri" : "urn:tmp:3"},
      { "name" : "Count on Us Chicken Jalfrezi With Spiced Basmati Rice Marks and Spencer", "uri" : "urn:tmp:4"},
      { "name" : "Count on Us Strawberry Trifle Marks and Spencer", "uri" : "urn:tmp:5"},
      { "name" : "Count on Us Thai Green Curry Marks and Spencer", "uri" : "urn:tmp:6"},
      { "name" : "countrylife Zapečené těstoviny s listovým špenátem a žampiony (1, 6, 9) Královská zelenina v kešu krému (8, 9) Bramborová kaše (6) Zelňačka s tempehem (6, 9)", "uri" : "urn:tmp:7"},
      { "name" : "Cous-Cous s grilovaným kuřetem a zeleninou Titbit", "uri" : "urn:tmp:8"},
      { "name" : "Freekeh se zeleninou a opraženou slunečnicí (1, 9) Ďobáčky s dýní (6, 9, 10) Bramborová kaše (6) Polévka čočková (9)", "uri" : "urn:tmp:9"},
      { "name" : "Glass of water", "uri" : "urn:tmp:10"},
      { "name" : "Guláš se seitanem, hlívou ústřičnou a polentou (1, 6, 9) Rýžový nákyp s ovocem a ořechy (6, 8) Polévka brokolicová (6, 9)", "uri" : "urn:tmp:11"},
      { "name" : "HONEY ROAST HAM & MATURE CHEDDAR CHEESE Marks and Spencer", "uri" : "urn:tmp:12"},
      { "name" : "NAŠE BIO DEZERT Z TVAROHU A JOGURTU VANILKOVÝ", "uri" : "urn:tmp:13"},
      { "name" : "Naše BIO jogurt bílý", "uri" : "urn:tmp:14"},
      { "name" : "Naše BIO jogurt borůvkový", "uri" : "urn:tmp:15"},
      { "name" : "Naše Bio Jogurt jablko se skořicí", "uri" : "urn:tmp:16"},
      { "name" : "NAŠE BIO JOGURT JABLKO SKOŘICE.", "uri" : "urn:tmp:17"},
      { "name" : "NAŠE BIO JOGURT JABLKO SKOŘICE", "uri" : "urn:tmp:18"},
      { "name" : "Naše BIO jogurt jahodový", "uri" : "urn:tmp:19"},
      { "name" : "Naše BIO jogurt malinový", "uri" : "urn:tmp:20"},
      { "name" : "NAŠE BIO JOGURT S MARCIPÁNEM A MÁKEM", "uri" : "urn:tmp:21"},
      { "name" : "Naše Bio Vanilkový dezert", "uri" : "urn:tmp:22"},
      { "name" : "Pohankovy salat s grilovanou zeleninou a uzenym tempehem veganz cz", "uri" : "urn:tmp:23"},
      { "name" : "Slanina & vejce s hořčičným dresinkem titbit", "uri" : "urn:tmp:24"},
      { "name" : "Slanina & vejce s hořčičným dresinkem Titbit", "uri" : "urn:tmp:25"},
      { "name" : "Sprinton BOLOGNESE", "uri" : "urn:tmp:26"},
      { "name" : "Sprinton MASOVÝ", "uri" : "urn:tmp:27"},
      { "name" : "Sprinton MEXICANA", "uri" : "urn:tmp:28"},
      { "name" : "Sprinton PIKANTNÍ SEKANÁ", "uri" : "urn:tmp:29"},
      { "name" : "Sprinton SELSKÝ", "uri" : "urn:tmp:30"},
      { "name" : "Sprinton ŠUNKOVÝ", "uri" : "urn:tmp:31"},
      { "name" : "Sušená rajčata & prosciutto salát s hořčičným dresinkem Titbit", "uri" : "urn:tmp:32"},
      { "name" : "TVAROHOVÝ DEZERT S JOGURTEM BRUSINKOVÝ", "uri" : "urn:tmp:33"},
      { "name" : "TVAROHOVÝ DEZERT S JOGURTEM JAHODOVÝ NAŠE BIO", "uri" : "urn:tmp:34"},
      { "name" : "Vietnamese Style Marinated Pork Salad Bites Marks and Spencer", "uri" : "urn:tmp:35"},
      { "name" : "Wrap s quinoou a tempehem", "uri" : "urn:tmp:36"},
    ];

    $scope.selects = {
      selectedFood: undefined,
    };

  };



  /**
  * Get values from localStorage
  */
  $scope.initLocalStorage = function() {
    if (localStorage.getItem('user')) {
      var user = JSON.parse(localStorage.getItem('user'));
      $scope.loginSuccess(user);
    }
  };

  /**
  * init RDF knowledge base
  */
  $scope.initRDF = function() {
    var PROXY = "https://rww.io/proxy.php?uri={uri}";
    var AUTH_PROXY = "https://rww.io/auth-proxy?uri=";
    var TIMEOUT = 90000;
    $rdf.Fetcher.crossSiteProxyTemplate=PROXY;

    g = $rdf.graph();
    f = $rdf.fetcher(g, TIMEOUT);
  };

  /**
  * init from query string
  */
  $scope.initQueryString = function() {
    $scope.storageURI = defaultStorageURI;
    if ($location.search().storageURI) {
      $scope.storageURI = $location.search().storageURI;
    }
    $scope.setStorageURI($scope.storageURI);
  };

  /**
  * setStorageURI set the storage URI for words
  * @param  {String} the storage URI for words
  */
  $scope.setStorageURI = function(storageURI) {
    $scope.storageURI = storageURI;
    $location.search('storageURI', $scope.storageURI);
  };


  // AUTH
  /**
  * TLS Login with WebID
  */
  $scope.TLSlogin = function() {
    var AUTHENDPOINT = "https://databox.me/";
    $scope.loginTLSButtonText = 'Logging in...';
    $http({
      method: 'HEAD',
      url: AUTHENDPOINT,
      withCredentials: true
    }).success(function(data, status, headers) {
      var header = 'User';
      var scheme = 'http';
      var user = headers(header);
      if (user && user.length > 0 && user.slice(0,scheme.length) === scheme) {
        $scope.loginSuccess(user);
      } else {
        $scope.notify('WebID-TLS authentication failed.', 'error');
      }
      $scope.loginTLSButtonText = 'Login';
    }).error(function(data, status, headers) {
      $scope.notify('Could not connect to auth server: HTTP '+status);
      $scope.loginTLSButtonText = 'Login';
    });
  };

  /**
  * loginSuccess called after successful login
  * @param  {String} user the logged in user
  */
  $scope.loginSuccess = function(user) {
    $scope.notify('Login Successful!');
    $scope.loggedIn = true;
    $scope.user = user;
    $scope.fetchAll();
    localStorage.setItem('user', JSON.stringify(user));
  };

  /**
  * Logout
  */
  $scope.logout = function() {
    $scope.init();
    $scope.notify('Logout Successful!');
    localStorage.removeItem('user');
  };

  // FETCH functions
  //
  //
  $scope.fetchAll = function() {
  };

  /**
  * Invalidate a cached URI
  * @param  {String} uri The URI to invalidate
  */
  $scope.invalidate = function(uri) {
    console.log('invalidate : ' + uri);
    f.unload(uri);
    f.refresh($rdf.sym(uri));
  };

  /**
  * fetchSeeAlso fetches the see also
  */
  $scope.fetchSeeAlso = function() {
    var seeAlso = 'https://melvincarvalho.github.io/nutrition/data/seeAlso.ttl';
    if ($location.search().seeAlso) {
      seeAlso = $location.search().seeAlso;
    }
    f.nowOrWhenFetched(seeAlso, undefined, function(ok, body) {
      console.log('seeAlso fetched from : ' + seeAlso);
    });

  };

  /**
  * Save the nutrtion
  */
  $scope.save = function() {
    var nutrition = $scope.nutrition || $scope.selects.food.name;
    if (!nutrition) {
      LxNotificationService.error('nutrition is empty');
      return;
    }
    console.log(nutrition);


    var message = "#nutrition: you consumed "+ nutrition +".";
    var img = 'https://melvincarvalho.github.io/health/images/icon.png';
    var post = createPost($scope.user, message, doap, img);

    console.log('writing to : ' + $scope.inbox);
    console.log(post);
    $http({
      method: 'POST',
      url: $scope.inbox,
      withCredentials: true,
      headers: {
        "Content-Type": "text/turtle"
      },
      data: post,
    }).
    success(function(data, status, headers) {
      $scope.notify('Post saved');
      $scope.render();
    }).
    error(function(data, status, headers) {
      $scope.notify('could not save nutrition', 'error');
    });


  };


  // HELPER
  /**
  * Notify
  * @param  {String} message the message to display
  * @param  {String} type the type of notification, error or success
  */
  $scope.notify = function(message, type) {
    console.log(message);
    if (type === 'error') {
      LxNotificationService.error(message);
    } else {
      LxNotificationService.success(message);
    }
  };

  /**
  * create a post in turtle
  * @param  {string} webid       the creator
  * @param  {string} message     the message to send
  * @param  {string} application application that created it
  * @param  {string} img         img for that post
  * @return {string}             the message in turtle
  */
  function createPost(webid, message, application, img) {
    var turtle;
    turtle = '<#this> ';
    turtle += '    <http://purl.org/dc/terms/created> "'+ new Date().toISOString() +'"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;\n';
    turtle += '    <http://purl.org/dc/terms/creator> <' + webid + '> ;\n';
    turtle += '    <http://rdfs.org/sioc/ns#content> "'+ message.trim() +'" ;\n';
    turtle += '    a <http://rdfs.org/sioc/ns#Post> ;\n';

    if (application) {
      turtle += '    <http://www.w3.org/ns/solid/app#application> <' + application + '> ;\n';
    }

    if (img) {
      turtle += '    <http://xmlns.com/foaf/0.1/img> <' + img + '> ;\n';
    }

    turtle += '    <http://www.w3.org/ns/mblog#author> <'+ webid +'> .\n';
    return turtle;
  }


  // RENDER
  /**
  * render screen
  */
  $scope.render = function() {
  };

  /**
  * Refresh
  */
  $scope.refresh = function() {
    $scope.render();
  };

  /**
  * openDialog opens a dialog box
  * @param  {String} elem  The element to display
  */
  $scope.openDialog = function(elem) {
    LxDialogService.open(elem);
    $(document).keyup(function(e) {
      if (e.keyCode===27) {
        LxDialogService.close(elem);
      }
    });
  };


  // SOCKETS
  //
  //
  /**
  * Get wss from URI
  * @param  {String} uri The URI to use
  */
  function getWss(uri) {
    return 'wss://' + uri.split('/')[2];
  }

  /**
  * Connect to a web socket
  * @param  {String}  sub Where to subscribe to
  * @param  {boolean} quiet dont ping server
  */
  function connectToSocket(sub, quiet) {
    // Some servers time out after 5 minutes inactive
    var INTERVAL  = 240 * 1000;
    var RECONNECT = 60 * 1000;

    if ($scope.socket) return;

    var socket;

    var wss = getWss(sub);
    console.log('connecting to : ' + wss);

    socket = new WebSocket(wss);

    socket.onopen = function(){
      console.log(sub);
      $scope.socket = socket;
      socket.send('sub ' + sub, socket);

      if (!quiet) {
        setInterval(function() { socket.send('ping'); }, INTERVAL);
      }

    };

    socket.onerror = function(){
      console.log('socket error');
      setTimeout(connect, RECONNECT);
    };

    socket.onclose = function(){
      console.log('socket closed');
      setTimeout(connect, RECONNECT);
    };

    socket.onmessage = function(msg) {
      var a = msg.data.split(' ');
      if (a[0] !== 'pub') return;
      processSocket(a[1]);
    };

  }

  /**
  * Process message from socket
  * @param  {String} uri uri that has changed
  */
  function processSocket(uri) {
    console.log(uri);

    $scope.invalidate(uri);
    $scope.audio.play();
  }



  $scope.initApp();

});

/**
* Escape URIs filter
*/
App.filter('escape', function() {
  return window.encodeURIComponent;
});
