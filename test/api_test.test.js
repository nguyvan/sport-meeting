"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const __1 = require("..");
const log_1 = __importDefault(require("../middleware/log"));
const sport_places_1 = require("../sport-places-request/sport-places");
const log = log_1.default.getLogger("test");
const { expect } = chai_1.default;
chai_1.default.use(chai_http_1.default);
var sport_place = new sport_places_1.SportPlaces();
log.info("======================= Test =========================");
log.info("______Sport meeting: option 1_____");
describe('Test NodeJS request', function () {
    it('Get sport place near me', done => {
        log.info("======================= Get Sport Place Near Me =========================");
        chai_1.default
            .request(__1.app)
            .get("/near-me")
            .query({
            long: 2.2647006924737094,
            lat: 48.73207053263509,
            sport_place_type: 'sport_complex',
            sport_type: ['football']
        })
            .end((err, res) => {
            expect(res).to.have.status(200);
            done();
        });
    });
    it('Get sport places with type sport', done => {
        log.info("======================= Get Sport Places With Type Sport =========================");
        chai_1.default
            .request(__1.app)
            .get("/filter-by-sport-type")
            .query({
            sport: ['football', 'volleyball']
        })
            .end((err, res) => {
            expect(res).to.have.status(200);
            done();
        });
    }).timeout(5000);
    it('Get sport place with ID', done => {
        log.info("======================= Get Sport Place With ID =========================");
        chai_1.default
            .request(__1.app)
            .get("/filter-by-type-and-id")
            .query({
            type: 'sport_complex',
            id: 2
        })
            .end((err, res) => {
            expect(res).to.have.status(200);
            done();
        });
    }).timeout(35000);
    it('Add new place', done => {
        log.info("======================= Add New Place =========================");
        chai_1.default
            .request(__1.app)
            .get("/add-new-place")
            .query({
            adress: "26 Grand Rue, 13115 Saint-Paul-lez-Durance",
            type: "field",
            country: "FR",
            day: ["Lundi", "Samedi"],
            from: ["9h", "10h"],
            to: ["18h", "17h"],
            type_sport: ["Natation"]
        })
            .end((err, res) => {
            expect(res).to.have.status(200);
            sport_place.deleteRecentSportPlace();
            done();
        });
    }).timeout(35000);
    it('Add new player', done => {
        log.info("======================= Add New Player =========================");
        chai_1.default
            .request(__1.app)
            .get("/add-new-player")
            .query({
            sport_id: 2
        })
            .end((err, res) => {
            expect(res).to.have.status(200);
            done();
            sport_place.deletePlayer(2);
        });
    }).timeout(35000);
    it('Delete a player', done => {
        log.info("======================= Delete A Player =========================");
        chai_1.default
            .request(__1.app)
            .get("/remove-player")
            .query({
            sport_id: 2
        })
            .end((err, res) => {
            expect(res).to.have.status(200);
            done();
            sport_place.addNewPlayer(2);
        });
    }).timeout(35000);
});
