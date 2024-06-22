const express = require("express"); ///require intoarce un obiect -> functie
const fs= require('fs'); ///se refera la fiser ca obiect
const path = require('path'); //se refera doar la cale, nu la fiser
const sharp=require('sharp'); //def const ca sa nu le modificam din greseala
const sass=require('sass');
// const ejs=require('ejs');
 

vect_foldere=["temp", "temp1"] 
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder)  ///cale completa
    if (!fs.existsSync(caleFolder)) // folosim filesystem pt ca folosim obiecte ca fisiere
    {
        fs.mkdirSync(caleFolder); ///creez fisierul daca nu exista
    }
}


obGlobal = {
    obErori: null,
    obImagini: null,
    folderCss: path.join(__dirname, "resurse/css"),
    folderScss: path.join(__dirname, "resurse/scss"),
    folderBackup: path.join(__dirname, "backup"),

}

vect_foldere=["temp", "temp1", "backup"]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

app= express(); //apelez o functie din biblioteca express (ca un constructor)
///returneaza un obiect de tip server

 ///afiseaza in consola
console.log("Folder proiect", __dirname); ///folderul in care se gaseste fisierul pe care rulam
console.log("Cale fisier", __filename); /// dirname + nume_fisier index.js
console.log("Director de lucru", process.cwd()); /// folderul de unde rulez aplicatie
 
app.set("view engine","ejs");
 
app.use("/resurse", express.static(__dirname+"/resurse"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));

///primeste o cerere si trimite fisierele din folder : layout.css etc


app.get(["/", "/index", "/home"], function(req, res){ ///
    ///res.sendFile(__dirname+"/index.html");
    res.render("pagini/index", {ip: req.ip, imagini:obGlobal.obImagini.imagini}); 
    ///res.render("pagini/index", {ip: req.ip}); 
    ///executa cod javascript ; cauta <% si executa - include fisierul
    ///ejs e executat de server, nu browser
    ///functia render ruleaza pe server
});


// trimiterea unui mesaj fix
app.get("/cerere", function(req, res){ ///request si response ; cererea se trimite in browser
    res.send("<span style='color:pink'>Hello world!</span>");
});



//trimiterea unui mesaj dinamic

app.get("/data", function(req, res, next){ 
    res.write("Data: ");
    next();///next e param de tip functie si se apeleaza ; cauta mai departe
});

app.get("/data", function(req, res){
    ///echivalent cu res.send
    res.write(""+new Date()); ///creeaza ob de tip data
    res.end();

});

/*
trimiterea unui mesaj dinamic in functie de parametri (req.params; req.query)
ce face /* si ordinea app.get-urilor.
*/


app.get("/suma/:a/:b", function(req, res){
    /// pune valoarea in parametru a resp b
    var suma=parseInt(req.params.a)+parseInt(req.params.b)
    ///req e un obiect cu prop si metode
    ///req e construit de express
    /// .a e din lista de parametri 
    res.send(""+suma);

}); 


app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/favicon/favicon.ico"));
    ///trimite un fisier de la calea respectiva
});


app.get(new RegExp("^\/[A-Za-z\/0-9]*\/$"), function(req, res){
    ///gestioneaza cererile catr url-uri care corespund unui anumit sablon
    ///selecteaza doar url-uri care contin numai litere si cifre
    afisareEroare(res,403);
    
});

app.get("/*.ejs", function(req, res){
    afisareEroare(res, 400)
});

app.get("/*", function(req, res)
{ 
    ///se potriveste cu orice caz si trebuie pus ultimul
    console.log(req.url); ///concatenam la pagini ca sa cautam res ul corespunzator
    try{
    res.render("pagini" + req.url, function(err, rezHtml)
       {
        //console.log("Pagina: ", rezHtml); ///rezHtml = continutul fisierului trimis catre client
        console.log("Eroare: ", err);
        if(err)
            {
                if(err.message.startsWith("Failed to lookup view"))
                    {
                        afisareEroare(res, 404);
                        console.log("Nu a gasit pagina: ", req.url);
                    }
            }
            else res.send(rezHtml+ "");
        }); 
    }
    catch(err1){
        if(err1)
            {
                    if(err1.message.startsWith("Cannot find module"))
                    {
                        afisareEroare(res, 404);
                        console.log("Nu a gasit resursa: ", req.url);
                    }
            }
            else{
                afisareEroare(res)
                console.log("Eroare: "+ err1)
            }
    }
});

function initErori(){
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8")
    console.log(continut);
    obGlobal.obErori = JSON.parse(continut);
    for(let eroare of obGlobal.obErori.info_erori){
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori);
    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)

}

initErori();

function afisareEroare(res, _identificator, _titlu, _text, _imagine){
    let eroare = obGlobal.obErori.info_erori.find(
        function(elem)
        {
            return elem.identificator == _identificator
        }
    )
    if(!eroare){
        let eroare_default = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: _titlu || eroare_default.titlu,
            imagine: _imagine || eroare_default.imagine,
            text: _text || eroare_default.text,
        })
    }
    else{
        if(eroare.status)
            res.status(eroare.identificator)
            res.render("pagini/eroare", 
        {
            titlu: _titlu || eroare.titlu,
            imagine: _imagine || eroare.imagine,
            text: _text || eroare.text,
        })
    }
}

function initImagini(){
    ///citim fisierul json si il facem string
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");
    ///folosim path.join pentru a renunta la /
    obGlobal.obImagini=JSON.parse(continut); ///transformam in obiect ca sa ii accesam proprietatile
    let vImagini=obGlobal.obImagini.imagini;

    ///concatenam dirname = folderul in care se gaseste proiectul
    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);///cale absoluta
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");///concatenez mediu (subfolderul)
    
    if (!fs.existsSync(caleAbsMediu)) fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split("."); ///separa in nume fisier si extensie
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");///schibam extensia
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs); ///indica unde sa salveze redimensionarea
        ///redimensionez width => height e calculat automat
        ///biblioteca sharp redimensioneaza automat
        ///setam caile absolute ale fisierelor pt cel mediu si cel normal
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
    }
    console.log(obGlobal.obImagini)
}
initImagini();


function compileazaScss(caleScss, caleCss)
{
    console.log("cale:",caleCss);
    if(!caleCss){ ///daca nu exista calea => am compilat cu un singur parametru

        let numeFisExt=path.basename(caleScss); ///basename = numele fisierului cu extensia
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"] -> creeaza vector cu 2 elemente
        caleCss = numeFis+".css"; ///concatenez noua extensie
    }
    
    if (!path.isAbsolute(caleScss)) ///isAbsolute verifica cale absoluta (cu litera de drive, sau http)
        caleScss=path.join(obGlobal.folderScss,caleScss )//concatenam la calea relativa folderul default in care avem scss
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss ) //salveaza css in folderul default
    

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css"); 
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true}) ///recursiver true = recursiv va crea toate subfolderele
    }
    
    // la acest punct avem cai absolute in caleScss si caleCss
    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        /// copiaza continutul fisierului de la calea fisierului css in backup -> resurse/css
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    ///caleCss = cale de output
    rez=sass.compile(caleScss, {"sourceMap":true}); ///compilam fisierul scss pt a obtine un fisier css
    fs.writeFileSync(caleCss,rez.css) ///nu scrie direct in rez, ci in proprietatea css a lui rez
    //console.log("Compilare SCSS",rez);
}

//compileazaScss("a.scss");
vFisiere=fs.readdirSync(obGlobal.folderScss); //citim toate fisierele din director si le punem in vector
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){ ///verificam daca are extensia
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis) ///se uita in mod continuu daca s-a modificat vreun folder
{
    console.log(eveniment, numeFis); ///daca exista o modificare
    if (eveniment=="change" || eveniment=="rename"){ ///rename -> creare/redenumire
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

app.listen(8080); ///asculta pe portul 8080 cereri de la client
console.log("Serverul a pornit");