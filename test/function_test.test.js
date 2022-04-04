"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __importDefault(require("../middleware/log"));
const chai_1 = __importDefault(require("chai"));
const sport_places_1 = require("../sport-places-request/sport-places");
const log = log_1.default.getLogger("test");
const { expect } = chai_1.default;
require('dotenv').config();
let sport_place = new sport_places_1.SportPlaces();
describe("TEST ALL QUERIES", function () {
    it('Get sport place near by', function () {
        return new Promise(async function (resolve, reject) {
            log.info("======================= Get sport place near by =========================");
            var params = {
                long: 2.2647006924737094,
                lat: 48.73207053263509,
                sport_place_type: "sport_complex",
                sport_type: ["football"]
            };
            let expected_response = [{
                    "id": 1,
                    "adress": "2 Résidence de la Bergerie, 91300 Massy",
                    "type": "sport_complex",
                    "sports": [{ "name": "Football", "nbPlayers": 50 }]
                }];
            try {
                var return_value = await sport_place.getSportPlacesNearMe(params.long, params.lat, params.sport_place_type, params.sport_type);
                log.info("Response returned: " + JSON.stringify(return_value));
                expect(return_value == JSON.stringify(expected_response));
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    });
    it('Get sport places with type sport', function () {
        return new Promise(async function (resolve, reject) {
            log.info("======================= Get sport places with type sport =========================");
            var params = {
                type_sport: ["basketball", "football"]
            };
            try {
                var return_value = await sport_place.getSportPlacesWithTypeSport(params.type_sport);
                log.info("Response returned: " + return_value);
                let expected_response = [
                    {
                        "id": 1,
                        "adress": "2 Résidence de la Bergerie, 91300 Massy",
                        "type": "sport_complex",
                        "sports": [{ "name": "Football", "nbPlayers": 50 }]
                    },
                    {
                        "id": 2,
                        "adress": "7 Bd Gaspard Monge, 91120 Palaiseau",
                        "type": "sport_complex",
                        "sports": [{ "name": "Basketball", "nbPlayers": 20 }]
                    },
                    {
                        "id": 3,
                        "adress": "Rte de Saclay, 91120 Palaiseau",
                        "type": "field",
                        "sports": [{ "name": "Basketball", "nbPlayers": 60 }]
                    }
                ];
                expect(return_value == expected_response);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    });
    it('Get sport places with id', function () {
        return new Promise(async function (resolve, reject) {
            log.info("======================= Get sport places with id =========================");
            var params = {
                type_sport_place: "sport_complex",
                id: "2"
            };
            try {
                var return_value = await sport_place.getSportPlaceWithID(params.type_sport_place, params.id);
                log.info("Response returned: " + return_value);
                let expected_response = [
                    {
                        "adress":"7 Bd Gaspard Monge, 91120 Palaiseau",
                        "type":"sport_complex",
                        "openHours":[
                            {
                                "day": "Mercredi",
                                "from": "10h",
                                "to": "17h"
                            },
                            {
                                "day": "Mardi",
                                "from": "11h",
                                "to": "20h"
                            }
                        ],
                        "sports":[
                            {
                                "id": 3,
                                "name": "Basketball",
                                "nbPlayers": 20
                            },
                            {
                                "id": 2,
                                "name": "Volleyball",
                                "nbPlayers": 30
                            }
                        ]
                    }
                ];
                expect(return_value == expected_response);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    });
    it('Add new sport place', function () {
        return new Promise(async function (resolve, reject) {
            log.info("======================= Add new sport place =========================");
            var params = {
                adress: "26 Grand Rue, 13115 Saint-Paul-lez-Durance",
                type: "field",
                country: "FR",
                day: ["Lundi", "Samedi"],
                from: ["9h", "10h"],
                to: ["18h", "17h"],
                type_sport: ["Natation"]
            };
            try {
                var return_value = await sport_place.addNewSportPlace(params.adress, params.type, params.country, params.day, params.from, params.to, params.type_sport);
                log.info("Response returned: " + return_value);
                let expected_response = "Adding new sport place sucessfully";
                expect(return_value == expected_response);
                try {
                    let response = await sport_place.deleteRecentSportPlace();
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    });
    it('Add new player', () => {
        return new Promise(async function (resolve, reject) {
            log.info("======================= Add new player =========================");
            var params = {
                sports_id: 2
            };
            try {
                var return_value = await sport_place.addNewPlayer(params.sports_id);
                log.info("Response returned: " + return_value);
                let expected_response = "A new player is added sucessfully to field";
                expect(return_value == expected_response);
                try {
                    let response = await sport_place.deletePlayer(params.sports_id);
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    });
    it('Remove a player', () => {
        return new Promise(async function (resolve, reject) {
            log.info("======================= Remove a player =========================");
            var params = {
                sports_id: 2
            };
            try {
                var return_value = await sport_place.deletePlayer(params.sports_id);
                log.info("Response returned: " + return_value);
                let expected_response = "A new player is added sucessfully to field";
                expect(return_value == expected_response);
                try {
                    let response = await sport_place.addNewPlayer(params.sports_id);
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    });
});
