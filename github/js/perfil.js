var iCria = 1;
var iLer = 2;
var iAltera = 4;

var iValorServico = 3; //Valor de retorno do Serviço

iCria &= iValorServico 
iLer &= iValorServico
iAltera &= iValorServico

console.log('Cria ' + !!iCria);
console.log('Ler ' + !!iLer);
console.log('Alterar ' + !!iAltera);