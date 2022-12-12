function repHealthcheck(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('healthcheck rpc called');
    return JSON.stringify({ 'success': true });
}
    
function getAllStorage(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama): string {
    let query = 'SELECT * FROM storage ORDER BY update_time DESC';
    let rows: nkruntime.SqlQueryResult = [];

    try {
        rows = nk.sqlQuery(query, []);

        return JSON.stringify({ 'success': true, data: rows });
    } catch (error) {
        return JSON.stringify({ 'success': false, msg: error });
    }
}