"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportPlaces = void 0;
const log_1 = __importDefault(require("../middleware/log"));
var log = log_1.default.getLogger("sport-places");
var neo4j = require('neo4j-driver');
var fetch = require('node-fetch');
class SportPlaces {
    constructor() {
        this.driver = neo4j.driver(process.env.DB_URL, neo4j.auth.basic(process.env.DB_USR, process.env.DB_PWD));
    }
    async retrieve_data_neo4j(query) {
        const session = this.driver.session({ database: process.env.DB_NAME });
        try {
            const result = await session.run(query);
            const records = result.records;
            return records;
        }
        catch (e) {
            log.error("Error from retrieving Neo4J data: " + e);
        }
        finally {
            await session.close();
        }
    }
    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
        var dLon = this.deg2rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    async getSportPlacesNearMe(long, lat, sport_place_type, sport_type) {
        let url = "http://api.geonames.org/countryCodeJSON?lat=" + lat + "&lng=" + long + "&username=phamnuhu";
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        });
        try {
            const body = await response.json();
            if (response.ok) {
                log.debug("Get current country response: " + JSON.stringify(response.status));
            }
            response.parsedBody = JSON.stringify(body);
        }
        catch (e) {
            log.error("Error from getting current country: " + e);
        }
        if (!response.ok) {
            log.error("Get current country response: " + JSON.stringify(response.status) + " - " + response.statusText);
            return Promise.reject(response.status + " - " + response.statusText);
        }
        let data = JSON.parse(response.parsedBody);
        let country = data.countryCode;
        let query = "MATCH (Place_name:SportPlace) -[:LOCATE]-> (Adress_name:Adress), (Place_name) -[:HAVE]-> (Sport_name:Sport) ";
        query += 'WHERE toUpper(Adress_name.country) = "' + country + '" ';
        if (sport_place_type != "") {
            query += 'AND toLower(Place_name.type) = "' + sport_place_type + '" ';
        }
        if (sport_type.length != 0) {
            let sport = "[" + sport_type.map(x => "\"" + x + "\"").join(", ") + "]";
            query += 'AND toLower(Sport_name.name) IN ' + sport + ' ';
        }
        
        let ask_has_name_query = query
        ask_has_name_query += "RETURN exists(Place_name.name) AS has_name;"
        try {
            let db_data = await this.retrieve_data_neo4j(ask_has_name_query);
            let has_name = db_data[0].get("has_name");
            query += "RETURN Adress_name.longtitude, Adress_name.latitude, ";
            if (has_name) {
                query += "Place_name.id, Adress_name.adress, Place_name.type, Place_name.name, Sport_name.name, Sport_name.nbPlayers;";
            }
            else {
                query += "Place_name.id, Adress_name.adress, Place_name.type, Sport_name.name, Sport_name.nbPlayers;";
            }

            try {
                let db_data = await this.retrieve_data_neo4j(query);
                let sport_places = [];
                for (let i = 0; i < db_data.length; i++) {
                    let lon = db_data[i].get("Adress_name.longtitude");
                    let latitude = db_data[i].get("Adress_name.latitude");
                    let distance = this.getDistanceFromLatLonInKm(lon, latitude, long, lat);
                    if (distance <= 5) {
                        let sport_place = {
                            id: db_data[i].get("Place_name.id").low,
                            adress: db_data[i].get("Adress_name.adress"),
                            latitude: db_data[i].get("Adress_name.latitude"),
                            longitude: db_data[i].get("Adress_name.longtitude"),
                            type: db_data[i].get("Place_name.type"),
                            sports: [
                                {
                                    name: db_data[i].get("Sport_name.name"),
                                    nbPlayers: db_data[i].get("Sport_name.nbPlayers").low
                                }
                            ]
                        };
                        if (db_data[0].has("Place_name.name")) {
                            sport_place.name = db_data[i].get("Place_name.name")
                        }
                        let place = sport_places.find(({ id }) => id == sport_place.id);
                        if (place != undefined) {
                            place.sports.push({
                                name: sport_place.sports[0].name,
                                nbPlayers: sport_place.sports[0].nbPlayers
                            });
                        }
                        else {
                            sport_places.push(sport_place);
                        }
                    }
                }
                return Promise.resolve(sport_places);
            }
            catch (e) {
                return Promise.reject("Error in getting sport places near me: " + e);
            }
        }
        catch (e) {
            return Promise.reject("Error in getting sport places near me: " + e);
        }
    }
    async getSportPlacesWithTypeSport(type_sport) {
        let sport = "[" + type_sport.map(x => "\"" + x + "\"").join(", ") + "]";
        let query = "MATCH (Place_name:SportPlace) -[:LOCATE]-> (Adress_name:Adress), (Place_name) -[:HAVE]-> (Sport_name:Sport) ";
        query += "WHERE toLower(Sport_name.name) IN " + sport;
        let ask_has_name_query = query;
        ask_has_name_query += " RETURN exists(Place_name.name) AS has_name;"
        try {
            let db_data = await this.retrieve_data_neo4j(ask_has_name_query);
            let has_name = db_data[0].get("has_name");
            if (has_name) {
                query += " RETURN Place_name.id, Place_name.name, Adress_name.adress, Adress_name.latitude, Adress_name.longtitude, Sport_name.name, Place_name.type, Sport_name.nbPlayers;";
            }
            else {
                query += " RETURN Place_name.id, Adress_name.adress, Adress_name.latitude, Adress_name.longtitude, Sport_name.name, Place_name.type, Sport_name.nbPlayers;";
            }

            try {
                let db_data = await this.retrieve_data_neo4j(query);
                let sport_places = [];
                for (let i = 0; i < db_data.length; i++) {
                    let sport_place = {
                        id: db_data[i].get("Place_name.id").low,
                        adress: db_data[i].get("Adress_name.adress"),
                        latitude: db_data[i].get("Adress_name.latitude"),
                        longitude: db_data[i].get("Adress_name.longtitude"),
                        type: db_data[i].get("Place_name.type"),
                        sports: [
                            {
                                name: db_data[i].get("Sport_name.name"),
                                nbPlayers: db_data[i].get("Sport_name.nbPlayers").low
                            }
                        ]
                    };
                    if (db_data[0].has("Place_name.name")) {
                        sport_place.name = db_data[i].get("Place_name.name")
                    }
                    const place = sport_places.find(({ id }) => id == sport_place.id);
                    if (place != undefined) {
                        place.sports.push({
                            name: sport_place.sports[0].name,
                            nbPlayers: sport_place.sports[0].nbPlayers
                        });
                    }
                    else {
                        sport_places.push(sport_place);
                    }
                }
                return Promise.resolve(sport_places);
            }
            catch (e) {
                return Promise.reject("Error in getting sport places with type sport: " + e);
            }
        }
        catch (e) {
            return Promise.reject("Error in getting sport places with type sport: " + e);
        }
    }
    // TODO: Fix Neo4J query (concerning hours and sports - multiple nodes)
    async getSportPlaceWithID(type_sport_place, id) {
        let sport_place_type = '"' + type_sport_place + '"';
        let return_part_query = "";
        let query = "MATCH (Place_name:SportPlace)";
        query += " WHERE toLower(Place_name.type) = " + sport_place_type;
        query += " AND Place_name.id = " + id;
        query += " RETURN exists(Place_name.name) AS has_name, exists((Place_name)-[:OPEN]->()) AS has_open_hours; "
        try {
            let db_data = await this.retrieve_data_neo4j(query);
            let has_open_hours = db_data[0].get("has_open_hours");
            let has_name = db_data[0].get("has_name");
            if (has_name) {
                return_part_query = " RETURN Adress_name.adress AS Adress, Adress_name.longtitude as Longtitude, Adress_name.latitude as Lattitude, Place_name.type AS Type, Place_name.name as Name,";
            }
            else {
                return_part_query = " RETURN Adress_name.adress AS Adress, Adress_name.longtitude as Longtitude, Adress_name.latitude as Lattitude, Place_name.type AS Type,";
            }
            if (has_open_hours) {
                query = "MATCH (Place_name:SportPlace) -[:LOCATE]-> (Adress_name:Adress), (Place_name) -[:OPEN]-> (Hours_name:Hours), (Place_name) -[:HAVE]-> (Sport_name:Sport)";
                query += " WHERE toLower(Place_name.type) = " + sport_place_type;
                query += " AND Place_name.id = " + id;
                query += return_part_query
                query += ' collect(DISTINCT Hours_name.day + ": from " + Hours_name.from + " to " + Hours_name.to) AS Open_hour,';
                query += ' collect(DISTINCT Sport_name.id + ": " + Sport_name.name + ": " + apoc.convert.toString(Sport_name.nbPlayers)) AS Sports;'
            }
            else {
                query = "MATCH (Place_name:SportPlace) -[:LOCATE]-> (Adress_name:Adress), (Place_name) -[:HAVE]-> (Sport_name:Sport)";
                query += " WHERE toLower(Place_name.type) = " + sport_place_type;
                query += " AND Place_name.id = " + id;
                query += return_part_query
                query += ' collect(DISTINCT Sport_name.id + ": " + Sport_name.name + ": " + apoc.convert.toString(Sport_name.nbPlayers)) AS Sports;'
            }
            try {
                db_data = await this.retrieve_data_neo4j(query);
                let sport_places = []
                let opening = []
                let sports_info = []
                if (db_data[0].has("Open_hour")) {
                    let open_hours = db_data[0].get("Open_hour")
                    for (let open_hour of open_hours) {
                        let splited_str = open_hour.split(/: |from | to /)
                        splited_str.splice(1,1)
                        opening.push({
                            day: splited_str[0],
                            from: splited_str[1],
                            to: splited_str[2]
                        })
                    }
                }
                let infos_sport = db_data[0].get("Sports")
                for (let info_sport of infos_sport) {
                    let str_splited = info_sport.split(": ")
                    sports_info.push({
                        id: parseInt(str_splited[0]),
                        name: str_splited[1],
                        nbPlayers: str_splited[2]
                    })
                }
                let sport_place = {
                    id: id,
                    adress: db_data[0].get("Adress"),
                    longtitude: db_data[0].get("Longtitude"),
                    lattitude: db_data[0].get("Lattitude"),
                    type: db_data[0].get("Type"),
                    openHours: opening,
                    sports: sports_info
                }
                if (db_data[0].has("Name")) {
                    sport_place.name = db_data[0].get("Name")
                }
                sport_places.push(sport_place)
                return Promise.resolve(sport_places)
            }
            catch (e) {
                return Promise.reject("Error in getting sport places with ID: " + e);
            }
        }
        catch (e) {
            return Promise.reject("Error in getting sport places with ID: " + e);
        }
    }
    async addNewSportPlace(adress, type, country, name, day, from, to, type_sport) {
        let open_hours_id = [];
        let sport_place_id = "";
        let adress_id = "";
        let sport_fields_id = [];
        let url = "http://api.positionstack.com/v1/forward?access_key=" + process.env.GEO_ACCESS_KEY + "&query=" + adress;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        });
        try {
            const body = await response.json();
            if (response.ok) {
                log.debug("Get longtitude and latitude response: " + JSON.stringify(response.status));
            }
            response.parsedBody = JSON.stringify(body);
        }
        catch (e) {
            log.error("Error from getting current country: " + e);
        }
        if (!response.ok) {
            log.error("Get current country response: " + JSON.stringify(response.status) + " - " + response.statusText);
            return Promise.reject(response.status + " - " + response.statusText);
        }
        let resp_body = JSON.parse(response.parsedBody);
        let lat = resp_body.data[0].latitude;
        let long = resp_body.data[0].longitude;
        let query = "MATCH (a:Adress) WITH a ORDER BY a.id DESC LIMIT 1 ";
        query += "CREATE (n:Adress {id: a.id+1, longtitude: " + long + ", latitude: " + lat + ', adress: "';
        query += adress + '", country: "' + country + '"}) RETURN n.id;';
        try {
            let new_adress = await this.retrieve_data_neo4j(query);
            adress_id = new_adress[0].get("n.id");
        }
        catch (e) {
            return Promise.reject("Error in adding new adress for sport place: " + e);
        }
        for (let i = 0; i < day.length; i++) {
            query = "MATCH (a:Hours) WITH a ORDER BY a.id DESC LIMIT 1 ";
            query += 'CREATE (n:Hours {id: a.id+1, day: "' + day[i] + '", from: "' + from[i] + '", to: "';
            query += to[i] + '"}) RETURN n.id;';
            try {
                let new_open_hours = await this.retrieve_data_neo4j(query);
                open_hours_id.push(new_open_hours[0].get("n.id"));
            }
            catch (e) {
                return Promise.reject("Error in adding new adress for sport place: " + e);
            }
        }
        if (name != "") {
            query = "MATCH (a:SportPlace) WITH a ORDER BY a.id DESC LIMIT 1 ";
            query += 'CREATE (n:SportPlace {id: a.id+1, picture: "invalid", type: "';
            query += type + '", name: "' + name +  '"}) RETURN n.id;';
        }
        else {
            query = "MATCH (a:SportPlace) WITH a ORDER BY a.id DESC LIMIT 1 ";
            query += 'CREATE (n:SportPlace {id: a.id+1, picture: "invalid", type: "';
            query += type + '"}) RETURN n.id;';
        } 
        try {
            let new_sport_place = await this.retrieve_data_neo4j(query);
            sport_place_id = new_sport_place[0].get("n.id");
        }
        catch (e) {
            return Promise.reject("Error in adding new sport place: " + e);
        }
        for (let sp of type_sport) {
            query = "MATCH (a:Sport) WITH a ORDER BY a.id DESC LIMIT 1 ";
            query += 'CREATE (n:Sport {id: a.id+1, name: "' + sp;
            query += '", nbPlayers: 0}) RETURN n.id;';
            try {
                let new_sport = await this.retrieve_data_neo4j(query);
                sport_fields_id.push(new_sport[0].get("n.id"));
            }
            catch (e) {
                return Promise.reject("Error in adding new sport place: " + e);
            }
        }
        query = "MATCH (Place1:SportPlace), (Adress1:Adress) ";
        query += "WHERE Place1.id=" + sport_place_id + " AND Adress1.id=" + adress_id + " CREATE (Place1) -[:LOCATE]-> (Adress1);";
        try {
            let process_query = await this.retrieve_data_neo4j(query);
        }
        catch (e) {
            return Promise.reject("Error in creating relationship for adress and sport place: " + e);
        }
        for (let i = 0; i < open_hours_id.length; i++) {
            query = "MATCH (Place1:SportPlace), (Hours1:Hours) ";
            query += "WHERE Place1.id=" + sport_place_id + " AND Hours1.id=" + open_hours_id[i];
            query += " CREATE (Place1) -[:OPEN]-> (Hours1);";
            try {
                let process_query = await this.retrieve_data_neo4j(query);
            }
            catch (e) {
                return Promise.reject("Error in creating relationship for opening hours and sport place: " + e);
            }
        }
        for (let i = 0; i < sport_fields_id.length; i++) {
            query = "MATCH (Place1:SportPlace), (Sport1:Sport) ";
            query += "WHERE Place1.id=" + sport_place_id + " AND Sport1.id=" + sport_fields_id[i];
            query += " CREATE (Place1) -[:HAVE]-> (Sport1);";
            try {
                let process_query = await this.retrieve_data_neo4j(query);
            }
            catch (e) {
                return Promise.reject("Error in creating relationship for sport fields and sport place: " + e);
            }
        }
        return Promise.resolve("Adding new sport place sucessfully");
    }
    async addNewPlayer(sport) {
        let query = "MATCH (Place_name:SportPlace) -[:HAVE]-> (Sport_name:Sport), (Place_name) -[:LOCATE]-> (Adress_name:Adress)";
        query += "WHERE Sport_name.id = " + sport;
        query += " SET Sport_name.nbPlayers = Sport_name.nbPlayers + 1;";
        try {
            let db_data = await this.retrieve_data_neo4j(query);
            return "A new player is added sucessfully to field";
        }
        catch (e) {
            return Promise.reject("Error in adding new player to a field: " + e);
        }
    }
    async deletePlayer(sport) {
        let query = "MATCH (Place_name:SportPlace) -[:HAVE]-> (Sport_name:Sport), (Place_name) -[:LOCATE]-> (Adress_name:Adress)";
        query += "WHERE Sport_name.id = " + sport;
        query += " SET Sport_name.nbPlayers = Sport_name.nbPlayers - 1;";
        try {
            let db_data = await this.retrieve_data_neo4j(query);
            return Promise.resolve("A new player is removed sucessfully to field");
        }
        catch (e) {
            return Promise.reject("Error in removing a player to a field: " + e);
        }
    }
    /* For test using */
    async deleteRecentSportPlace() {
        let query = "MATCH (a:SportPlace) WITH a ORDER BY a.id DESC LIMIT 1 return a.id;";
        let sport_place_id = "";
        try {
            let process_query = await this.retrieve_data_neo4j(query);
            sport_place_id = process_query[0].get("a.id");
        }
        catch (e) {
            return Promise.reject("Error in getting most recent added sport place: " + e);
        }
        query = "match(n:SportPlace)-[r:HAVE]->(m:Sport) where n.id = " + sport_place_id + " delete m, r;";
        try {
            let process_query = await this.retrieve_data_neo4j(query);
        }
        catch (e) {
            return Promise.reject("Error in deleting sports and all relationships: " + e);
        }
        query = "match(n:SportPlace)-[r:OPEN]->(m:Hours) where n.id = " + sport_place_id + " delete m, r;";
        try {
            let process_query = await this.retrieve_data_neo4j(query);
        }
        catch (e) {
            return Promise.reject("Error in deleting opening hours and all relationships: " + e);
        }
        query = "match(n:SportPlace)-[r:LOCATE]->(m:Adress) where n.id = " + sport_place_id + " delete n, m, r;";
        try {
            let process_query = await this.retrieve_data_neo4j(query);
            return Promise.resolve("Recent added sport place has been deleted");
        }
        catch (e) {
            return Promise.reject("Error in deleting adress, sport place and all relationships: " + e);
        }
    }
}
exports.SportPlaces = SportPlaces;
