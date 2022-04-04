import express from 'express';
import path from 'path';
import log4js from './middleware/log'
import {SportPlaces} from './sport-places-request/sport-places'

import {logMiddleware} from './middleware/log_middleware'

/**
 * make a log directory, just in case it isn't there.
 */
try {
    require('fs').mkdirSync(path.join(process.cwd(), "_log"));
} 
catch (e) {
    // if (e instanceof Error) {
    //     if (e.name != 'EEXIST') {
    //     log.error("Could not set up log directory, error was: ", e);
    //     process.exit(1);
    //     }
    // }
}

export const app = express();
app.use(logMiddleware);

import dotenv from 'dotenv';
import { ExecFileException, ExecOptions } from 'child_process';
dotenv.config();

var log = log4js.getLogger("index");
var sport_places_request = new SportPlaces();


app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.get('/near-me', async (req, res) => {
    let long_str = req.query.long 
    let long: number = 0.0
    let lat: number = 0.0
    if (long_str !== undefined) {
        long = +long_str
    }
    let lat_str = req.query.lat
    if (lat_str !== undefined) {
        lat = +lat_str
    }
    let sport_place_type = req.query.type;
    if (sport_place_type == undefined) {
        sport_place_type = ""
    }
    let sport_type = req.query.sport;
    let sport_types: string[] = [];
    if (sport_type != undefined) {
        if (typeof(sport_type) === 'string') {
            sport_types.push(sport_type);
        }
        else if (typeof(sport_type) === 'object'){
            sport_types = sport_type.toString().split(',');
        }
    }
    try {
        let sport_places = await sport_places_request.getSportPlacesNearMe(long, lat, sport_place_type.toString(), sport_types);   
        res.status(200);
        res.json(sport_places)
    }
    catch(e) {
        res.status(400);
        res.send("Bad request: " + e)
    }
})

app.get('/filter-by-sport-type', async (req, res) => {
    let sports = req.query.sport;
    let sport_types: string[] = [];
    if (sports == undefined) {
        res.status(400)
        res.send("Cannot find sport places without sport type. Try to find with football for ex");
    }
    else {
        if (typeof(sports) === 'string') {
            sport_types.push(sports);
        }
        else if (typeof(sports) === 'object'){
            sport_types = sports.toString().split(',');
        }
        try {
            let sport_places = await sport_places_request.getSportPlacesWithTypeSport(sport_types);
            res.status(200);
            res.json(sport_places);
        }
        catch(e) {
            res.status(400);
            res.send("Bad request: " + e)
        }
    }
    
})

app.get('/filter-by-type-and-id', async (req, res) => {
    let sport_type = req.query.type;
    let id = req.query.id;
    if (sport_type == undefined) {
        sport_type = ""
    }
    if (id == undefined) {
        id = ""
    }
    try {
        let sport_places = await sport_places_request.getSportPlaceWithID(sport_type.toString(), id.toString())
        res.status(200);
        res.json(sport_places)
    }
    catch(e) {
        res.status(400);
        res.send("Bad request. Error: " + e)
    }
})

app.get('/add-new-place', async (req, res) => {
    let adress = req.query.adress
    let type = req.query.type
    let country = req.query.country
    let day = req.query.day
    let from = req.query.from
    let to = req.query.to
    let type_sport = req.query.type_sport
    let sport_types: string[] = [];
    let days: string[] = [];
    let open_from: string[] = [];
    let closed_at: string[] = []
    if (adress == undefined || type == undefined || country == undefined || type_sport == undefined) {
        res.status(400)
        res.send("Missing information to add a new sport place")
    }
    else {
        if (typeof(type_sport) === 'string') {
            sport_types.push(type_sport);
        }
        else if (typeof(type_sport) === 'object'){
            sport_types = type_sport.toString().split(',');
        }
        if (typeof(day) === 'string') {
            days.push(day);
        }
        else if (typeof(day) === 'object') {
            days = day.toString().split(',');
        }
        if (typeof(from) === 'string') {
            open_from.push(from);
        }
        else if (typeof(from) === 'object') {
            open_from = from.toString().split(',');
        }
        if (typeof(to) === 'string') {
            closed_at.push(to);
        }
        else if (typeof(to) === 'object') {
            closed_at = to.toString().split(',');
        }
        if (type.toString() == "field" && sport_types.length > 1) {
            res.status(400)
            res.send("Field cannot have too much sport, only one sport is accepted in one field")
        }
        try {
            let response = await sport_places_request.addNewSportPlace(adress.toString(), type.toString(),
            country.toString(), days, open_from, closed_at, sport_types);
            res.status(200)
            res.send(response)
        }
        catch(e) {
            res.status(400);
            res.send("Bad request. Error: " + e)
        }
    }
})

app.get('/add-new-player', async(req,res) => {
    let sport = req.query.sport_id
    if (sport == undefined) {
        res.status(400)
        res.send("Missing information to add a new player")
    }
    else {
        try {
            let response = await sport_places_request.addNewPlayer(sport.toString());
            res.status(200)
            res.send(response)
        }
        catch(e) {
            res.status(400);
            res.send("Bad request. Error: " + e)
        }
    }
})

app.get('/remove-player', async(req,res) => {
    let sport = req.query.sport_id
    if (sport == undefined) {
        res.status(400)
        res.send("Missing information to add a new player")
    }
    else {
        try {
            let response = await sport_places_request.deletePlayer(sport.toString());
            res.status(200)
            res.send(response)
        }
        catch(e) {
            res.status(400);
            res.send("Bad request. Error: " + e)
        }
    }
})

app.listen(process.env.PORT, () => {
  log.info(`⚡️[server]: Server is running at http://localhost:${process.env.PORT}`);
});