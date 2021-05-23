class _ScoreHelper {
    _getPlayerIds (lobbyData) {
        return Object.keys(lobbyData.player);
    }

    _generateEmptyRun (playerIdList) {
        return playerIdList.reduce((newRun, playerId) => {
            newRun[playerId] = 0;
            return newRun;
        }, {});
    }

    _getScoreByPlacement (placement) {
        const scoreMap = {
            0: 10,
            1: 7,
            2: 6,
            3: 5,
            4: 4,
            5: 3,
            6: 2,
            7: 1,
        };
        const score = scoreMap[placement];
        return score || 0;
    }

    _getPlayerStatus (lobbyData, playerId) {
        return lobbyData.run[playerId].status;
    }

    collectKitty (lobbyData, playerId) {
        const data = lobbyData.scoreHelper;
        data.currentRun[playerId] += 1;
    }

    resetRun (lobbyData) {
        const data = lobbyData.scoreHelper;
        const playerIds = this._getPlayerIds(lobbyData);
        playerIds.forEach((playerId) => {
            data.allRuns[playerId] += data.currentRun[playerId];
        });
        data.currentRun = this._generateEmptyRun(playerIds);
        data.placement = 0;
    }

    calcScore (lobbyData) {
        const data = lobbyData.scoreHelper;
        const playerIds = this._getPlayerIds(lobbyData);
        data.score = playerIds.reduce((score, playerId) => {
            score[playerId] = {
                value: data.allRuns[playerId] + data.currentRun[playerId],
                text: `${data.allRuns[playerId]} + ${data.currentRun[playerId]}`,
                status: this._getPlayerStatus(lobbyData, playerId),
                playerId,
            };
            return score;
        }, {});
    }

    onInit (lobbyData) {
        lobbyData.scoreHelper = {
            currentRun: {},
            allRuns: {},
            placement: 0,
            score: {},
        };
        const data = lobbyData.scoreHelper;
        const playerIds = this._getPlayerIds(lobbyData);
        data.currentRun = this._generateEmptyRun(playerIds);
        data.allRuns = this._generateEmptyRun(playerIds);
    }

    onRunEnd (lobbyData, playerId) {
        const data = lobbyData.scoreHelper;
        const { placement } = data;
        data.placement += 1;
        data.currentRun[playerId] += this._getScoreByPlacement(placement);
    }
}
export const ScoreHelper = new _ScoreHelper();
