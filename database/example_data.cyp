// create database
CREATE DATABASE dbrencontresportives IF NOT EXISTS;

START DATABASE dbrencontresportives;
:use dbrencontresportives;

// constraints id
CREATE CONSTRAINT adress_id ON (n:Adress) ASSERT n.id IS UNIQUE;
CREATE CONSTRAINT hours_id ON (n:Hours) ASSERT n.id IS UNIQUE;
CREATE CONSTRAINT place_id ON (n:SportPlace) ASSERT n.id IS UNIQUE;
CREATE CONSTRAINT sport_id ON (n:Sport) ASSERT n.id IS UNIQUE;

// // create index
// CREATE INDEX FOR (n:Adress) ON (n.id);
// CREATE INDEX FOR (n:Hours) ON (n.id);
// CREATE INDEX FOR (n:SportPlace) ON (n.id);
// CREATE INDEX FOR (n:Sport) ON (n.id);

// create nodes 
// replace parameters by attributes inserted
// for exemples: CREATE(WhiteHouse:Adress{id:1, longtitude:0.2, latitude:0.3, adress:123 Rue de Victoire, country:US})
CREATE (Adress1:Adress {id: 1, 
					    latitude: 48.73202908430776, 
						longtitude: 2.264683780536845,
 						adress: "2 Résidence de la Bergerie, 91300 Massy", 
                        country: "FR"}); 
                        
CREATE (Adress2:Adress {id: 2, 
					    latitude: 48.716042776513135, 
						longtitude: 2.197122153548982,
 						adress: "7 Bd Gaspard Monge, 91120 Palaiseau", 
                        country: "FR"}); 
     
CREATE (Adress3:Adress {id: 3, 
					    latitude: 48.71436786960792, 
						longtitude: 2.2112916977262205,
 						adress: "Rte de Saclay, 91120 Palaiseau", 
                        country: "FR"});
                        
CREATE (Hours1:Hours {id: 1, 
					  day: "Lundi", 
                      from: "16h30", 
                      to: "19h"}); 
                      
CREATE (Hours2:Hours {id: 2, 
					  day: "Mardi", 
                      from: "11h", 
                      to: "20h"}); 
                      
CREATE (Hours3:Hours {id: 3, 
					  day: "Samedi", 
                      from: "10h", 
                      to: "18h"}); 

CREATE (Hours4:Hours {id: 4, 
					  day: "Mercredi", 
                      from: "10h", 
                      to: "17h"}); 
                      
CREATE (Place1:SportPlace {id: 1, 
						   picture: "invalid", 
                           type: "sport_complex"}); 
                           
CREATE (Place2:SportPlace {id: 2, 
						   picture: "invalid", 
                           type: "sport_complex"});
       
CREATE (Place3:SportPlace {id: 3, 
						   picture: "invalid", 
                           type: "field"});
                           
CREATE (Sport1:Sport {id: 1, 
					  name: "Football", 
                      nbPlayers: 50});
                      
CREATE (Sport2:Sport {id: 2, 
					  name: "Volleyball", 
                      nbPlayers: 30});

CREATE (Sport3:Sport {id: 3, 
					  name: "Basketball", 
                      nbPlayers: 20});
                      
CREATE (Sport4:Sport {id: 4, 
					  name: "Basketball", 
                      nbPlayers: 60});


// create relations
MATCH (Place1:SportPlace), (Adress1:Adress)
WHERE Place1.id=1 AND Adress1.id=1
CREATE (Place1) -[:LOCATE]-> (Adress1);

MATCH (Place2:SportPlace), (Adress2:Adress)
WHERE Place2.id=2 AND Adress2.id=2
CREATE (Place2) -[:LOCATE]-> (Adress2);

MATCH (Place3:SportPlace), (Adress3:Adress)
WHERE Place3.id=3 AND Adress3.id=3
CREATE (Place3) -[:LOCATE]-> (Adress3);

MATCH (Place1:SportPlace), (Hours1:Hours)
WHERE Place1.id=1 AND Hours1.id=1
CREATE (Place1) -[:OPEN]-> (Hours1);

MATCH (Place2:SportPlace), (Hours2:Hours)
WHERE Place2.id=2 AND Hours2.id=2
CREATE (Place2) -[:OPEN]-> (Hours2);

MATCH (Place2:SportPlace), (Hours4:Hours)
WHERE Place2.id=2 AND Hours4.id=4
CREATE (Place2) -[:OPEN]-> (Hours4);

MATCH (Place3:SportPlace), (Hours3:Hours)
WHERE Place3.id=3 AND Hours3.id=3
CREATE (Place3) -[:OPEN]-> (Hours3);

MATCH (Place1:SportPlace), (Sport1:Sport)
WHERE Place1.id=1 AND Sport1.id=1
CREATE (Place1) -[:HAVE]-> (Sport1);

MATCH (Place2:SportPlace), (Sport2:Sport)
WHERE Place2.id=2 AND Sport2.id=2
CREATE (Place2) -[:HAVE]-> (Sport2);

MATCH (Place2:SportPlace), (Sport3:Sport)
WHERE Place2.id=2 AND Sport3.id=3
CREATE (Place2) -[:HAVE]-> (Sport3);

MATCH (Place3:SportPlace), (Sport4:Sport)
WHERE Place3.id=3 AND Sport4.id=4
CREATE(Place3) -[:HAVE]-> (Sport4);