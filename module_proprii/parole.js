
sirAlphaNum="";
v_intervale=[[48,57],[65,90],[97,122]] ///coduri ACII - cifre/ litere mici/mari
for(let interval of v_intervale){
    for(let i=interval[0]; i<=interval[1]; i++)
        sirAlphaNum+=String.fromCharCode(i) ///caracter
}

console.log(sirAlphaNum);

function genereazaToken(n){
    ///primeste un nr de caractere n si creeaza sirul aleator token
    ///putem sa ne cream un format de generare token
    let token=""
    for (let i=0;i<n; i++){
        token+=sirAlphaNum[Math.floor(Math.random()*sirAlphaNum.length)]
        ///numere random intre 0 si nr de caractere
    }
    return token;
}

module.exports.genereazaToken=genereazaToken;