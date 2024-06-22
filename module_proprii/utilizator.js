const AccesBD=require('./accesbd.js');
const parole=require('./parole.js');

const {RolFactory}=require('./roluri.js');
const crypto=require("crypto");
const nodemailer=require("nodemailer");


class Utilizator{
    static tipConexiune="local";
    static tabel="utilizatori"
    static parolaCriptare="tehniciweb";
    static emailServer="chic.web.test@gmail.com";
    static lungimeCod=64;
    static numeDomeniu="localhost:8080";
    #eroare;

    ///constructorul primeste toate datele
    constructor({id, username, nume, prenume, email, parola, rol, culoare_chat="black", poza}={}) {
        this.id=id;

        //optional sa facem asta in constructor
        try{
            if(this.checkUsername(username))
                 this.username = username;
                else throw new Error ("Username incorrect!")
        }
        catch(e){ this.#eroare=e.message}

        ///arguments = vectorul de argumente
        ///setez toate proprietatiile 
        ///prop e pe rand: id/username/name etc
        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }
        if(this.rol)
            ///ob de tip rol sau doar stringul => creez si setez
            this.rol=this.rol.cod? RolFactory.creeazaRol(this.rol.cod):  RolFactory.creeazaRol(this.rol);
        console.log(this.rol);

        this.#eroare="";
    }

    checkName(nume){
        ///primul caracter e litera mare + litere mici
        return nume!="" && nume.match(new RegExp("^[A-Z][a-z]+$")) ;
    }

    set setareNume(nume){
        if (this.checkName(nume)) this.nume=nume
        else{
            throw new Error("Nume gresit")
        }
    }

    /*
    * folosit doar la inregistrare si modificare profil
    */
    set setareUsername(username){
        if (this.checkUsername(username)) this.username=username
        else{
            throw new Error("Username gresit")
        }
    }

    checkUsername(username){
        ///sa aiba doar anumite caractere
        return username!="" && username.match(new RegExp("^[A-Za-z0-9#_./]+$")) ;
    }

    static criptareParola(parola){
        ///aceeasi cheie de criptare pt toti utilizatorii
        ///criptez parola cu cheia de criptare
        return crypto.scryptSync(parola,Utilizator.parolaCriptare,Utilizator.lungimeCod).toString("hex");
    }

    salvareUtilizator(){
        let parolaCriptata=Utilizator.criptareParola(this.parola);
        let utiliz=this;
        let token=parole.genereazaToken(100);///link de acces
        ///inseram un utilizator nou
        AccesBD.getInstanta(Utilizator.tipConexiune).insert({tabel:Utilizator.tabel,
            campuri:{
                username:this.username,
                nume: this.nume,
                prenume:this.prenume,
                parola:parolaCriptata,
                email:this.email,
                culoare_chat:this.culoare_chat,
                cod:token,
                poza:this.poza},
                confirmat_mail: false
            }, function(err, rez){
            if(err)
                console.log(err);
            else
            ////username + token
                utiliz.trimiteMail("Te-ai inregistrat cu succes","Username-ul tau este "+utiliz.username,
            `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`,
            )
        });
    }
//tjdepcgasrfnqjho


    async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[]){
        ///mesajul creat mai devreme
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{//date login 
                user:Utilizator.emailServer,
                pass:"tjdepcgasrfnqjho"
            },
            tls:{
                rejectUnauthorized:false
            }
        });

        //genereaza html
        await transp.sendMail({
            from:Utilizator.emailServer,
            to:this.email, //TO DO
            subject:subiect,//"Te-ai inregistrat cu succes",
            text:mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }
   
    static async getUtilizDupaUsernameAsync(username){
        if (!username) return null;
        try{
            let rezSelect= await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync(
                {tabel:"utilizatori",
                campuri:['*'],
                conditiiAnd:[`username='${username}'`]
            });
            if(rezSelect.rowCount!=0){
                return new Utilizator(rezSelect.rows[0])
            }
            else {
                console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
                return null;
            }
        }
        catch (e){
            console.log(e);
            return null;
        }
        
    }
    static getUtilizDupaUsername (username,obparam, proceseazaUtiliz){
        ///seteaza eroarea care ne spune daca avem sau nu utilizator
        if (!username) return null;
        let eroare=null;
        ///selectez utilizatorul
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:"utilizatori",campuri:['*'],conditiiAnd:[`username='${username}'`]}, 
            function (err, rezSelect){
            if(err){
                console.error("Utilizator:", err);
                //throw new Error()
                eroare=-2;
            }
            else if(rezSelect.rowCount==0){
                eroare=-1; /// il pot inregistra
            }
            //constructor({id, username, nume, prenume, email, rol, culoare_chat="black", poza}={})
            let u= new Utilizator(rezSelect.rows[0])
            proceseazaUtiliz(u, obparam, eroare);
        });
    }

    areDreptul(drept){
        return this.rol.areDreptul(drept);
    }
}
module.exports={Utilizator:Utilizator}