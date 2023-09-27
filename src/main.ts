
let InitModule: nkruntime.InitModule =
function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    initializer.registerRpc('healthcheck', repHealthcheck);
    initializer.registerRpc('get_recent_online', getRecentOnline);
    initializer.registerRpc('get_race_data', getRaceData);

    // Stream Function
    initializer.registerRpc('join_stream', joinStream);
    initializer.registerRpc('leave_stream', leaveStream);
    initializer.registerRpc('client_action', clientAction);

    // Test
    initializer.registerRpc('test2', testFunc);
}