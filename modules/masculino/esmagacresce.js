var criaPaginaModule = angular.module('CriaPaginaModule', []);

criaPaginaModule.controller('CriaPaginaController', function($rootScope, $scope, $http, $location, $timeout) {
	console.log('teste');
	
	$scope._getAllFilesFromFolder =  function(dir){
		
		 $http.post("/produtos/list", {dir: dir})
         .success(function(response) {
        	 console.log(response);
        	 //$scope.produtos = response;
        	 $scope.produtos = chunk(response, 2);
        	 console.log($scope.produtos);
         	console.log('sucesso');
         	return response;
          })
          .error(function(responde){
        	  console.log('error');
		 })
	}
	
	$scope._getAllFilesFromFolder('/img/produtos/masculino/esmaga_cresce');
	
	
	function chunk(arr, size) {
	  var newArr = [];
	  for (var i=0; i<arr.length; i+=size) {
	    newArr.push(arr.slice(i, i+size));
	  }
	  return newArr;
	}
});