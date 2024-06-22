DROP TYPE IF EXISTS categ_ocazii;
DROP TYPE IF EXISTS tipuri_rochii;

CREATE TYPE categ_ocazii AS ENUM( 'Event', 'Limited Edition', 'Office', 'City Chic','Urban Street');
CREATE TYPE tipuri_rochii AS ENUM('Rochie mini', 'Rochie medium', 'Rochie lunga', 'Rochie de zi', 'Rochie de seara', 'Cocktail Party');


CREATE TABLE IF NOT EXISTS boutique (
   id serial PRIMARY KEY,
   nume VARCHAR(50) NOT NULL,
   descriere TEXT,
   imagine VARCHAR(300),
   categorie categ_ocazii DEFAULT 'City Chic',
   tip_produs tipuri_rochii DEFAULT 'Rochie de zi',
   pret NUMERIC(8,2) NOT NULL,
   marimi INTEGER [],
   data_productie DATE NOT NULL,
   culoare VARCHAR(50),
   materiale VARCHAR [],
   in_stoc BOOLEAN NOT NULL,
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO boutique (nume, descriere, imagine, categorie, tip_produs, pret, marimi, data_productie, culoare, materiale, in_stoc) VALUES 
('Rochie Regală Cu Aplicații De Perle', 'O rochie cu adevărat regală, cu aplicații bogate de perle și mătase fină, pentru o apariție de neuitat.', 'g24.jpg', 'Limited Edition', 'Rochie de seara', 3499.99, ARRAY[32, 36, 40], '2024-02-20', 'Roz Pudrat', ARRAY['Mătase', 'Perle', 'Tafta'], TRUE),
('Rochie De Seară Pelerină', 'Un design clasic cu o notă modernă, această rochie de seară este perfectă pentru o apariție elegantă sub lumina lunii.', 'g25.jpg', 'Event', 'Rochie de seara', 2199.99, ARRAY[32, 36, 40], '2024-03-10', 'Alb Sidefat', ARRAY['Crep', 'Mătase', 'Dantelă'], TRUE),
('Rochie De Bal Elegantă', 'Această rochie de bal atrage privirile cu finisaje rafinate și detalii strălucitoare, pentru o apariție de neuitat la bal.', 'g26.jpg', 'Event', 'Rochie lunga', 1899.99, ARRAY[34, 36, 40], '2024-02-10', 'Alb', ARRAY['Mătase', 'Dantelă', 'Voal'], TRUE),
('Rochie De Gală Auriu Nobil', 'O rochie impresionantă, împodobită cu detalii aurii și mătase fină, pentru o apariție remarcabilă la orice eveniment de gală.', 'g27.jpg', 'Event', 'Rochie de seara', 3299.99, ARRAY[30, 32, 34, 36, 38, 40], '2023-10-25', 'Auriu', ARRAY['Mătase', 'Brocart', 'Dantelă'], TRUE),
('Rochie De Gală Florală', 'O rochie spectaculoasă, cu imprimeu floral și mătase fină, pentru a atrage toate privirile la orice eveniment de gală.', 'g28.jpg', 'Event', 'Rochie lunga', 2999.99, ARRAY[30, 32, 34, 36, 38, 40], '2023-12-15', 'Auriu', ARRAY['Mătase', 'Brocart', 'Dantelă'], TRUE),
('Rochie Lungă Organza Cu Flori Imperiale', 'Această rochie îmbină farmecul vintage cu eleganța modernă, pentru un eveniment plin de rafinament și stil.', 'g29.jpg', 'Limited Edition', 'Rochie lunga', 4599.99, ARRAY[32, 36, 40], '2024-04-05', 'Roz Bombon', ARRAY['Organza', 'Tafta', 'Mătase'], TRUE),
('Rochie De Gală De Mătase', 'Această rochie de gală de mătase combină finețea materialului cu detaliile de dantelă, pentru o eleganță fără efort.', 'g31.jpg', 'Event', 'Rochie de seara', 3199.99, ARRAY[30, 32, 34, 36, 38, 40], '2023-10-15', 'Roz Pal', ARRAY['Mătase', 'Dantelă'], TRUE),
('Rochie Din Tulle Brodat', 'Această rochie elegantă impresionează cu detaliile de dantelă și mătase, pentru o seară romantică și rafinată.', 'g34.jpg', 'Event', 'Rochie lunga', 4399.99, ARRAY[40, 42], '2023-10-10', 'ivory', ARRAY['Tulle', 'Mătase', 'Dantelă'], TRUE),
('Rochie Lungă Couture Tulle', 'O rochie boemă, potrivită pentru cele mai rafinate evenimente, cu croială clasică și detalii elegante.', 'g36.jpg', 'Limited Edition', 'Rochie lunga', 1799.99, ARRAY[32, 36], '2024-04-20', 'Roz/Verde-Fistic', ARRAY['Tulle', 'Mătase', 'Dantelă'], TRUE),
('Rochie Medium Din Satin', 'O rochie simplă și elegantă, potrivită pentru ocazii diverse și ușor de asortat.', 'g37.jpg', 'Urban Street', 'Rochie medium', 749.99, ARRAY[32, 36, 40], '2024-04-15', 'Negru', ARRAY['Satin'], TRUE),
('Rochie De Bal Eternă', 'Această rochie de bal îmbină eleganța clasică cu o notă modernă, oferind un aspect fermecător și sofisticat.', 'a1.jpg', 'Event', 'Rochie de seara', 3999.99, ARRAY[32], '2023-11-10', 'Albastru Safir', ARRAY['Mătase', 'Tafta', 'Dantelă'], TRUE),
('Rochie Regală Cu Aplicații De Brocart', 'O rochie de seară impunătoare, cu aplicații de brocart și mătase, pentru o apariție regală și memorabilă.', 'a2.jpg', 'Limited Edition', 'Rochie de seara', 3799.99, ARRAY[32, 36, 40], '2024-01-05', 'Argintiu', ARRAY['Mătase', 'Brocart', 'Dantelă'], TRUE),
('Rochie De Seară Tulle', 'Elegantă și strălucitoare, această rochie de seară este împodobită cu detalii din diamante și broderii fine.', 'a3.jpg', 'Event', 'Rochie de seara', 2999.99, ARRAY[32, 36, 40], '2023-12-01', 'Roz Pudrat', ARRAY['Mătase', 'Dantelă', 'Diamante'], TRUE),
('Rochie Florală Cu Detalii Vintage', 'O rochie boemă, cu design fluid și detaliile de dantelă, pentru o seară relaxantă și plină de stil.', 'a4.jpg', 'Limited Edition', 'Rochie lunga', 4299.99, ARRAY[32, 36, 40], '2024-03-01', 'Ivory', ARRAY['Mătase', 'Dantelă', 'Voal'], TRUE),
('Rochie Safir Cocktail', 'O rochie safir, cu croială elegantă și detalii strălucitoare, perfectă pentru o seară sofisticată și memorabilă.', 'a6.jpg', 'Event', 'Cocktail Party', 4189.99, ARRAY[32, 34, 40], '2024-03-01', 'Albastru Safir', ARRAY['Mătase', 'Dantelă', 'Voal'], TRUE),
('Rochie Mini', 'O rochie boemă, cu design fluid și detaliile de dantelă, pentru o seară relaxantă și plină de stil.', 'a5.jpg', 'Limited Edition', 'Rochie mini', 2599.99, ARRAY[32, 36, 40], '2024-03-01', 'Ivory', ARRAY['Mătase'], TRUE),
('Rochie City Chic Casual', 'Această rochie casual din bumbac premium este perfectă pentru o zi relaxată în oraș. Croiala sa lejeră și designul modern oferă confort și stil, făcând-o ideală pentru plimbări și întâlniri cu prietenii.', 'p9.jpg', 'City Chic', 'Rochie mini', 500, ARRAY[34, 36, 38], '2024-01-15', 'Alb', ARRAY['Bumbac', 'Elastan'], TRUE),
('Rochie Urban Street', 'Confortabilă și stylish, această rochie este ideală pentru activitățile zilnice. Cu un design minimalist și material respirabil, este perfectă pentru zilele aglomerate.', 'p10.jpg', 'Urban Street', 'Rochie medium', 649.99, ARRAY[36, 38, 40, 42], '2024-01-25', 'Alb', ARRAY['Bumbac', 'Poliester'], TRUE),
('Rochie Office Eleganță Clasică', 'Această rochie office, cu o croială clasică și material de calitate superioară, este ideală pentru un look profesionist și sofisticat. Perfectă pentru întâlniri și evenimente formale.', 'p6.jpg', 'Office', 'Rochie medium', 759.99, ARRAY[36, 38, 40], '2024-02-20', 'Alb sidefat', ARRAY['Bumbac', 'Poliester'], TRUE),
('Rochie Office Modernă', 'Cu un design modern și detalii elegante, această rochie office este ideală pentru femeile care doresc să îmbine stilul cu profesionalismul. Materialul confortabil și croiala precisă o fac perfectă pentru o zi la birou.', 'p7.jpg', 'Office', 'Rochie medium', 689.99, ARRAY[34, 36, 38, 40], '2024-03-05', 'Bleumarin', ARRAY['Poliester', 'Bumbac'], TRUE),
('Rochie De Seară Glamour', 'Cu un design glamour și detalii strălucitoare, această rochie este perfectă pentru a impresiona la orice petrecere de seară.', 'p4.jpg', 'Event', 'Rochie de seara', 3499.99, ARRAY[34, 36, 38], '2024-03-05', 'Rosu', ARRAY['Mătase', 'Tulle'], TRUE),
('Rochie De Gală cu Cristale Swarovski', 'O rochie impresionantă cu aplicații de cristale Swarovski, pentru o apariție de neuitat la evenimente de gală.', 'p13.jpg', 'Limited Edition', 'Rochie de seara', 5799.99, ARRAY[32, 36, 40], '2024-05-15', 'Verde', ARRAY['Mătase', 'Cristale Swarovski'], TRUE),
('Rochie De Gală cu Cristale Swarovski', 'O rochie impresionantă cu aplicații de cristale Swarovski, pentru o apariție de neuitat la evenimente de gală.', 'p12.jpg', 'Limited Edition', 'Cocktail Party', 4599.99, ARRAY[32, 38, 40], '2024-05-15', 'Alb sidefat', ARRAY['Mătase', 'Cristale Swarovski'], TRUE),
('Rochie Lungă diin Tulle', 'Această rochie din satin aduce un plus de eleganță și rafinament, ideală pentru evenimente speciale și apariții de neuitat.', 'p2.jpg', 'Limited Edition', 'Rochie lunga', 3799.99, ARRAY[32, 34, 36, 38], '2024-02-28', 'Negru', ARRAY['Tulle', 'Dantelă'], TRUE);








INSERT INTO boutique (nume, descriere, imagine, categorie, tip_produs, pret, marimi, data_productie, culoare, materiale, in_stoc) VALUES 
('Rochie City Chic Eleganță Urbană', 'Cu un design elegant și sofisticat, această rochie de mătase adaugă o notă de rafinament oricărei ieșiri în oraș. Detaliile subtile și croiala impecabilă o fac alegerea perfectă pentru ocazii speciale.', 'p9.jpg', 'City Chic', 'Rochie Mini', 500, ARRAY[36, 38], '2024-02-05', 'Alb', ARRAY['Mătase'], TRUE),


('Rochie Imperiala de Catifea', 'O combinatie de rafinament si lux, aceasta rochie de catifea se remarca prin detaliile sale regale si finisajele de inalta calitate.', 'g20.jpg', 'Event', 'Rochie lunga', 2499.99, ARRAY[30, 32, 34, 36, 38, 40], '2024-01-15', 'bleumarin', ARRAY['catifea', 'broderie', 'matase'], TRUE),
('Rochie de Nunta Luxurianta', 'Aceasta rochie de mireasa este pur si simplu desprinsa dintr-un basm, cu dantela fina si matase delicata.', 'g9.jpg', 'City Chic', 'Rochie lunga', 4999.99, ARRAY[36, 40], '2023-09-05', 'ivory', ARRAY['dantela', 'matase', 'tafta'], TRUE),
('Rochie de Gala', 'Un adevarat cadou pentru orice ocazie festiva, aceasta rochie de gala emana eleganta si stil festiv.', 'g15.jpg', 'City Chic', 'Rochie de seara', 2799.99, ARRAY[40,42], '2023-12-20', 'verde smarald', ARRAY['brocart', 'matase', 'cristale'], TRUE),
('Rochie de Seara Sirena', 'O rochie seducatoare, cu croiala sirena si detaliile de dantela, pentru o aparitie senzuala si fermecatoare.', 'g32.jpg', 'Limited Edition', 'Rochie de seara', 2599.99, ARRAY[34, 38, 40], '2023-11-20', 'albastru inchis', ARRAY['matase', 'dantela', 'cristale'], TRUE),
('Rochie de Gala Cristalina', 'O rochie de seara scanteietoare, cu aplicatii de cristale si tafta, pentru o aparitie plina de stralucire si glamour.', 'g32.jpg', 'Event', 'Rochie de seara', 2999.99, ARRAY[32, 36], '2023-12-10', 'albastru electric', ARRAY['tafta', 'cristale'], TRUE),
('Rochie de Vara Colorata', 'O rochie vesela si plina de culoare, ideala pentru serile de vara.', 'g40.jpg', 'City Chic', 'Rochie mini', 879.99, ARRAY[30, 32, 34, 36, 38, 40], '2024-06-10', 'multicolor', ARRAY['vascoza'], TRUE),
('Rochie de Nunta Contemporana', 'O rochie moderna de mireasa, cu design minimalist si finisaje rafinate, pentru o nunta eleganta si contemporana.', 'g18.jpg', 'Event', 'Rochie lunga', 3799.99, ARRAY[40,42], '2023-09-20', 'alb', ARRAY['matase', 'crep', 'dantela'], TRUE),
('Rochie Boho', 'O rochie lejera si boema, potrivita pentru plimbarile pe plaja sau serile la terase.', 'g41.jpg', 'Urban Street', 'Rochie mini', 559.99, ARRAY[32, 36, 40], '2024-07-05', 'bej', ARRAY['vascoza'], TRUE),
('Rochie Business', 'O rochie eleganta si sofisticata, perfecta pentru intalnirile de afaceri si zilele la birou.', 'g43.jpg', 'Office', 'Rochie medium', 789.99, ARRAY[32, 36, 40], '2024-02-01', 'negru', ARRAY['bumbac', 'poliester'], TRUE),
('Rochie de Gala Rosie', 'O rochie de seara senzationala, cu culoare intensa si aplicatii stralucitoare, pentru o aparitie de neuitat.', 'g33.jpg', 'City Chic', 'Rochie de seara', 2899.99, ARRAY[30, 32, 34, 36, 38, 40], '2024-01-20', 'rosu', ARRAY['tafta', 'cristale', 'dantela'], TRUE),
('Rochie de Zi Breeze', 'O rochie lejera si confortabila, perfecta pentru zilele calduroase de vara.', 'g38.jpg', 'Urban Street', 'Rochie de zi', 699.99, ARRAY[32, 36, 40], '2024-05-01', 'albastru', ARRAY['bumbac'], TRUE),
('Rochie Office', 'O rochie cu croiala lejera si aspect office, perfecta pentru zilele de lucru.', 'g42.jpg', 'Office', 'Rochie medium', 969.99, ARRAY[30, 32, 34, 36, 38, 40], '2024-03-20', 'alb', ARRAY['bumbac', 'poliester'], TRUE),


CREATE USER iulia WITH ENCRYPTED PASSWORD 'iulia';
GRANT ALL PRIVILEGES ON DATABASE cti_2024 TO iulia ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iulia;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iulia;