

var usuariosApp = angular.module('UsuariosApp',[]);


usuariosApp.controller('UsuariosCtrl', function($rootScope, $scope, $http, $location, $modal, $document, $timeout) {
	
	loadGrid();
	
	$scope.open = function (size) {
		
		 var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioEditar.html',
		      controller: 'ModalUsuariosEditarCtrl',
		      size: size,
		      resolve: {
		        usuario: function () {
		          return {ativo:"1", id_perfil:2};
		        }
		      }		 
		    });
		 
		 modalInstance.result.then(function (res) {			
			 loadGrid();
	        showSuccess("Usuário criado com sucesso.");
		    });		 
	};
	
	
	$scope.editar = function(entity){		
		var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioEditar.html',
		      controller: 'ModalUsuariosEditarCtrl',		     
		      resolve: {
			        usuario: function () {
			          return entity;
			        }
			      }
		    });	
		
		modalInstance.result.then(function (res) {			 
			 loadGrid();
	         showSuccess("Usuário atualizado com sucesso.");
	    });
		
	};
	
	
	
	$scope.mostrar = function(entity){		
		var modalInstance = $modal.open({
		      templateUrl: 'modules/admin/usuarios/usuarioMostrar.html',
		      controller: 'ModalUsuariosMostrarCtrl',		      
		      resolve: {
			        usuario: function () {
			          return entity;
			        }
			      }
		    });	
		
	};
	
	
	$scope.apagar = function(entity){
		if(entity.ativo == 0){
			showError("Usuário já está inativo.")
		}else{
			var r = confirm("Deseja desativar o usuário? ","");
			if(r == true){
				$http.post('/usuarios/apagar', { entity: entity})
		        .success(function (res) {
		        	showSuccess("Usuário desativado com sucesso.");
		        	loadGrid();
		        });
			}
		}
	};

	
	function loadGrid(){		
		$http.post('/usuarios/list')
	    .success(function (res) {	    	
	    	$scope.usuarios = res;
	    });				
	}
	
	 function hideMsg() {
         $scope.showMsg = false;
     }
	 
	 function showSuccess(msg){
		$scope.showMsg = true;
		$scope.msgController = msg;
     	$scope.classMsgController = "alert alert-success";
     	$timeout(hideMsg, 3000);
	 }
	 
	 function showError(msg){
		$scope.showMsg = true;
		$scope.msgController = msg;
     	$scope.classMsgController = "alert alert-danger";
     	$timeout(hideMsg, 3000);
	 }
	
});

usuariosApp.controller('ModalUsuariosMostrarCtrl', function ($scope,$http, $modalInstance, $filter, usuario) {
	
	$scope.loadDadosPessoais = function(){
		$http.post('/usuarios/dados/list', {usuario: usuario})
	    .success(function (res) {
	    	
	    	$scope.usuario = res;
	    });		
	};
	
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	
	
	$scope.editar = function(){
		$scope.editavel = ! $scope.editavel;
		$scope.loadTipoContratacao();
	};
	
	$scope.salvar = function(){		
		var usuario = $scope.usuario;

		$http.post('/usuarios/dados/salvar', {usuario: usuario})
	    .success(function (res) {
	    	$modalInstance.close(res);
	    });
	};
	
	$scope.loadTipoContratacao = function(){
		$http.post('/usuarios/dados/contratacao/list')
	    .success(function (res) {
	    	$scope.tipoContratacao = res;		    	
	    });
		
	};
		
	$scope.loadDadosPessoais();
	
});

usuariosApp.controller('ModalUsuariosEditarCtrl', function ($scope,$http,md5, $modalInstance, usuario) {
			
	$scope.save = function(){
		var usuario = $scope.usuario;
		
		if(usuario.senha !== usuario.senha2){
			$scope.showMsg = "Senha deve ser igual.";
			$scope.classMsg = "alert alert-danger";
			
		}else if(usuario.id_usuario ===undefined && (usuario.senha2 === undefined || usuario.senha === undefined) ){
			$scope.showMsg = "Informe uma senha para o usuário.";
			$scope.classMsg = "alert alert-danger";			
		}else{
			if(usuario.senha !== undefined){
				usuario.senhaMD5 = md5.createHash(usuario.senha);
				usuario.senha = "";
				usuario.senha2 = "";
			}
			$http.post('/usuarios/salvar', {usuario: usuario})
		    .success(function (res) {		
		    	console.log(res);
		    	if(res.code === "ER_DUP_ENTRY"){
		    		$scope.showMsg = "Este Login já existe";
					$scope.classMsg = "alert alert-danger";
		    	}else{
		    		$modalInstance.close(res);
		    	}
		    });
		}
	};
	
	
	
	$scope.loadPerfil = function(){
		$http.post('/usuarios/perfil/list')
	    .success(function (res) {	    	
	    	$scope.perfis = res;
	    });
		
	};
	
	$scope.loadItems = function(usuario){

		if(usuario !== undefined){
			$scope.usuario = usuario;
		}
	}
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	  
	$scope.loadPerfil();
	$scope.loadItems(usuario);
	
});