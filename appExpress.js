 
var pathAbsolute = __dirname;

var express=require("express");
var bodyParser  =  require("body-parser");
//var multer  = require('busboy');

var http = require('http'),
inspect = require('util').inspect;

var multer = require('multer');

var mysql      = require('mysql');
//var connection = mysql.createConnection({
//    host     : 'localhost',
//    user     : 'webuser',
//    password : 'youniondbpass69',
//    database : 'youniondb'
//});
//
//connection.connect();



var app = express();


app.use(express.static(__dirname));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(multer({ dest: './uploads/',
	onFileUploadComplete: function (file, req, res) {
		console.log(file.fieldname + ' uploaded to  ' + file.path)
		console.log(req);
	}

}));

//app.listen(8080);
var server_port =  '8080';
var server_ip_address =  '127.9.19.1';
 
app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtplw.com.br',
    auth: {
        user: 'trial',
        pass: 'kVeuasNV5331'
    },
    secure: false,
    port: 587
});

//setup e-mail data with unicode symbols 
var mailOptions = {
    from: 'Fred Foo ✔ <cassiano.trevisan@younionit.com.br>', // sender address 
    to: 'cassiano.trevisan@younionit.com.br;marcelo@younionit.com.br;bruno@younionit.com.br', // list of receivers 
    subject: 'Hello ✔', // Subject line 
    text: 'Hello world ✔', // plaintext body 
    html: '<b>Este email foi enviado diretamente do sistema younionit controles, porém de forma trial, a não ser que tenhamos um servidor smtp contrato e eu ainda nao saiba ✔</b>' // html body 
};
 
// send mail with defined transport object 
//transporter.sendMail(mailOptions, function(error, info){
//    if(error){
//        console.log(error);
//    }else{
//        console.log('Message sent: ' + info.response);
//    }
//});

//transporter.sendMail({
//    from: 'cassiano.r.trevisan@gmail.com',
//    to: 'cassiano.trevisan@younionit.com.br',
//    subject: 'hello',
//    text: 'hello world!'
//});




app.post("/horarios/list", function(req, res){
	
	var id_user = req.body.user.id; 	
	var month = req.body.month;
	var year = req.body.year;
	
	//var sqlSelect = "select * from tb_controle_horarios where id_usuario = ?";
	var sqlSelect = "select DATE_FORMAT(data,'%d/%m/%Y') data, " +
			"TIME_FORMAT(hora_entrada,'%H:%i') hora_entrada, " +
			"TIME_FORMAT(hora_saida,'%H:%i') hora_saida,observacao, atividade, id_usuario, id, " +
			"TIME_FORMAT(TIME(hora_saida - hora_entrada),'%H:%i') total_Horas "+
			"from tb_controle_horarios " +
			"where DATE_FORMAT(data,'%c') = ? and DATE_FORMAT(data,'%Y') = ? " +
			"and id_usuario = ? " +
			"order by data, hora_entrada ";
	
    connection.query(sqlSelect, [month, year, id_user], 
		function(err, rows, result){
    		if (err) throw err;
    		
    		res.send(rows);
    });
});


app.post("/reembolso/nota/salvar", function(req, res){
	
	console.log(req.files);
	console.log(req.body);
	var nome_arquivo = req.files.file.path;
	console.log(nome_arquivo);
	var reembolsoNota = req.body;
	
	var sqlInsert = "INSERT INTO tb_reembolso_notas " +
	"(id_reembolso, num_nota, emissor, valor, imagem_nota, id_tipo_reembolso, descricao) " +
	"VALUES ( ?, ?, ?, ?, ?, ?, ?)";

	connection.query(sqlInsert,
			[reembolsoNota.id, reembolsoNota.numeroNota,
			 reembolsoNota.emissor, reembolsoNota.valor,
			 nome_arquivo, reembolsoNota.tipo,
			 reembolsoNota.descricao],//id status = 1 = solicitado
	function(err, result){
		if(err) throw err;
		
		res.send(result);
		
	});	
});









app.post("/controle/reembolso/salvar", function(req, res){
	
	var reembolso = {
						id: req.body.entity.id,
						observacoes : req.body.entity.observacoes,
						id_usuario: req.body.entity.id_usuario
					};
	
	var update = reembolso.id !== undefined || reembolso.id > 0;
	if(update){
		var sqlUpdate = "UPDATE tb_reembolso " +
		"SET observacoes = ?, " +
		"data_requisicao = STR_TO_DATE(?,'%d/%m/%Y') WHERE id = ? and id_usuario= ?";

		connection.query(sqlUpdate,
				[reembolso.observacoes, new Date(), reembolso.id, reembolso.id_usuario],
		function(err, result){
			if(err) throw err;
		
			res.send(result);
		});
		
	}else{//insert
		
		var sqlInsert = "INSERT INTO tb_reembolso " +
		"(id_usuario, observacoes, data_requisicao, id_status) " +
		"VALUES ( ?, ?, NOW(), ?)";

		connection.query(sqlInsert,
				[reembolso.id_usuario, reembolso.observacoes, 1],//id status = 1 = solicitado
		function(err, result){
			if(err) throw err;
			
			res.send(result);
			
		});
	}
	
});


app.post("/horarios/fechamento/mes", function(req, res){
	var resposta = {};
	resposta.flag = false;
	resposta.currentDate = new Date(); 
	var currentMonth = new Date().getMonth()+1;
	var currentYear = new Date().getFullYear();
	
	var user = req.body.user.id;
	var month = req.body.month;
	var year = req.body.year;
	
	var sql = "SELECT * FROM tb_controle_fechamentos_mes f " +
			"left join tb_usuarios u on f.id_usuario = u.id_usuario "+
			"where u.id_usuario = ? " +
			"and f.mes = ? " +
			"and f.ano = ? ";
	
	
	 if(month == currentMonth && year == currentYear ){
		 resposta.flag = true;
		 res.send(resposta);
	 }else{
		 connection.query(sql, [user, month, year], 
				 function(err, rows, result){
			 if (err) throw err;	
			 
			 if(rows.length > 0) {
				 
				 if(rows[0].flag_mes_aberto === 1){
					 resposta.flag = true;
				 }else{
					 resposta.flag = false;
				 }
			 }
			 res.send(resposta);
		 });
	 }
	 
 });


app.get("/index", function(req, res){

    res.sendFile('index.html', { root: pathAbsolute });
});

app.post("/login", function(req, res){

    var login = req.body.username;
    var password = req.body.password;

    var sql = "select u.id_usuario, u.nome, u.senha, u.login, p.id id_perfil, p.nome perfil, p.descricao " +
    		"from tb_usuarios u " +
    		"left join tb_perfis p on p.id = u.id_perfil " +
    		"where u.login= ? and u.senha = ? " +
    		"and u.flag_ativo = 1 ";
    connection.query(sql,[login, password],
        function(err, rows, result){
        if (err) throw err;
        
        var resposta = {};
        resposta.success = false;
        for (var i in rows) {
        	resposta.success = true;
        	resposta.currentUser = convertUserToJson(rows[i]);
        }
        res.send(resposta);
    });

});

function convertUserToJson(user){
	var perfil = {};
	var currentUser = {perfil: perfil};
	currentUser.nome = user.nome;
	currentUser.id_usuario = user.id_usuario;
	currentUser.senha = user.senha;
	currentUser.login = user.login;
	currentUser.perfil.id = user.id_perfil;
	currentUser.perfil.descricao = user.descricao;
	currentUser.perfil.perfil = user.perfil;
	
	return currentUser;
}

app.post("/horarios/salvar", function(req, res){
	
	var horario = {
			id: req.body.entity.id,
			horaEntrada : req.body.entity.hora_entrada,
			horaSaida: req.body.entity.hora_saida,
			id_usuario: req.body.entity.id_usuario,
			sysdate: req.body.entity.sysdate,
			observacao: req.body.entity.observacao,
			data: req.body.entity.data,
			atividade: req.body.entity.atividade
			};
	
	var update = horario.id !== undefined || horario.id > 0;
	if(update){
		var sqlUpdate = "UPDATE tb_controle_horarios " +
		"SET hora_entrada = ?, hora_saida = ?, sysdate = NOW(), observacao = ?, " +
		"data = STR_TO_DATE(?,'%d/%m/%Y'), atividade = ? WHERE id = ? and id_usuario= ?";

		connection.query(sqlUpdate,
				[horario.horaEntrada, horario.horaSaida, horario.observacao, horario.data, horario.atividade, horario.id, horario.id_usuario],
		function(err, result){
			if(err) throw err;
		
			res.send(result);
		});
		
	}else{//insert
		
		var sqlInsert = "INSERT INTO tb_controle_horarios " +
		"( hora_entrada, hora_saida, sysdate, id_usuario, observacao, data, atividade) " +
		"VALUES ( ?, ?, NOW(), ?, ?, STR_TO_DATE(?,'%d/%m/%Y'), ?)";

		connection.query(sqlInsert,
				[horario.horaEntrada, horario.horaSaida, horario.id_usuario, horario.observacao , horario.data, horario.atividade],
		function(err, result){
			if(err) throw err;
			
			res.send(result);
			
		});
	}
	
});

app.post("/horarios/apagar", function(req, res){
	var entity_id = req.body.entity.id;
	
	var sqlDelete = "delete from tb_controle_horarios where id= ?";
	connection.query(sqlDelete,[entity_id],
	        function(err, result){
		if(err) throw err;
		
		res.send(result);
	});
	
});
	

app.post("/reembolso/apagar", function(req, res){
	var entity_id = req.body.entity.id;
	
	var sqlDelete = "delete from tb_reembolso where id= ?";
	connection.query(sqlDelete,[entity_id],
	        function(err, result){
		if(err) throw err;
		
		res.send(result);
	});
	
});

app.post("/authentication/access", function(req, res){
	//define os links que devem ter restrições
	var path = req.body.path;
	var user = req.body.user;
	
	 var acessoRestrito = false;
	
	 //colaboradores
	 if(path === '/controles' ||
     	path === '/politicas' ||
     	path === '/boletim' ||
     	path === '/email'){
		
		 if(!user){
			 acessoRestrito = true;			 
		 }
		
	 }else //Admin
	 
		 if(path === '/controles/liberacao/edicao' ||
			 path === '/usuarios/cadastrar'){
		 if(!user || user === undefined || user.perfil === undefined 
				 || user.perfil.perfil !== "admin"){
			 console.log('acesso restrito true');
			 acessoRestrito = true;
		 }
	 }

	 res.send(acessoRestrito); 
});


app.post("/usuarios/list", function(req, res){
	
	var sql = "select u.id_usuario, u.nome, u.login, p.id id_perfil, p.nome perfil, u.flag_ativo ativo, u.email " +
			"from tb_usuarios u " +
			"left join tb_perfis p on p.id = u.id_perfil ";
	
	connection.query(sql,
	        function(err, result){
		if(err) throw err;
		
		res.send(result);
	});

});

app.post("/reembolso/list", function(req, res){
		
	var id_user = req.body.user.id; 	
	var month = req.body.month;
	var year = req.body.year;
    
	var sql = "select r.id id, " +
	          "DATE_FORMAT(r.data_pagamento,'%d/%m/%Y') data_pag, "+
	          "sr.nome status, r.observacoes observacoes "+
			  "from tb_reembolso r " +
			  "left join tb_status_reembolso sr on sr.id = r.id_status "+
			  "where DATE_FORMAT(data_requisicao,'%c') = ? and DATE_FORMAT(data_requisicao,'%Y') = ? "+
			  "and r.id_usuario = ?";
	
	
	connection.query(sql, [month, year, id_user], 
		function(err, rows, result){
    		if (err) throw err;
    		
    		res.send(rows);
    });

});

app.post("/usuarios/list/typeahead", function(req, res){
	
	var nome = req.body.params.nome;
	
	var sql = "select u.id_usuario, u.nome, u.login, p.id id_perfil, p.nome perfil " +
			"from tb_usuarios u " +
			"left join tb_perfis p on p.id = u.id_perfil " +
			 "where u.nome like '%"+nome+"%' and u.flag_ativo = 1";
	
	connection.query(sql,
	        function(err, result){
		if(err) throw err;

		res.send(result);
	});

});


app.post("/controle/liberacao/bloquear", function(req, res){
	
	var data = req.body.data;
	var user = req.body.id_usuario;
	
	var month = data.split('/')[0];
	var year = data.split('/')[1];
			 
    updateFechamentoMes(user, month, year, 0);				 	 
			 
		 
	res.send("success");
		
	
});	 


app.post("/produtos/list", function(req, res){
	
	res.send(_getAllFilesFromFolder(req.body.dir));
	console.log("req.body,dir =");
	console.log(req.body.dir);
});

var _getAllFilesFromFolder = function(dir) {
console.log("dir = ");
console.log(dir);
    var filesystem = require("fs");
    var results = [];
    //var folderPath = replaceAll(__dirname+dir, "/","\\");
    var folderPath = replaceAll(dir, "/","\\");
    
    console.log("folderPath");
    console.log(folderPath);
    
    var filesList = filesystem.readdirSync(folderPath);
    
    console.log("filesList = ");
    console.log(filesList);    
    
    return filesList;

};


function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}