const os = require('os');
const SelectedGame = require('./selectedGame');
const ApiFactory = require('./apis/apiFactory');
const pcars = require('../index');

class ApiInit {
    constructor(sendEvent, listenEvent) {
        this.sendEvent = sendEvent
        this.listenEvent = listenEvent
    }

    init() {      
        
        // is a game selected ?
        if(SelectedGame.getGameId() == '')
        {
            return;
            //TODO THROW ERROR
        }
        
        // is everything working for that game config ?

        //what kind of api do I need for that game ?
        const api = ApiFactory.getApiByGame();

        // init tactplayer
        const player = new pcars.TactPlayer(
            new pcars.BHapticsTactJsAdapter(),
            api,
            this.sendEvent,
            this.listenEvent
        )      

        player.launch();
        api.initializeEffects(player);
        api?.request();        
    }
}

module.exports = ApiInit