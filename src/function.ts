let repHealthcheck: nkruntime.RpcFunction = function repHealthcheck(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    return JSON.stringify({ 'success': true });
}

let getRecentOnline: nkruntime.RpcFunction = function getRecentOnline(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama): string {
    let query = 'SELECT * FROM storage ORDER BY update_time DESC';
    let rows: nkruntime.SqlQueryResult = [];

    try {
        rows = nk.sqlQuery(query, []);

        return JSON.stringify({ 'success': true, data: rows });
    } catch (error) {
        return JSON.stringify({ 'success': false, msg: error });
    }
}

let getRaceData: nkruntime.RpcFunction = function getRaceData(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama): string {
    try {
        return JSON.stringify({ 'success': true, data: raceData });
    } catch (error) {
        return JSON.stringify({ 'success': false, msg: error });
    }
}

/**
 * Stream Function
 */
const mainStreamKey: string = "main_stream";

let joinStream: nkruntime.RpcFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama) {
    let streamId: nkruntime.Stream = {
        mode: 2,
        label: mainStreamKey,
    };
    let hidden = false;
    let persistence = false;
    nk.streamUserJoin(ctx.userId, ctx.sessionId, streamId, hidden, persistence);

    //發送所有在線用戶列表給所有用戶
    return JSON.stringify({ 'success': true, data: nk.streamUserList(streamId).toString()});
}


let leaveStream: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama) {
    let streamId: nkruntime.Stream = {
            mode: 2,
            label: mainStreamKey,
    };
    nk.streamUserLeave(ctx.userId, ctx.sessionId, streamId);
}

let clientAction: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
    let streamId: nkruntime.Stream = {
        mode: 2,
        label: mainStreamKey,
    };
    nk.streamSend(streamId, payload);
}