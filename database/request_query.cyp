// request 1

MATCH (Place_name:SportPlace) -[:LOCATE]-> (Adress_name:Adress),
      (Place_name) -[:HAVE]-> (Sport_name:Sport)
WHERE toUpper(Adress_name.country) = "FR"
RETURN Adress_name.adress,
       Place_name.type,
       Sport_name.name,
       Sport_name.nbPlayers;

// request 2

MATCH (Place_name:SportPlace) -[:LOCATE]-> (Adress_name:Adress),
      (Place_name) -[:HAVE]-> (Sport_name:Sport)
WHERE toLower(Sport_name.name) IN ["football"] // replace or add more other type sport, for example ["football", "basketball"], all element must be in lowercase
RETURN Adress_name.adress
       apoc.text.join(collect(Sport_name.name), ", "),
       Place_name.type;

// request 3 & 4

MATCH (Place_name:SportPlace) -[:LOCATE]-> (Adress_name:Adress),
      (Place_name) -[:OPEN]-> (Hours_name:Hours),
      (Place_name) -[:HAVE]-> (Sport_name:Sport)
WHERE toLower(Place_name.type) = "sport_complex" AND Place_name.id = 1
RETURN Adress_name.adress AS Adress,
       Place_name.type,
       Hours_name.day + ": from " + Hours_name.from + " to " + Hours_name.to,
       Sport_name.name,
       Sport_name.nbPlayers;

// request 