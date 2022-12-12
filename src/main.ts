let InitModule: nkruntime.InitModule =
    function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
        initializer.registerRpc('healthcheck', repHealthcheck);
        initializer.registerRpc('getAllStorage', getAllStorage);
    }