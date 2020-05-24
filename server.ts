import { createSecureServer } from 'http2';
import { createServer } from 'https';
import { route, parseArguments } from './ts-scripts/utils';
import * as fs from 'fs';
import { serialize, parse as parserCookie } from 'cookie';
import { compile } from 'handlebars';
import { parse } from 'url';
import { TBuild, TConnection, TPlatform } from './ts-scripts/interface';
import { readFile } from 'fs-extra';
import { join } from 'path';
import * as dbMysql from './dbMysql';
    
import * as qs from 'querystring';
import * as opn from 'opn';
import * as bcrypt from 'bcrypt';

const ip = require('my-local-ip')();
const html = fs.readFileSync('index.html');
const http = require('http');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const async = require('async');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
// var db = require('./db');

const connectionTypes: Array<TConnection> = ['mainnet', 'testnet'];
const buildTypes: Array<TBuild> = ['dev', 'normal', 'min'];
const privateKey = fs.readFileSync('privatekey.pem').toString();
const certificate = fs.readFileSync('server.crt').toString();

var redirected = false;    

var app = express();

// app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/views/login.html"));
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));


const handler = function (req, res) {

    const url = parse(req.url);   
    var parsed = {platform: "web", connection: "mainnet", build: "normal"} as IRequestData;
    if (url.href.includes('/choose/')) {
        const [platform, connection, build] = url.href.replace('/choose/', '').split('/');
        const cookie = serialize('session', `${platform},${connection},${build}`, {
            maxAge: 60 * 60 * 24,
            path: '/'
        });
        res.setHeader('Set-Cookie', cookie);
        res.statusCode = 302;
        res.setHeader('Location', req.headers.referer);
        res.end();
        route(parsed.connection, parsed.build, parsed.platform)(req, res)
        return null;
    } 

    if (req.url.includes('/package.json')) {
        res.end(fs.readFileSync(join(__dirname, 'package.json')));
        return null;
    }

    // var parsed = parseCookie(req.headers.cookie);    
    var parsed = {} as IRequestData;
    if (!parsed) {
        readFile(join(__dirname, 'chooseBuild.hbs'), 'utf8').then((file) => {
            res.end(compile(file)({ links: getBuildsLinks(req.headers['user-agent']) }));
        });
    } else {
        parsed = {platform: "web", connection: "mainnet", build: "normal"};
        route(parsed.connection, parsed.build, parsed.platform)(req, res);
    }
};

// var con = mysql.createConnection({
//     host     : 'aaz150gr01un72.clasgm1ienc0.us-east-2.rds.amazonaws.com',
//     user     : 'root',
//     password : 'uxsgwallet',
//     port     : '3306'
// });

// app.get('/login', function(req,res){    
//     console.log('Login Page...');
//     res.sendFile(__dirname + "/views/login.html");
// });

// app.post('/login', 
//   passport.authenticate('local', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/');
//   });

var preAction = function(req, res, next) {
    next();
};

app.post('/api/userlogin', preAction, async function(req, res) {
    var user = req.body.user;
    var pwd = req.body.pwd;
    var json_data = {
        "status":'ok',
        "result":'Success!',
        "data": {}
    };

    try {
        var userdata = await dbMysql.get_user(user);
        if (userdata != null) {
            if(bcrypt.compareSync(pwd, userdata.pwd)) {
                json_data['status'] = 'ok';
                
                let db_session = await dbMysql.add_session(Date(), userdata.id);
                json_data['data'] = {session_id: db_session.id};
            } else {
                json_data['status'] = 'fail';
                json_data['result'] = 'Password mismatch!';
            }
        }
        else {
            json_data['status'] = 'fail';
            json_data['result'] = 'User not exist!';
        }
    } catch(e) {
        console.log(e);
        json_data['status'] = 'fail';
        json_data['result'] = 'Processing Error!';
    }

    res.send(json_data);
});

app.post('/api/userlogout', preAction, async function(req, res) {
    var session_id = req.body.token;
    var json_data = {
        "status":'ok',
        "result":'Success!'
    };

    try {
        var session = await dbMysql.get_session(session_id);
        if (session != null) {
            await dbMysql.delete_session(session.id);
        }
        else {
            json_data['status'] = 'fail';
            json_data['result'] = 'User already logout!';
        }
    } catch(e) {
        console.log(e);
        json_data['status'] = 'fail';
        json_data['result'] = 'Processing Error!';
    }

    res.send(json_data);
});

app.post('/api/userverify', preAction, async function(req, res) {
    var session_id = req.body.token;
    var json_data = {
        "status":'ok',
        "result":'Success!'
    };

    try {
        var session = await dbMysql.get_session(session_id);
        if (session == null) {
            json_data['status'] = 'fail';
            json_data['result'] = 'User need to Login!';
        }
    } catch(e) {
        console.log(e);
        json_data['status'] = 'fail';
        json_data['result'] = 'Processing Error!';
    }

    res.send(json_data);
});

app.post('/api/registeruser', preAction, async function(req, res) {
    var user = req.body.user;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var pwd = req.body.pwd;
    var json_data = {
        "status":'ok',
        "result":'Success!',
        "data": {}
    };

    try {
        var userdata = await dbMysql.get_user(user);
        if (userdata != null) {
            json_data['status'] = 'fail';
            json_data['result'] = 'User already exist!';
        }
        else  {
            let hash = bcrypt.hashSync(pwd, 3);
            let db_user = await dbMysql.register_user(user, fname, lname, email, hash);
            let db_session = await dbMysql.add_session(Date(), db_user.id);
            json_data['data'] = {session_id: db_session.id};
        }
    } catch(e) {
        console.log(e);
        json_data['status'] = 'fail';
        json_data['result'] = 'Processing Error!';
    }

    res.send(json_data);
});

app.all('/*', function(req, res){
    
  console.log('request');
    let index = 0;
    function next() {
        index++;
        if (handlers[index - 1]) {
            handlers[index - 1](req, res, next);
        }
    }
    next();
});

app.listen(8081, () => console.log('example app'));

function getBuildsLinks(userAgent: string = ''): Array<{ url: string; text: string }> {
    const result = [];
    const platform: TPlatform = userAgent.includes('Electron') ? 'desktop' : 'web';

    connectionTypes.forEach((connection) => {
        buildTypes.forEach((build) => {
            result.push({
                url: `/choose/${platform}/${connection}/${build}`,
                text: `${platform} ${connection} ${build}`
            });
        });
    });

    return result;
}

function parseCookie(header = ''): IRequestData {
    var [platform, connection, build] = ((parserCookie(header) || Object.create(null)).session || '').split(',');
    if (!(build && connection && platform)) {
        return null;
    }
    return { platform, connection, build } as IRequestData;
}

const handlers = [
    coinomat,
    wavesClientConfig,
    handler as any
];

function wavesClientConfig(req, res, next) {
    if (!req.url.includes('waves-client-config')) {
        next();
        return null;
    }
    let response_json = { error: 'oops' };

    const path = join(__dirname, 'mocks/waves-client-config/master/config.json');
    if (fs.existsSync(path)) {
        response_json = JSON.parse(fs.readFileSync(path, 'utf8')) || '';
    }

    const cType = 'text/html; charset=utf-8;';
    res.setHeader('Content-Type', cType);
    res.end(JSON.stringify(response_json));
    return false;
}

function coinomat(req, res, next): boolean {
    const url = parse(req.url) as any;
    if (!url.href.includes('/coinomat/')) {
        next();
        return null;
    }
    let response_json = { error: 'oops' };
    const path = url.pathname.split('/').pop();
    const filename = `./mocks/coinomat/${path}.json`;

    if (fs.existsSync(filename)) {
        response_json = JSON.parse(fs.readFileSync(filename, 'utf8')) || '';
    }

    if (path === 'rate.php') {
        const data = qs.parse(url.query);
        response_json = (data.amount * 0.32258064) as any;
    }

    const cType = 'application/json; charset=utf-8;';
    res.setHeader('Content-Type', cType);
    res.end(JSON.stringify(response_json));
    return false;
}

interface IRequestData {
    platform: TPlatform;
    connection: TConnection;
    build: TBuild;
}
