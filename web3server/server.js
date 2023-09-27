// express
const express = require('express')
const cors = require('cors');
const app = express()
app.use(cors({
    origin: '*'
}));

// ethereumjs util
const util = require('ethereumjs-util')

// uuid
const { v4: uuidv4 } = require('uuid');

// db
const { Client } = require('pg')

/*Add routes*/
app.get('/get_nonce', getNonce)
app.get('/verify_nonce', verifyNonce)

const dbConfig = {
    host: 'localhost',
    port: 26257,
    user: 'root',
    database: 'nakama'
}


//取得新的Nonce
function getNonce(req, res, next) {
    const client = new Client(dbConfig)

    let json = { success: true };
    let address = req.query.address;

    if (address == null) {
        json.success = false;
        json.msg = 'no address.'
        res.send(json);
        return;
    } else if (!util.isValidAddress(address)) {
        json.success = false;
        json.msg = 'not valid address.'
        res.send(json);
        return;
    } else {
        let new_uuid = uuidv4();
        client
            .connect()
            .then(() => client.query(`UPSERT INTO auth_nonce (uuid, address, update_time) VALUES ('${new_uuid}','${address}', CURRENT_TIMESTAMP)`, (err, result) => {
                if (err) {
                    json.success = false;
                    json.msg = err.toString();
                    res.send(json);
                    client.end();
                } else {
                    json.success = true;
                    json.data = {
                        uuid: new_uuid,
                        address: address
                    }
                    res.send(json);
                    client.end();
                }
            }))
            .catch((err) => {
                json.success = false;
                json.msg = err.toString();
                res.send(json);
                client.end();
            })
    }
}

//驗證Nonce
function verifyNonce(req, res, next) {
    let json = { success: true }

    let address = req.query.address;
    let signed = req.query.signed;

    if (signed == null || address == null) {
        json.success = false;
        json.msg = 'empty value.'
        res.send(json);
    } else if (!util.isValidAddress(address)) {
        json.success = false;
        json.msg = 'not valid address.'
        res.send(json);
        return;
    } else {
        try {
            const client = new Client(dbConfig)
            client
                .connect()
                .then(() => client.query(`SELECT uuid FROM auth_nonce WHERE address = '${address}'`, (err, result) => {
                    if (err) {
                        json.success = false;
                        json.msg = err.toString();
                        res.send(json);
                        client.end();
                    } else {
                        if (result.rowCount == 0) {
                            json.success = false;
                            json.msg = 'No match data.';
                            res.send(json);
                        } else {
                            const nonce = result.rows[0].uuid;
                            const msg = `Click "Sign" to login, this request is only for verify login and will not trigger any transaction or cost eth.\n\nunique_nonce:{${nonce}}`;
                            const msgHex = util.bufferToHex(Buffer.from(msg));
                            const msgBuffer = util.toBuffer(msgHex);
                            const msgHash = util.hashPersonalMessage(msgBuffer);
                            const signature = util.toBuffer(signed);
                            const sigParams = util.fromRpcSig(signature);
                            const publicKey = util.ecrecover(
                                msgHash,
                                sigParams.v,
                                sigParams.r,
                                sigParams.s
                            );
                            const sender = util.publicToAddress(publicKey);
                            const addr = util.bufferToHex(sender);

                            if (addr.toLocaleLowerCase() == address.toLocaleLowerCase()) {
                                res.send(json)
                            } else {
                                json.success = false;
                                json.msg = 'invalid signed message.';
                                res.send(json);
                            }
                            
                            client.end();
                        }
                    }
                }))
                .catch((err) => {
                    json.success = false;
                    json.msg = err.toString();
                    res.send(json);
                    client.end();
                })

        } catch (err) {
            json.success = false;
            res.send(json);
        }
    }
}


app.listen(11522, '0.0.0.0', () => {
    console.log('Server running on port 11522')
});