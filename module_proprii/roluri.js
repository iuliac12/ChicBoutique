
const Drepturi=require('./drepturi.js');


class Rol{
    ///factory pt rol
    ///clasa de baza pt toate rolurile
    static get tip() {return "generic"} ///identificator string
    static get drepturi() {return []} //vectorul de drepturi din drepturi.js
    constructor (){
        this.cod=this.constructor.tip;
    }

    areDreptul(drept){ //drept trebuie sa fie tot Symbol
        console.log("in metoda rol!!!!")
        return this.constructor.drepturi.includes(drept); //pentru ca e admin
    }
}

class RolAdmin extends Rol{
    
    ///are drepturile din clasa de baza
    static get tip() {return "admin"}
    constructor (){
        super();
    }

    areDreptul(){///suprascriem
        return true; //pentru ca e admin
    }
}

class RolModerator extends Rol{
    
    static get tip() {return "moderator"}
    static get drepturi() { return [
        Drepturi.vizualizareUtilizatori,
        Drepturi.stergereUtilizatori
    ] }
    constructor (){
        super()
    }
}

class RolClient extends Rol{
    static get tip() {return "comun"}
    static get drepturi() { return [
        Drepturi.cumparareProduse
    ] }
    constructor (){
        super()
    }
}

class RolFactory{
    ///fabrica de erori
    ///returneaza un rol in functie de tipul dat
    static creeazaRol(tip) {
        switch(tip){
            case RolAdmin.tip : return new RolAdmin();
            case RolModerator.tip : return new RolModerator();
            case RolClient.tip : return new RolClient();
        }
    }
}


module.exports={
    RolFactory:RolFactory,
    RolAdmin:RolAdmin
}