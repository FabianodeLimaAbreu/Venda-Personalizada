var PROP = {
  Considerada: 0,
  Obs: 'textArea',
  Resposta: '',
  Status: 'INVIÁVEL',
  Tipo: 1,
  HTMLProposta:$("html").html(),
  VPNumber: '0000000245'
}
console.log($("html").html());
$.ajax({
    url: 'http://was-dev/Focus24/Services/VP.svc/SalvaProposta/0',
    data: JSON.stringify(PROP),
    type: 'POST',
    contentType: "application/json; charset=utf-8",
    traditional: true,
    success: function(data){
      console.log(data);
    }
});