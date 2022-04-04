// create database
CREATE DATABASE dbrencontresportives IF NOT EXISTS;

START DATABASE dbrencontresportives;
:use dbrencontresportives;

// constraints id
CREATE CONSTRAINT adress_id ON (n:Adress) ASSERT n.id IS UNIQUE
CREATE CONSTRAINT hours_id ON (n:Hours) ASSERT n.id IS UNIQUE
CREATE CONSTRAINT place_id ON (n:SportPlace) ASSERT n.id IS UNIQUE
CREATE CONSTRAINT sport_id ON (n:Sport) ASSERT n.id IS UNIQUE

// create nodes 
// replace parameters by attributes inserted
// for exemples: CREATE(WhiteHouse:Adress{id:1, longtitude:0.2, latitude:0.3, adress:123 Rue de Victoire, country:US})
CREATE (Adress_name:Adress {id: id, longtitude: long, latitude: lat, adress: adr, country: country}); 
CREATE (Hours_name:Hours {id: id, day: day, from: from, to: to}); 
CREATE (Place_name:SportPlace {id: id, picture: picture, type: type}); 
CREATE (Sport_name:Sport {id: id, name: name, nbPlayers: nbPlayers});



// create relations
MATCH (Place_name:SportPlace), (Adress_name:Adress)
WHERE Place_name.id="to_iditifiy" AND Adress_name.id="to_iditifiy"
CREATE (Place_name) -[:LOCATE]-> (Adress_name);

MATCH (Place_name:SportPlace), (Hours_name:Hours)
WHERE Place_name.id="to_iditifiy" AND Hours_name.id="to_iditifiy"
CREATE (Place_name) -[:OPEN]-> (Hours_name);

MATCH (Place_name:SportPlace), (Sport_name:Sport)
WHERE Place_name.id="to_iditifiy" AND Sport_name.id="to_iditifiy"
CREATE (Place_name) -[:HAVE]-> (Sport_name);


// update players
// add (remove) players
MATCH (Place_name) -[:HAVE]-> (Sport_name:Sport)
WHERE Place_name.id = "to_identify"
SET Sport_name.nbPlayers = Sport_name.nbPlayers + 1 // - 1 in case remove