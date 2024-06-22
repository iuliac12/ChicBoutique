const express = require("express"); ///require intoarce un obiect -> functie
const fs= require('fs'); ///se refera la fiser ca obiect
const path = require('path'); //se refera doar la cale, nu la fiser
const sharp=require('sharp'); //def const ca sa nu le modificam din greseala
const sass=require('sass');
const ejs=require('ejs');
const AccesBD= require("./module_proprii/accesbd.js"); 

const formidable=require("formidable"); ///procesam datele din formular
const {Utilizator}=require("./module_proprii/utilizator.js")
const session=require('express-session'); ///datele din sesiunea de logare => raman active cat timp utilizatorul foloseste app
const Drepturi = require("./module_proprii/drepturi.js");

const Client = require("pg").Client;

var client= new Client({database:"cti_2024",
        user:"iulia",
        password:"iulia",
        host:"localhost",
        port:5432});
client.connect();



obGlobal = {
    obErori: null,
    obImagini: null,
    optiuniMeniu: [],
    folderCss: path.join(__dirname, "resurse/css"),
    folderScss: path.join(__dirname, "resurse/scss"),
    folderBackup: path.join(__dirname, "backup"),

}


vect_foldere=["temp", "temp1", "backup", "poze_uploadate"] 
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder)  ///cale completa
    if (!fs.existsSync(caleFolder)) 
    // folosim filesystem pt ca folosim obiecte ca fisiere
    {
        fs.mkdirSync(caleFolder); ///creez fisierul daca nu exista
    }
}

/* generare meniu in mod dinamic */
client.query("select * from unnest(enum_range(null::tipuri_rochii))", function(err, rezCategorie) {
    if (err) {
        console.log('Initial fetch error:', err);
    } else {
        obGlobal.optiuniMeniu = rezCategorie.rows;
        console.log('Initial fetch - Optiuni meniu:', obGlobal.optiuniMeniu);
    }
});


app= express(); //apelez o functie din biblioteca express (ca un constructor) ; asculta cereri
///returneaza un obiect de tip server


 ///afiseaza in consola
console.log("Folder proiect", __dirname); ///folderul aplicatiei
console.log("Cale fisier", __filename); /// dirname + nume_fisier index.js
console.log("Director de lucru", process.cwd()); /// folderul de unde rulez aplicatie
 


app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));



app.set("view engine","ejs");
app.use("/resurse", express.static(__dirname+"/resurse"));
app.use("/poze_uploadate", express.static(__dirname+"/poze_uploadate"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));
///primeste o cerere si trimite fisierele din folder : layout.css etc


app.use("/*", function(req, res, next) {
    ///locals = obiectul pe care il trimitem in res.render
    res.locals.optiuni_meniu = obGlobal.optiuniMeniu;
    res.locals.Drepturi = Drepturi;
    if(req.session.utilizator){
        ///cream un utilizator pe baza sesiunii (apelam constructorul)
        ///in req session ob se realizeaza => reprezentam ca un string intern/binar (codificam)
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);///ob cu metodele
    }
    next();
});



app.get(["/", "/index", "/home"], function(req, res){ 
    ///res.sendFile(__dirname+"/index.html");
    res.render("pagini/index", { ip: req.ip, imagini: obGlobal.obImagini.imagini, optiuni_meniu: res.locals.optiuni_meniu });
    ///executa cod javascript ; cauta <% si executa - include fisierul
    ///ejs e executat de server, nu browser
    ///functia render ruleaza pe server
});



app.get("/produse", function(req, res) {
    console.log(req.query);
    var conditieQuery = "";
    if (req.query.tip) {
        conditieQuery = ` where tip_produs=$1`;
    }
    client.query("SELECT DISTINCT culoare FROM boutique WHERE culoare IS NOT NULL", function(err, rezCulori) {
        if (err) {
            console.log(err);
            console.log("Culori locale:", rezCulori.rows);
            return afisareEroare(res, 2);
        }
        client.query("SELECT DISTINCT UNNEST(materiale) AS material FROM boutique WHERE materiale IS NOT NULL", function(err, rezMateriale) {
            if (err) {
                console.log(err);
                return afisareEroare(res, 2);
            }
            client.query("SELECT MIN(pret) AS min_pret, MAX(pret) AS max_pret FROM boutique", function(err, rezPreturi) {
                if (err) {
                    console.log(err);
                    return afisareEroare(res, 2);
                }
                client.query("select * from unnest(enum_range(null::categ_ocazii))", function(err, rezOptiuni) {
                    if (err) {
                        console.log(err);
                        return afisareEroare(res, 2);
                    }
                    const queryText = `select * from boutique${conditieQuery ? conditieQuery : ''}`;
                    const values = req.query.tip ? [req.query.tip] : [];
                    client.query(queryText, values, function(err, rez) {
                        if (err) {
                            console.log(err);
                            return afisareEroare(res, 2);
                        } else {
                            res.render("pagini/produse", {
                                produse: rez.rows,
                                optiuni: rezOptiuni.rows,
                                culori: rezCulori.rows,
                                materiale: rezMateriale.rows,
                                preturi: rezPreturi.rows[0],
                                optiuni_meniu: res.locals.optiuni_meniu // Pass optiuni_meniu here
                            });
                        }
                    });
                });
            });
        });
    });
});



app.get("/produs/:id", function(req, res) {
    const productId = req.params.id;
    client.query('SELECT * FROM boutique WHERE id = $1', [productId], function(err, rez) {
        if(err) {
            console.log(err);
            afisareEroare(res, 2);
        } else {
            const produs = rez.rows[0];
            res.render("pagini/produs", { prod: produs, optiuni: [] });
        }
    });
});


// ------------------------- Utilizatori ----------------------

app.post("/inregistrare",function(req, res){
    var username;
    var poza;
    var formular= new formidable.IncomingForm() ///obiect cu 4 evenimente
    formular.parse(req, function(err, campuriText, campuriFisier )
    {
        
        //4
        ///se executa ultimul
        ///dupa ce primim tot din formular
        ///campuriText : input text/radio etc => numele campurilor input
        ///campuriFisier: input file ; poza
        console.log("Inregistrare:",campuriText);


        console.log(campuriFisier);
        console.log(poza, username);
        var eroare="";


        // TO DO var utilizNou = creare utilizator
        var utilizNou =new Utilizator();
        try{///avem toate datele
            utilizNou.setareNume=campuriText.nume[0];
            utilizNou.setareUsername=campuriText.username[0];
            utilizNou.email=campuriText.email[0]
            utilizNou.prenume=campuriText.prenume[0]
           
            utilizNou.parola=campuriText.parola[0];
            utilizNou.culoare_chat=campuriText.culoare_chat[0];
            utilizNou.poza= poza[0];
            Utilizator.getUtilizDupaUsername(campuriText.username[0], {}, function(u, parametru ,eroareUser ){
                if (eroareUser==-1){//nu exista username-ul in BD
                    utilizNou.salvareUtilizator()
                }
                else{
                    eroare+="Mai exista username-ul";
                }

                if(!eroare){
                    res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"})
                   
                }
                else
                    res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
            })
           


        }
        catch(e){
            console.log(e);
            eroare+= "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare})
        }
   
    });
    formular.on("field", function(nume,val){  
        // 1
   
        console.log(`--- ${nume}=${val}`);
       
        if(nume=="username")
            username=val;
    })
    formular.on("fileBegin", function(nume,fisier){ 
        //2
        console.log("fileBegin");
       
        console.log(nume,fisier);
        //TO DO adaugam folderul poze_uploadate ca static si sa fie creat de aplicatie
        //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului (variabila folderUser)
        var folderUser=path.join(__dirname, "poze_uploadate", username); ///calea pt folderul userului
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser)
       
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
        poza=fisier.originalFilename;
        //fisier.filepath=folderUser+"/"+fisier.originalFilename
        console.log("fileBegin:",poza)
        console.log("fileBegin, fisier:",fisier)


    })    
    formular.on("file", function(nume,fisier){//3 
        ///incepe incarcarea
        console.log("file");
        console.log(nume,fisier);
    });
});


////confirmare email
///cream pagina succes.ejs

app.get("/cod/:username/:token", function(req, res) {
    const { username, token } = req.params;
    AccesBD.getInstanta(Utilizator.tipConexiune).update({
        tabel: Utilizator.tabel,
        campuri: { confirmat_mail: true },
        conditiiAnd: [`username='${username}'`, `cod='${token}'`]
    }, function(err, rez) {
        if (err || rez.rowCount === 0) {
            res.render("pagini/eroare", { text: "Codul de confirmare este invalid sau a expirat." });
        } else {
            res.render("pagini/succes", { text: "Email-ul a fost confirmat cu succes!" });
        }
    });
});



app.post("/login", function(req, res) {
    var username;
    var formular = new formidable.IncomingForm();

    formular.parse(req, function(err, campuriText, campuriFisier) {
        var parametriCallback = {
            req: req,
            res: res,
            parola: campuriText.parola[0]
        }
        Utilizator.getUtilizDupaUsername(campuriText.username[0], parametriCallback,
            function(u, obparam, eroare) { // proceseazaUtiliz
                let parolaCriptata = Utilizator.criptareParola(obparam.parola)
                if (u.parola == parolaCriptata) {
                    if (u.confirmat_mail) {
                        u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                        obparam.req.session.utilizator = u;
                        obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                        obparam.res.redirect("/index");
                    } else {
                        obparam.req.session.mesajLogin = "Trebuie să îți confirmi email-ul!";
                        obparam.res.redirect("/index");
                    }
                } else {
                    console.log("Eroare logare")
                    obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                    obparam.res.redirect("/index"); // redirectionam
                }
            })
    });
});



///delogare
app.get("/logout", function(req, res){
    req.session.destroy(); ///destructor pt session
    res.locals.utilizator=null;
    res.render("pagini/logout");
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
    res.send(""+suma);

}); 


app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/favicon/favicon.ico"));
    ///trimite un fisier de la calea respectiva
});


// ------------------------- Galerie dinamica  ----------------------


app.get("*/galerie_animata.css",function(req, res){

    var sirScss=fs.readFileSync(path.join(__dirname,"resurse/scss_ejs/galerie_animata.scss")).toString("utf8");
    var culori=["navy","black","purple","grey"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator]; 
    rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
    console.log(rezScss);
    var caleScss=path.join(__dirname,"temp/galerie_animata.scss")
    fs.writeFileSync(caleScss,rezScss);
    try {
        rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
        var caleCss=path.join(__dirname,"temp/galerie_animata.css");
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        res.sendFile(caleCss);
    }
    catch (err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("*/galerie_animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie_animata.css.map"));
});


app.get(new RegExp("^\/[A-Za-z\/0-9]*\/$"), function(req, res){
    ///gestioneaza cererile catr url-uri care corespund unui anumit sablon
    ///selecteaza doar url-uri care contin numai litere si cifre
    afisareEroare(res,403);
    
});



// ------------------------- Erori ----------------------


///testare erori

app.get("/*.ejs", function(req, res){
    afisareEroare(res, 400)
});

app.get("/forbidden", function(req, res){
    afisareEroare(res, 403);
});

app.get("/error1", function(req, res){
    afisareEroare(res, 1);
});

app.get("/error2", function(req, res){
    afisareEroare(res, 2);
});

app.get("/error3", function(req, res){
    afisareEroare(res, 3);
});


app.get("/*", function(req, res)
{ 
    ///gestioneaza cererile care nu se potrivesc cu rutele specifice
    console.log(req.url); 
    try{
    res.render("pagini" + req.url, function(err, rezHtml)///concatenam la pagini ca sa cautam res ul corespunzator
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

function initErori()
{

    ///incarca configuratiile erorilor dintr un fisier json
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8")
    ///console.log(continut);
    obGlobal.obErori = JSON.parse(continut);///json e implicit inclus;; parse transforma in obiect
    for(let eroare of obGlobal.obErori.info_erori){
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine) ///concatenam imaginea la calea de baza
        ///toate obiectele au cale completa
    }
    console.log(obGlobal.obErori);
    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)

}

initErori();

function afisareEroare(res, _identificator, _titlu, _text, _imagine)
{
    let eroare = obGlobal.obErori.info_erori.find(
        function(elem)
        {
            return elem.identificator == _identificator
            ///cauta dupa indentificator
        }
    )
    if(!eroare){
        ///configuratia implicita
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
    obGlobal.obImagini=JSON.parse(continut); ///transformam in obiect ca sa ii accesam proprietatile
    let vImagini=obGlobal.obImagini.imagini;

    ///concatenam dirname = folderul in care se gaseste proiectul
    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);///cale absoluta
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");///concatenez mediu (subfolderul)
    let caleAbsMic=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mic");///concatenez mic (subfolderul)

    if (!fs.existsSync(caleAbsMediu)) fs.mkdirSync(caleAbsMediu);
    if (!fs.existsSync(caleAbsMic)) fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split("."); ///separa in nume fisier si extensie
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");///schimbam extensia
        let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp");

        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs); ///indica unde sa salveze redimensionarea
        sharp(caleFisAbs).resize(200).toFile(caleFisMicAbs); ///indica unde sa salveze redimensionarea


        ///redimensionez width => height e calculat automat
        ///actualizam caile absolute ale fisierelor pt cel mediu si cel normal
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier_mic=path.join("/", obGlobal.obImagini.cale_galerie, "mic",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
    }
    console.log(obGlobal.obImagini)
}
initImagini();


function compileazaScss(caleScss, caleCss)
{
    console.log("cale:",caleCss);
    if(!caleCss){ ///daca nu exista calea => am compilat cu un singur parametru

        let numeFisExt=path.basename(caleScss); 
        let numeFis=numeFisExt.split(".")[0]   /// ["a","scss"] => a
        caleCss = numeFis+".css"; ///concatenez noua extensie
    }
    
    ///caile nu sunt absolute => le consideram relative la folderScss resp folderCss
    if (!path.isAbsolute(caleScss)) 
        caleScss=path.join(obGlobal.folderScss,caleScss )//concatenam la calea relativa folderul default in care avem scss
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss ) //salveaza css in folderul default
    

    ///salvare in backup
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css"); 
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true}) ///recursive true = recursiv va crea toate subfolderele
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

///compilare pe parcurs
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