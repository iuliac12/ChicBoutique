let galerieDinamica; ///array de elemente
let _index = 0;
let numberOfElements = 0;

document.addEventListener("DOMContentLoaded", function() {
    ///documentul html este complet incarcar si citit

    ///imaginile alese trebuie sa fie ultimele din json => reverse
    var boxes = document.querySelectorAll('.box');
    var boxesArray = Array.from(boxes).reverse();
    galerieDinamica = boxesArray;
    
    var numberOfBoxes = boxes.length;
    numberOfElements = numberOfBoxes;

    function startAnimation(box) {
        if (_index == 0) {
            galerieDinamica.forEach(function(element) {
                element.classList.remove('op');
            });
        }
        box.classList.add('animated');///porneste animatia
        box.classList.remove('op');///face elementul vizibil
        
        _index++;
    }

    function restartAnimation(box) {
        
        box.classList.add('op');
        box.classList.remove('animated');

        if (_index < numberOfBoxes) {
            startAnimation(galerieDinamica[_index]);
        } else {
            ///o ia de la capat
            _index = 0;
            startAnimation(galerieDinamica[0]);
        }
    }

    /// la fiecare incarcare de pagina reincarca alte imagini
    galerieDinamica.forEach(function(box) {
        box.addEventListener('animationend', function() {
            ///cand animatia se termina =>  porneste din nou
            ///animationiteration => se declanseaza la sfarsitul fiecarei iteratii cu exceptia ultimei 
            restartAnimation(box);
        });
    });

    if (numberOfElements != 0) {
        startAnimation(galerieDinamica[0]); ///incepe cu primul elemenet
    }
});
